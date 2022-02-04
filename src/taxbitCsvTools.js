const { NETWORKS } = require('./networks');

function createRow({
  transaction,
  isNativeEthTransaction,
  address
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
  address = address.toLowerCase();
  network = network.toLowerCase();
  // I also need a wasy to know if the transaction was cancelled or not
  // isError seems to be incorrect and diggin on arbiscans api i found non of the apis told me. It might be a bug in the api.
  // I know the info would be retrievable by scrapping but i dont want to do that. Might just need to report it to the arbiscan folks.
  let row
  if(isNativeEthTransaction) {
    const sentValue = from === address ? value / (Math.pow(10,18)) : null
    const recivedValue = to === address ? value / (Math.pow(10,18)) : null
    row = {
      'Date and Time': new Date(timeStamp*1000).toISOString().split('.')[0],
      //Buy, Transfer In, Trade, Transfer Out, Sale, Income, Expense
      'Transaction Type': to === address ? 'Transfer In' : 'Transfer Out',// this will need some updating
      'Sent Quantity': sentValue,
      'Sent Currency': from === address ? coin_symbol : null,
      'Sending Source': `Metamask ${network} ${coin_symbol}`,
      'Received Quantity': recivedValue,
      'Received Currency': to === address ? coin_symbol : null,
      'Receiving Destination': `Metamask ${network} ${coin_symbol}`,
      'Fee': (gasPrice*gasUsed)/Math.pow(10,18), //18 is the number of decimal places in ether
      'Fee Currency': coin_symbol,
      'Exchange Transaction ID': null,
      'Blockchain Transaction Hash': hash,
    }
  }
  
  if (isNativeEthTransaction && to === '0x000000000000000000000000000000000000006e') {
    row = {
      'Date and Time': new Date(timeStamp*1000).toISOString().split('.')[0],
      //Buy, Transfer In, Trade, Transfer Out, Sale, Income, Expense
      'Transaction Type': 'Transfer In',
      'Sent Quantity': null,
      'Sent Currency': null,
      'Sending Source': `Metamask ${network} ${coin_symbol}`,
      'Received Quantity': value / (Math.pow(10,18)),
      'Received Currency': coin_symbol,
      'Receiving Destination': `Metamask ${network} ${coin_symbol}`,
      'Fee': null,
      'Fee Currency': coin_symbol,
      'Exchange Transaction ID': null,
      'Blockchain Transaction Hash': hash,
    }
  }

  if(!isNativeEthTransaction) {
    const sentValue = from === address ? value / (Math.pow(10,tokenDecimal)) : null
    const recivedValue = to === address ? value / (Math.pow(10,tokenDecimal)) : null
    row = {
      'Date and Time': new Date(timeStamp*1000).toISOString().split('.')[0],
      //Buy, Transfer In, Trade, Transfer Out, Sale, Income, Expense
      'Transaction Type': to === address ? 'Transfer In' : 'Transfer Out',
      'Sent Quantity': sentValue,
      'Sent Currency': from === address ? tokenSymbol : null,
      'Sending Source': `Metamask ${network} ${tokenName}`,
      'Received Quantity': recivedValue,
      'Received Currency': to === address ? tokenSymbol : null,
      'Receiving Destination': `Metamask ${network} ${tokenName}`,
      'Fee': null,
      'Fee Currency': coin_symbol,
      'Exchange Transaction ID': null,
      'Blockchain Transaction Hash': hash,
    }
  }
  return row
}

function transactionsToRows (transactions, address) {
  return transactions.reduce((agg,transaction) => {
    
    agg.push(createRow({
      transaction,
      isNativeEthTransaction: true,
      address
    }))
    transaction?.multicallTransactions?.forEach?.(multicallTransaction => {
      agg.push(createRow({
        transaction: multicallTransaction,
        isNativeEthTransaction: false,
        address
      }))
    })

    return agg
  },[])
}

module.exports = {
  transactionsToRows,
  createRow
}