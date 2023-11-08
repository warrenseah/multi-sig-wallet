// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./MultiSigWallet.sol";

contract Factory {
   MultiSigWallet[] public walletArray;

   function CreateNewWallet(address[] memory _addresses, uint _quorem) public {
     MultiSigWallet wallet = new MultiSigWallet(_addresses, _quorem);
     walletArray.push(wallet);
   }

   function wfGetter(uint _index) public view returns (address[] memory) {
    return MultiSigWallet(payable(address(walletArray[_index]))).getOwners();
   }
}