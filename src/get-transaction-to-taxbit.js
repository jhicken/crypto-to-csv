// TODO: clean out failed transactions
// TODO: Add ETH mainnet optimism maybe solona
// TODO: Find swap contracts and combine swap transactions this could be done by knowing uniswap swap addresses or by making a guess looking at the in and outs on transactions.
// TODO: fix token transactions that seem to be missing from the list of full transactions (It might just be that they should be added to the list.)

require('dotenv').config();
const { parse } = require('json2csv');
const fs = require('fs');
const { transactionsToRows } = require('./taxbitCsvTools')
const { getAllNetworkTransactionsFromAddresses } = require('./getTransactions');

async function ConvertToCSVAndWrite(transactions, writeFile, addresses) {
  const csv = parse(transactionsToRows(transactions), {});
  console.log(csv);
  if (writeFile) {
    fs.writeFileSync(
      `transactions-${addresses.join('-')}.csv`,
      csv
    );
  }
  return csv
}

async function start(){
  const addresses = process.env.USER_ADDRESS.split(' ');
  const transactions = await getAllNetworkTransactionsFromAddresses(addresses);
  ConvertToCSVAndWrite(transactions, true, addresses);
}

module.exports = {
  start
}