# Multi Sig Wallet Project

This project consists of 2 smart contracts developed under the hardhat framework. It comes with the basic multi sig wallet contract, a factory contract, tests for both smart contracts, and some scripts to deploy to the blockchain network.

## Install All Dependencies

`npm install`

## Specify the .env Global Variables

```shell
REACT_APP_PRIVATE_KEY="XXXXXXXXXXXXXXXXXXXX"
ETHERSCAN_API_KEY="XXXXXXXXXXXXXXXXXXXX"
```

The private key will be used for deployed the smart contracts. Be sure to provide a wallet loaded with the native token when deploying to mainnet/testnet. The etherscan key will be used for verification at etherscan.

## Compile Smart Contracts

`npx hardhat compile`
The compiled smart contracts and abis are stored on the following paths as specified in the hardhat.config.js. Create a frontend folder and git clone the [frontend github project](https://github.com/warrenseah/multi-sig-wallet-frontend) into the frontend folder.

```shell
paths: {
    artifacts: "./frontend/src/artifacts",
  }
```

Try running some of the following tasks:

## Create Local Blockchain

`npx hardhat node`
It may be required to change the chainId in the metamask to have the injected metamask running on the hardhat local node. In this hardhat project, the chainId is set

```shell
hardhat: {
      chainId: 31337,
    },
```

## Deploy Contract to Local Blockchain

`npx hardhat run scripts/deployFactory.js --network localhost`

## Get Deployed Multi Sig Contract Address From Factory

`npx hardhat run scripts/getAddrFromFactory.js --network localhost`

## Test

```shell
npx hardhat test
npx hardhat coverage
```

Make sure that the smart contracts have no error.

## Hardhat Tasks

`npx hardhat getAddresses YOUR_FACTORY_DEPLOY_ADDRESS --network localhost`
This command will retrieved the list of deployed multi sig wallet smart contracts from the provided factory address.

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

# multi-sig-wallet
