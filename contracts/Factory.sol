// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./MultiSigWallet.sol";

contract Factory {
   event WalletCreated(uint indexed _index);
   
   MultiSigWallet[] public walletArray;

   function createNewWallet(address[] memory _addresses, uint _quorem) public {
     MultiSigWallet wallet = new MultiSigWallet(_addresses, _quorem);
     uint _index = walletArray.length;
     walletArray.push(wallet);
      emit WalletCreated(_index);
   }

    function getWalletList() public view returns (address[] memory) {
    address[] memory list = new address[](walletArray.length); 
    for(uint i=0; i < walletArray.length; i++){ 
        list[i] = payable(address(walletArray[i])); 
     } 
    return list;
   }
}