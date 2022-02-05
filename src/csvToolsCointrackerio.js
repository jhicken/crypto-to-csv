const { NETWORKS } = require('./networks');

function createRow({
  transaction,
  isNativeCoinTransaction,
}) {
  let {
    hash,
    from,
    to,
    value,
    gasPrice,
    gasUsed,
    timeStamp,
    tokenDecimal,
    tokenName,
    tokenSymbol,
    network,
    transactionAddress,
    isError,
    txreceipt_status,
    contractAddress,
    cumulativeGasUsed,
    gasLimit,
    confirmations,
    isErrorMessage,
    isErrorCode,
    isErrorData
  } = transaction;
  const coin_symbol = NETWORKS[network].COIN_SYMBOL;
  from = from.toLowerCase();
  to = to.toLowerCase();
  address = transactionAddress.toLowerCase();
  network = network.toLowerCase();

  let date = new Date(timeStamp*1000)
  date = (
    `${
    (date.getMonth()+1).toString().padStart(2, '0')}/${
    date.getDate().toString().padStart(2, '0')}/${
    date.getFullYear().toString().padStart(4, '0')} ${
    date.getHours().toString().padStart(2, '0')}:${
    date.getMinutes().toString().padStart(2, '0')}:${
    date.getSeconds().toString().padStart(2, '0')}`
  )

  // I also need a wasy to know if the transaction was cancelled or not
  // isError seems to be incorrect and diggin on arbiscans api i found non of the apis told me. It might be a bug in the api.
  // I know the info would be retrievable by scrapping but i dont want to do that. Might just need to report it to the arbiscan folks.
  let row
  if(isNativeCoinTransaction) {
    const sentValue = from === address ? value / (Math.pow(10,18)) : null
    const recivedValue = to === address ? value / (Math.pow(10,18)) : null
    row = {
      'Date': date,
      'Received Quantity': recivedValue,
      'Received Currency': to === address ? coin_symbol : null,
      'Sent Quantity': sentValue,
      'Sent Currency': from === address ? coin_symbol : null,
      'Fee Amount': (gasPrice*gasUsed)/Math.pow(10,18), //18 is the number of decimal places in ether
      'Fee Currency': coin_symbol,
      'Tag': null
    }
  }
  
  if (isNativeCoinTransaction && to === '0x000000000000000000000000000000000000006e') {
    row = {
      'Date': date,
      'Received Quantity': value / (Math.pow(10,18)),
      'Received Currency': coin_symbol,
      'Sent Quantity': null,
      'Sent Currency': null,
      'Fee Amount': 0,
      'Fee Currency': coin_symbol,
      'Tag': null
    }
  }

  if(!isNativeCoinTransaction) {
    const sentValue = from === address ? value / (Math.pow(10,tokenDecimal)) : null
    const recivedValue = to === address ? value / (Math.pow(10,tokenDecimal)) : null
    row = {
      'Date': date,
      'Received Quantity': recivedValue,
      'Received Currency': to === address ? tokenSymbol : null,
      'Sent Quantity': sentValue,
      'Sent Currency': from === address ? tokenSymbol : null,
      'Fee Amount': 0,
      'Fee Currency': coin_symbol,
      'Tag': null
    }
  }
  return row
}

function transactionsToRows (transactions) {
  return transactions.reduce((agg,transaction) => {
    
    agg.push(createRow({
      transaction,
      isNativeCoinTransaction: true,
    }))
    transaction?.multicallTransactions?.forEach?.(multicallTransaction => {
      agg.push(createRow({
        transaction: multicallTransaction,
        isNativeCoinTransaction: false,
      }))
    })

    return agg
  },[])
}

module.exports = {
  transactionsToRows,
  createRow
}
