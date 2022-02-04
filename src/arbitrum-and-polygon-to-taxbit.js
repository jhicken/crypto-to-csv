// TODO: clean out failed transactions
// TODO: Add ETH mainnet optimism maybe solona
// TODO: Find swap contracts and combine swap transactions this could be done by knowing uniswap swap addresses or by making a guess looking at the in and outs on transactions.
// TODO: fix token transactions that seem to be missing from the list of full transactions (It might just be that they should be added to the list.)

require('dotenv').config();
const axios = require("axios");
const { parse } = require('json2csv');
const fs = require('fs');
const { transactionsToRows } = require('./taxbitCsvTools')
const {
  NETWORK_KEYS,
  NETWORKS
} = require('./networks');




async function getTransactionDataByAddressAndNetwork({
  address,
  network,
  addNFTData
}) {

  let NFTTransactions

  const tokensTransactions = (
    await axios.get(`${NETWORKS[network].HOST}/api?module=account&action=tokentx&address=${address}&startblock=1&endblock=99999999&sort=asc&apikey=${NETWORKS[network].API_KEY}`)
  ).data.result;
  const transactions = (
    await axios.get(`${NETWORKS[network].HOST}/api?module=account&action=txlist&address=${address}&startblock=1&endblock=99999999&sort=asc&apikey=${NETWORKS[network].API_KEY}`)
  ).data.result;

  tokensTransactions.forEach(tokenTransaction => {
    const fullTransaction = transactions.find((transaction) => {
      return transaction.hash === tokenTransaction.hash;
    })
    if(fullTransaction) {
      fullTransaction.multicallTransactions = fullTransaction.multicallTransactions || [];
      tokenTransaction.network = network;
      fullTransaction.multicallTransactions.push(tokenTransaction);
    } else {
      console.warn(`No full transaction found for Token ${tokenTransaction.hash} on ${network}`);
    }
  })

  if(addNFTData) {
    NFTTransactions = (
      await axios.get(`${NETWORKS[network].HOST}/api?module=account&action=tokennfttx&address=0xfc734694337069a7b838264cea7c469278a82b80&startblock=0&endblock=999999999&sort=asc`)
    ).data.result;

    NFTTransactions.forEach(NFTTransaction => {
      const fullTransaction = transactions.find((transaction) => {
        return transaction.hash === NFTTransaction.hash;
      })
      if(fullTransaction) {
        fullTransaction.multicallTransactions = fullTransaction.multicallTransactions || [];
        NFTTransaction.network = network;
        fullTransaction.multicallTransactions.push(NFTTransaction);
      } else {
        console.warn(`No full transaction found for NFT transaction ${NFTTransaction.hash} on ${network}`);
      }
    })
  }


  return transactions.map((transaction)=>{
    transaction.network = network
    return transaction;
  });
}



//sort by date
function sortByDate(a,b) {
  return new Date(a.timeStamp*1000) - new Date(b.timeStamp*1000)
}

async function getAllNetworkTransactions(address) {
  const allTransactions = (await Promise.all(Object.keys(NETWORK_KEYS).map(async(network)=>{
    return await getTransactionDataByAddressAndNetwork({
      address,
      network
    });
  }))).flat().sort(sortByDate);

  const csv = parse(transactionsToRows(allTransactions, address), {});
  console.log(csv);
  fs.writeFileSync(
    `transactions-${address}.csv`,
    csv
  );
}

getAllNetworkTransactions(process.env.USER_ADDRESS);