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
      tokenTransaction.transactionAddress = address;
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



async function getAllNetworkTransactions(address) {
  const allTransactions = (await Promise.all(Object.keys(NETWORK_KEYS).map(async(network)=>{
    return await getTransactionDataByAddressAndNetwork({
      address,
      network
    });
  }))).flat().sort(sortByDate);

  return allTransactions;

}

async function getAllNetworkTransactionsFromAddresses(addresses) {

  let allTransactions = [];
  const fetchingFunctions = addresses.map((address)=>{
    return ()=> {
      return setTimeoutAsync(async ()=>{
        allTransactions.push(await getAllNetworkTransactions(address));
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