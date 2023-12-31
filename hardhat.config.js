require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("./tasks");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("@nomicfoundation/hardhat-verify");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_KEY}`,
      // TODO: Uncomment the below line after updating PRIVATE_KEY above
      accounts: [
        process.env.REACT_APP_PRIVATE_KEY,
        process.env.PRIVATE_KEY_ONE,
        process.env.PRIVATE_KEY_TWO,
      ],
    },
  },
  paths: {
    artifacts: "./frontend/src/artifacts",
  },
  gasReporter: {
    enabled: true,
    token: "ETH",
    currency: "USD",
    gasPrice: 48,
    gasPriceApi:
      "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    coinmarketcap: process.env.COINMARKETCAP_KEY,
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
