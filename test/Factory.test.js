const { expect } = require("chai");
const hre = require("hardhat");
const { ethers } = hre;

describe("Factory Contract", function () {
  let walletFactory;
  let deployer, wallet1, wallet2;
  describe("Deploying contracts", function () {
    it("will Emit Event", async function () {
      [deployer, wallet1, wallet2] = await ethers.getSigners();
      const WalletFactory = await ethers.getContractFactory("Factory");
      walletFactory = await WalletFactory.deploy();
      await walletFactory.waitForDeployment();
      console.log(
        `walletFactory deployed to ${await walletFactory.getAddress()}`
      );

      await expect(
        walletFactory.createNewWallet(
          [deployer.address, wallet1.address, wallet2.address],
          2
        )
      )
        .to.emit(walletFactory, "WalletCreated")
        .withArgs(0);
    });
    it("will Emit Event With Index Equal 2", async function () {
      await expect(
        walletFactory.createNewWallet(
          [deployer.address, wallet1.address, wallet2.address],
          3
        )
      )
        .to.emit(walletFactory, "WalletCreated")
        .withArgs(1);
    });
    it("getWalletList will return array of addresses", async function () {
      //   console.log(await walletFactory.getWalletList());
      expect(await walletFactory.getWalletList()).to.deep.equal([
        "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be",
        "0xB7A5bd0345EF1Cc5E66bf61BdeC17D2461fBd968",
      ]);
    });
  });
});
