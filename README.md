## Info

The idea with this tool is that you can use it to connect to block explorers using their apis. And grab your full list of transactions. Then convert that list of transactions to rows in a csv importable by one of the crypto tax software tools. In this case I personally have already paid for taxbit. But I dont think it should be very difficult to add other csv conversions. Open a PR or an issue if your interested.

Networks: Right now the only supported networks are `arbitrum` and `polygon`. I would like to add mainnet eth and maybe optimism, solona, bitcoin, ect...

Tax Platforms: `Taxbit` is all that is currenlty working right now. I may do cointracker.io next.

So I started this project after using `coinpanda.io` and finding that they messed up a ton of transactions that I imported and they refused to help or refund me. As they were the only tax platform that connected directly to the arbitrum network, doing it manually is what I am left with. 

## Install

1. run `npm ci`
2. copy `.env.template` -> `.env`
3. create accounts with the block exlporers (urls are in the `.env`)
4. create api keys
5. add api keys to `.env`
6. add public wallet to `.env`

## Startup

run `npm run start`


## Notes

After running the script a new csv file will be left in the root of this projects directory called `transactions-<youraddress>.csv` this is in the `taxbit` format.

## Disclamer

There are some bugs still so use at your own risk.