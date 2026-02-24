// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface ITsender {
    // The main token distribution function
    function airdropERC20(
        address tokenAddress,
        address[] calldata recipients,
        uint256[] calldata amounts,
        uint256 totalAmount
    ) external;

    // The off-chain validation function
    function areListsValid(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external view returns (bool);
}


// We are creating ITSender.sol interface for TSender.sol contract for two main reasons:
// Blueprint Enforcement and External Interaction/Flexibility