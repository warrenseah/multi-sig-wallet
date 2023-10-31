const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const hre = require("hardhat");
const { ethers } = hre;

describe("MultiEtherWallet", function () {
  let sigWallet;
  let deployer, wallet1, wallet2, wallet3;
  let sigWalletSign, sigWallet1, sigWallet2, sigWallet3;

  async function deployContractsFixture() {
    [deployer, wallet1, wallet2, wallet3] = await ethers.getSigners();
    const SigWallet = await ethers.getContractFactory("MultiSigWallet");
    sigWallet = await SigWallet.deploy(
      [deployer.address, wallet1.address, wallet2.address],
      2
    );
    await sigWallet.waitForDeployment();

    sigWalletSign = sigWallet.connect(deployer);
    sigWallet1 = sigWallet.connect(wallet1);
    sigWallet2 = sigWallet.connect(wallet2);
    sigWallet3 = sigWallet.connect(wallet3);
  }

  describe("Deploying contracts", function () {
    it("check constructor arguements", async function () {
      await loadFixture(deployContractsFixture);
      expect(await sigWallet.owners(0)).to.equal(deployer.address);
      expect(await sigWallet.owners(1)).to.equal(wallet1.address);
      expect(await sigWallet.owners(2)).to.equal(wallet2.address);
      expect(await sigWallet.quoremRequired()).to.equal(2);

      // Check isOwner mapping
      expect(await sigWallet.isOwner(deployer.address)).to.be.true;
      expect(await sigWallet.isOwner(wallet1.address)).to.be.true;
      expect(await sigWallet.isOwner(wallet2.address)).to.be.true;
      expect(await sigWallet.isOwner(wallet3.address)).to.be.false;
    });

    it("should not deploy with eth 0 address", async function () {
      const faultyAddress = ethers.ZeroAddress;
      const SigWallet = await ethers.getContractFactory("MultiSigWallet");
      await expect(
        SigWallet.deploy([deployer.address, wallet1.address, faultyAddress], 2)
      ).to.be.revertedWith("invalid owner");
    });
    it("should not deploy with duplicate addresses", async function () {
      const SigWallet = await ethers.getContractFactory("MultiSigWallet");
      await expect(
        SigWallet.deploy(
          [deployer.address, wallet1.address, wallet1.address],
          2
        )
      ).to.be.revertedWith("owner not unique");
    });
    it("should not deploy with zero quorumRequired", async function () {
      const SigWallet = await ethers.getContractFactory("MultiSigWallet");
      await expect(
        SigWallet.deploy(
          [deployer.address, wallet1.address, wallet2.address],
          0
        )
      ).to.be.revertedWith("invalid number of required quorum");
    });
    it("should not deploy with quorumRequired greater than no of owners", async function () {
      const SigWallet = await ethers.getContractFactory("MultiSigWallet");
      await expect(
        SigWallet.deploy(
          [deployer.address, wallet1.address, wallet2.address],
          4
        )
      ).to.be.revertedWith("invalid number of required quorum");
    });
  });

  describe("Getters Functions", function () {
    it("should get all owners", async function () {
      expect(await sigWalletSign.getOwners()).to.eql([
        deployer.address,
        wallet1.address,
        wallet2.address,
      ]);
    });

    it("should get zero withdrawals", async function () {
      expect(await sigWallet.getWithdrawTxes()).to.be.empty;
      expect(await sigWallet.getWithdrawTxCount()).to.equal(0);
    });
  });

  describe("Create Withdrawal Functions", async function () {
    const withdrawAmt = ethers.parseEther("0.5");

    it("should deposit and emit events with normal txn", async function () {
      const rec = await sigWallet.getAddress();
      const depositAmt = ethers.parseEther("1");
      const wrongDepositAmt = ethers.parseEther("2");
      await loadFixture(deployContractsFixture);
      const txn = {
        to: rec,
        value: depositAmt,
      };
      await expect(wallet1.sendTransaction(txn))
        // .to.changeEtherBalance(wallet1, `-${depositAmt}`)
        .to.emit(sigWallet, "Deposit")
        .withArgs(wallet1.address, depositAmt, depositAmt);
      expect(await sigWallet.balanceOf()).to.equal(depositAmt);
    });

    it("should deposit and emit events", async function () {
      const depositAmt = ethers.parseEther("1");
      const wrongDepositAmt = ethers.parseEther("2");
      await loadFixture(deployContractsFixture);
      await expect(sigWallet1.deposit({ value: depositAmt }))
        // .to.changeEtherBalance(wallet1, `-${depositAmt}`)
        .to.emit(sigWallet, "Deposit")
        .withArgs(wallet1.address, depositAmt, depositAmt);
      expect(await sigWallet.balanceOf()).to.equal(depositAmt);
    });

    it("should not create withdraw txn calling from a non owner", async function () {
      await expect(
        sigWallet3.createWithdrawTx(wallet3.address, withdrawAmt)
      ).to.be.revertedWith("Address must be one of the owners");
    });
    it("should create a withdraw txn", async function () {
      await expect(sigWalletSign.createWithdrawTx(wallet3.address, withdrawAmt))
        .to.emit(sigWallet, "CreateWithdrawTx")
        .withArgs(deployer.address, "0", wallet3.address, withdrawAmt);
      expect(await sigWallet.getWithdrawTxCount()).to.equal("1");
      expect(await sigWallet.getWithdrawTx(0)).to.deep.equal([
        wallet3.address,
        withdrawAmt,
        "0",
        false,
      ]);
      expect(await sigWallet.getWithdrawTxes()).to.deep.equal([
        [wallet3.address, withdrawAmt, "0", false],
      ]);
    });
  });

  describe("Approving txns", async function () {
    const withdrawAmt = ethers.parseEther("0.5");
    it("should revert if caller by a non-owner", async function () {
      await expect(sigWallet3.approveWithdrawTx(0)).to.revertedWith(
        "Address must be one of the owners"
      );
      expect(await sigWallet.isApproved(0, wallet3.address)).to.be.false;
    });
    it("should revert if txnIndex is non-existent", async function () {
      await expect(sigWalletSign.approveWithdrawTx(1))
        .to.be.revertedWithCustomError(sigWallet, "TxNotExists")
        .withArgs("1");
      expect(await sigWallet.isApproved(0, deployer.address)).to.be.false;
    });
    it("should approve txn with addition approvals by 1", async function () {
      await sigWalletSign.approveWithdrawTx(0);
      expect(await sigWallet.isApproved(0, deployer.address)).to.be.true;
      const txn = await sigWallet.getWithdrawTx(0);
      expect(txn[2]).to.equal("1");
      expect(txn[3]).to.be.false;
    });
    it("should approve txn and txn withdrawn after second approver", async function () {
      await expect(sigWallet1.approveWithdrawTx(0))
        // .to.changeEtherBalance(wallet3, `${ethers.parseEther("0.5")}`)
        .to.emit(sigWallet, "ApproveWithdrawTx")
        .withArgs(wallet1.address, 0);
      const txn = await sigWallet.getWithdrawTx(0);
      expect(txn[2]).to.equal("2");
      expect(txn[3]).to.be.true;
      expect(await sigWallet.isApproved(0, wallet1.address)).to.be.true;
    });
    it("should revert if txn has already been approved", async function () {
      await expect(sigWallet2.approveWithdrawTx(0))
        .to.be.revertedWithCustomError(sigWallet, "TxAlreadySent")
        .withArgs("0");
    });
  });
});
