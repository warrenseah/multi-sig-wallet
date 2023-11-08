const { task } = require("hardhat/config");

task("getAddress", "Retrieve address from factory deployed contract")
  .addPositionalParam("walletIndex")
  .setAction(async (taskArgs, hre) => {
    console.log(taskArgs);
    const walletFactory = await hre.ethers.getContractAt(
      "Factory",
      "0x8464135c8F25Da09e49BC8782676a84730C318bC"
    );
    const result = await walletFactory.wfGetter(taskArgs?.walletIndex);
    console.log(result);
  });
