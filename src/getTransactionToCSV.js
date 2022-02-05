// TODO: clean out failed transactions
// TODO: Add ETH mainnet optimism maybe solona
// TODO: Find swap contracts and combine swap transactions this could be done by knowing uniswap swap addresses or by making a guess looking at the in and outs on transactions.
// TODO: fix token transactions that seem to be missing from the list of full transactions (It might just be that they should be added to the list.)

require('dotenv').config();
const { parse } = require('json2csv');
const fs = require('fs');
const { transactionsToRows: taxbitTransactionsToRows } = require('./csvToolsTaxbit')
const { transactionsToRows: cointrackerioTransactionsToRows } = require('./csvToolsCointrackerio')
const { getAllNetworkTransactionsFromAddresses } = require('./getTransactions');
const { TAX_TRACKERS } = require('./taxTrackingSystems');

async function convertToCSVAndWrite({
  transactions,
  writeFile,
  addresses,
  taxTracker
}) {
  let rows = []
  if (taxTracker === TAX_TRACKERS.COINTRACKER_IO) {
    rows = cointrackerioTransactionsToRows(transactions)
  } else if (taxTracker === TAX_TRACKERS.TAXBIT) {
    rows = taxbitTransactionsToRows(transactions)
  } else {
    console.error('Tax tracker not provided');
  }

  const csv = parse(rows, {});
  console.log(csv);
  if (writeFile) {
    fs.writeFileSync(
      `transactions-${addresses.join('-')}.csv`,
      csv
    );
  }
  return csv
}

async function start(addresses, taxTracker){
  addresses = addresses || process.env.USER_ADDRESS.split(' ');
  taxTracker = taxTracker || TAX_TRACKERS.TAXBIT
  const transactions = await getAllNetworkTransactionsFromAddresses(addresses);
  convertToCSVAndWrite({
    transactions,
    writeFile: true,
    addresses,
    taxTracker
  });
}

module.exports = {
  start
}