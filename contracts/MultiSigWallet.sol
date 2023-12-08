// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/* TODO: Use custom error type to define an error called "TxNotExists" that takes the argument "transactionIndex"
         This error will be thrown whenever the user tries to approve a transaction that does not exist.
*/
error TxNotExists(uint transactionIndex);

/* TODO: Use custom error type to define an error called "TxAlreadyApproved" that takes the argument "transactionIndex"
         This error will be thrown whenever the user tries to approve a transaction that has already been approved.
*/
error TxAlreadyApproved(uint transactionIndex);

/* TODO: Use custom error type to define an error called "TxAlreadySent" that takes the argument "transactionIndex"
         This error will be thrown whenever the user tries to approve a transaction that has already been sent.
*/
error TxAlreadySent(uint transactionIndex);


contract MultiSigWallet {
    // TODO: Declare an event called "Deposit" that will be emitted whenever the smart contract receives some ETH
    event Deposit(address indexed sender, uint amount, uint balance);

    /* TODO: Declare an event called "CreateWithdrawTx" that will be emitted whenever one of the owners tries to
             initiates a withdrawal of ETH from the smart contract
    */
    event CreateWithdrawTx(address indexed owner, uint indexed transactionindex, address indexed to, uint amount);

    /* TODO: Declare an event called "ApproveWithdrawTx" that will be emitted whenever one of the owners tries to
             approve an existing withdrawal transaction
    */
    event ApproveWithdrawTx(address indexed owner, uint indexed transactionIndex);

    // TODO: Declare an array to keep track of owners
    address[] public owners;

    /* TODO: Declare a mapping called "isOwner" from address -> bool that will let us know whether a praticular address is one of the
             owners of the multisig smart contract wallet
    */
    mapping(address => bool) public isOwner;

    // TODO: Initialize an integer called "quoremRequired" to keep track of the total number of quorum required to approve a withdraw transaction
    uint immutable public quoremRequired;

    /* TODO: Declare a struct called "WithdrawTx" that will be used to keep track of withdraw transaction that owners create. This
             struct will define four properties:
             1) Keep track of the receiver address called "to"
             2) Keep track of the amount of ETH to be withdrawn called "amount"
             3) Keep track of the current number of quorum reached called "approvals"
             4) Keep track of the status of the transaction whether it has been sent called "sent"
    */
    struct WithdrawTx{ address payable to; uint amount; uint approvals; bool sent; }

    /* TODO: Declare a mapping called "isApproved" that will keep track of whether a particular withdraw transaction has
             already been approved by the current caller. This is a mapping from transaction index => owner => bool
    */
    mapping(uint => mapping(address => bool)) public isApproved;

    // TODO: Declare an array of WithdrawTxstruct to keep track of the list of withdrawal transactions for this multisig wallet
    WithdrawTx[] public withdrawals;

    /* TODO: Declare a constructor that takes in a list of owners for the wallet and the total number of quorum that
           will be required for withdrawal to be confirmed.
 
      The constructor should do the following:
      - Ensure there is at least one owner
      - Ensure the quorum is greater than 0 but less than or equal to the number of owners
      - Ensure each owner is a valid owner(i.e. owner is not a zero address)
      - Ensure each owner is unique
    */
    constructor(address[] memory _owners, uint _quoremRequired) {
        require(_owners.length > 0, "owners required");
        require(
            _quoremRequired > 0 && _quoremRequired <= _owners.length,
            "invalid number of required quorum"
        );
        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];

            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }
        quoremRequired = _quoremRequired;
    }

    // TODO: Declare a function modifier called "onlyOwner" that ensures that the function caller is one of the owners of the wallet
    modifier onlyOwner() {
        require(isOwner[msg.sender] == true, "Address must be one of the owners");
        _;
    }

    // TODO: Declare a function modifier called "transactionExists" that ensures that transaction exists in the list of withdraw transactions
    modifier transactionExists(uint _transactionIndex) {
        if (_transactionIndex >= withdrawals.length) {
            revert TxNotExists(_transactionIndex);
        }
        _;
    }


    // TODO: Declare a function modifier called "transactionNotApproved" that ensures that transaction has not yet been approved
    modifier transactionNotApproved(uint _transactionIndex) {
        if (isApproved[_transactionIndex][msg.sender]) {
            revert TxAlreadyApproved(_transactionIndex);
        }
        _;
    }

    // TODO: Declare a function modifier called "transactionNotSent" that ensures that transaction has not yet been sent
    modifier transactionNotSent(uint _transactionIndex) {
        if(withdrawals[_transactionIndex].sent) {
            revert TxAlreadySent(_transactionIndex);
        }
        _;
    }

    /* TODO: Create a function called "createWithdrawTx" that is used to initiate the withdrawal 
             of ETH from the multisig smart contract wallet and does the following:
             1) Ensures that only one of the owners can call this function
             2) Create the new withdraw transaction(to, amount, approvals, sent) and add it to the list of withdraw transactions
             3) Emit an event called "CreateWithdrawTx"
    */

    function createWithdrawTx(address payable _to, uint _amount) external onlyOwner {
        WithdrawTx memory txn = WithdrawTx({ to: _to, amount: _amount, approvals: 0, sent: false });
        uint txnIndex = withdrawals.length;
        withdrawals.push(txn);
        emit CreateWithdrawTx(msg.sender, txnIndex, _to, _amount);
    }

    /* TODO: Create a function called "approveWithdrawTx" that is used to approve the withdraw a particular transaction
             based on the transactionIndex(this is the index of the array of withdraw transactions)
             This function does the following:
             1) Ensures that only one of the owners can call this function
             2) Ensures that the withdraw transaction exists in the array of withdraw transactions
             3) Ensures that the withdraw transaction has not been approved yet
             4) Ensures that the withdraw transaction has not been sent yet 
             5) Incremement the number of approvals for the given transaction
             6) Set the value of "isApproved" to be true for this transaction and for this caller
             7) If the numhber of approvals is greater than or equal to the number of quorum required, do the following:
                  - Set the value of "sent" of this withdraw transaction to be true
                  - Transfer the appropriate amount of ETH from the multisig wallet to the receiver
                  - Ensure that the transfer transaction was successful
                  - Emit an event called "ApproveWithdrawTx"
    */

    function approveWithdrawTx(uint _txnIndex) external onlyOwner transactionExists(_txnIndex) transactionNotApproved(_txnIndex) transactionNotSent(_txnIndex) {
        isApproved[_txnIndex][msg.sender] = true;
        WithdrawTx storage txn = withdrawals[_txnIndex];
        txn.approvals += 1;
        if(txn.approvals >= quoremRequired) {
            txn.sent = true;
            (bool success, ) = txn.to.call{value: txn.amount}("");
            require(success, "transaction failed");
            emit ApproveWithdrawTx(msg.sender, _txnIndex);
        }
    }

     /* TODO: Create a function called "deposit" that will handle the receiving of ETH to this multisig wallet 
             Make sure to emit an event called "Deposit"
    */
    function deposit() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    // TODO: You may also want to implement a special function called "receive" to handle the receiving of ETH if you choose
    // modifier onlyOwner()
    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    // TODO: Create a function called "getOwners" that retrieves the list of owners of the multisig wallet
    function getOwners() external view returns(address[] memory) {
        return owners;
    }

    /* TODO: Create a function called "getWithdrawTxCount" that retrieves the total number of 
             withdrawal transactions for the multisig  wallet
    */
    function getWithdrawTxCount() external view returns(uint) {
        return withdrawals.length;
    }


    /* TODO: Create a function called "getWithdrawTxes" that retrieves all the withdraw transactions
             for the multisig wallet
    */
    function getWithdrawTxes() external view returns(WithdrawTx[] memory) {
        return withdrawals;
    }

    /* TODO: Create a function called "getWithdrawTx" that returns the withdraw transaction details 
             according to the transaction index in the array of withdraw transactions 
    */
    function getWithdrawTx(uint txnIndex) external view transactionExists(txnIndex) returns(address, uint, uint, bool) {
        WithdrawTx memory withdrawTx = withdrawals[txnIndex];
        return (withdrawTx.to, withdrawTx.amount, withdrawTx.approvals, withdrawTx.sent);
    }

    // function deposit()
    // receive()
    // TODO: Create a function called "balanceOf" that gets the current amount of ETH in the multisig wallet
    // modifier onlyOwner()
    function balanceOf() external view returns(uint) {
        return address(this).balance;
    }

}