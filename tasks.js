const { task } = require("hardhat/config");

task("getAddresses", "Retrieve address from factory deployed contract")
  .addPositionalParam("address")
  .setAction(async (taskArgs, hre) => {
    // console.log(taskArgs);
    const walletFactory = await hre.ethers.getContractAt(
      "Factory",
      taskArgs?.address
    );
    const result = await walletFactory.getWalletList();
    console.log(result);
  });
