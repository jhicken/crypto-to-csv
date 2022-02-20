const axios = require("axios");
const {
  sortByDate,
  setTimeoutAsync,
  runSerial
} = require('./utils');
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

  console.log(`Fetching Transactions for ${address} on ${network}`);
  const tokensTransactions = (
    await axios.get(`${NETWORKS[network].HOST}/api?module=account&action=tokentx&address=${address}&startblock=1&endblock=99999999&sort=asc&apikey=${NETWORKS[network].API_KEY}`)
  ).data.result;
  console.log(`Fetching Tokens transactions for ${address} on ${network}`);
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
      tokenTransaction.transactionAddress = address;
      fullTransaction.multicallTransactions.push(tokenTransaction);
    } else {
      console.warn(`No full transaction found for Token ${tokenTransaction.hash} on ${network}`);
    }
  })

  if(addNFTData) {
    console.log(`Fetching NFT data for ${address} on ${network}`);
    NFTTransactions = (
      await axios.get(`${NETWORKS[network].HOST}/api?module=account&action=tokennfttx&address=${address}&startblock=0&endblock=999999999&sort=asc&apikey=${NETWORKS[network].API_KEY}`)
    ).data.result;

    if(typeof NFTTransactions.forEach !== 'function') {
      console.log(network,NFTTransactions)
      return;
    }

    NFTTransactions.forEach(NFTTransaction => {
      const fullTransaction = transactions.find((transaction) => {
        return transaction.hash === NFTTransaction.hash;
      })
      if(fullTransaction) {
        fullTransaction.multicallTransactions = fullTransaction.multicallTransactions || [];
        NFTTransaction.network = network;
        NFTTransaction.transactionAddress = address;
        fullTransaction.multicallTransactions.push(NFTTransaction);
      } else {
        console.warn(`No full transaction found for NFT transaction ${NFTTransaction.hash} on ${network}`);
      }
    })
  }


  return transactions.map((transaction)=>{
    transaction.network = network
    transaction.transactionAddress = address;
    return transaction;
  });
}



async function getAllNetworkTransactions(address, addNFTData) {
  const allTransactions = (await Promise.all(Object.keys(NETWORK_KEYS).map(async(network)=>{
    return await getTransactionDataByAddressAndNetwork({
      address,
      network,
      addNFTData
    });
  }))).flat().sort(sortByDate);

  return allTransactions;

}

async function getAllNetworkTransactionsFromAddresses(addresses,addNFTData) {

  let allTransactions = [];
  const fetchingFunctions = addresses.map((address)=>{
    return ()=> {
      return setTimeoutAsync(async ()=>{
        allTransactions.push(await getAllNetworkTransactions(address,addNFTData));
      },1000)
    }
  })

  return runSerial(fetchingFunctions).then(()=>{
    return allTransactions.flat().sort(sortByDate);
  });
}

module.exports = {
  getTransactionDataByAddressAndNetwork,
  getAllNetworkTransactions,
  getAllNetworkTransactionsFromAddresses
}