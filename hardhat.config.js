require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("./tasks");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.17",
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
      accounts: [process.env.REACT_APP_PRIVATE_KEY],
    },
  },
  paths: {
    artifacts: "./frontend/src/artifacts",
  },
};
