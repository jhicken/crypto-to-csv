require('dotenv').config();


const NETWORK_KEYS = {
  "POLYGON": 'POLYGON',
  "ARBITRUM": 'ARBITRUM',
}

const NETWORKS = {
  [NETWORK_KEYS.POLYGON]: {
    API_KEY: process.env.POLYGONSCAN_API_KEY,
    HOST: 'https://api.polygonscan.com',
    COIN_SYMBOL: 'MATIC'
  },
  [NETWORK_KEYS.ARBITRUM]: {
    API_KEY: process.env.ARBISCAN_API_KEY,
    HOST: 'https://api.arbiscan.io',
    COIN_SYMBOL: 'ETH'
  }
}

module.exports = {
  NETWORK_KEYS,
  NETWORKS,
}