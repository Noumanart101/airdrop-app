// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SecureMultiSender is Ownable, ReentrancyGuard {
    // Track balances to prevent fund locking
    mapping(address => mapping(address => uint256)) public balances;

    event TokensDeposited(
        address indexed token,
        address indexed sender,
        uint256 amount
    );
    event TokensWithdrawn(
        address indexed token,
        address indexed recipient,
        uint256 amount
    );
    event BatchSent(address indexed token, uint256 totalRecipients);

    error InvalidInput();
    error InsufficientBalance();
    error TransferFailed();

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Store tokens in contract for later distribution
     */
    function depositTokens(IERC20 token, uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidInput();

        bool success = token.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();

        emit TokensDeposited(address(token), msg.sender, amount);
        balances[address(token)][msg.sender] += amount;
    }

    /**
     * @dev Execute batch transfer using pull pattern
     */
    function multiSend(
        IERC20 token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyOwner nonReentrant {
        if (recipients.length != amounts.length) revert InvalidInput();
        if (recipients.length == 0) revert InvalidInput();

        uint256 totalAmount;
        uint256 recipientsLength = recipients.length;
        for (uint256 i = 0; i < recipientsLength; i++) {
            if (recipients[i] == address(0)) revert InvalidInput();
            totalAmount += amounts[i];
        }

        if (balances[address(token)][msg.sender] < totalAmount) {
            revert InsufficientBalance();
        }

        balances[address(token)][msg.sender] -= totalAmount;

        for (uint256 i = 0; i < recipientsLength; i++) {
            bool success = token.transfer(recipients[i], amounts[i]);
            if (!success) revert TransferFailed();
        }

        emit BatchSent(address(token), recipients.length);
    }

    /**
     * @dev Withdraw unused tokens (emergency use)
     */
    function withdrawTokens(IERC20 token) external nonReentrant {
        uint256 balance = balances[address(token)][msg.sender];
        if (balance == 0) revert InsufficientBalance();

        balances[address(token)][msg.sender] = 0;
        bool success = token.transfer(msg.sender, balance);
        if (!success) revert TransferFailed();

        emit TokensWithdrawn(address(token), msg.sender, balance);
    }
}
