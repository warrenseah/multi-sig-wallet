// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer, wallet1, wallet2] = await ethers.getSigners();

  const MultiEtherWallet = await hre.ethers.getContractFactory(
    "MultiSigWallet"
  );

  const multiEtherWallet = await MultiEtherWallet.deploy(
    [deployer.address, wallet1.address, wallet2.address],
    2
  );
  await multiEtherWallet.waitForDeployment();
  console.log(`EtherWallet deployed to ${await multiEtherWallet.getAddress()}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
