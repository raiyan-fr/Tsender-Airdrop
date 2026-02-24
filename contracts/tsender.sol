// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ITsender} from "./interface/ITsender.sol";

contract Tsender is ITsender {
    // Custom Errors for gas-efficient reverting
    error Tsender__InvalidToken();
    error Tsender__LengthsDontMatch();
    error Tsender__TransferFailed();
    error Tsender__ZeroAddress();
    error Tsender__TotalDoesntAddUp();

// Airdrops ERC20 tokens to a list of users
    function airdropERC20(
        address tokenAddress,
        address[] calldata recipients,
        uint256[] calldata amounts,
        uint256 totalAmount 
    ) external {
        // 1. Input Validation
        if (tokenAddress == address(0)) revert Tsender__InvalidToken();
        if (recipients.length != amounts.length) revert Tsender__LengthsDontMatch();
        if (recipients.length == 0) revert Tsender__ZeroAddress();
        // 2. Token Acquisition: Pull tokens from the caller (msg.sender)
        // NOTE: Caller must have called approve() first!
        bool success = IERC20(tokenAddress).transferFrom(msg.sender, address(this), totalAmount);
        if (!success) revert Tsender__TransferFailed();

        uint256 actualTotal;
        // 3. Distribution Loop
        for (uint256 i; i < recipients.length; i++) {
            // Sum up the amounts
            actualTotal += amounts[i];
            
            // Send token from THIS contract's balance to the recipient
            IERC20(tokenAddress).transfer(recipients[i], amounts[i]);
        }
        // 4. Final Verification
        if (actualTotal != totalAmount) revert Tsender__TotalDoesntAddUp();

    }

// Checks the list validity for the frontend/off-chain use.
    function areListsValid(
        address[] calldata recipients, 
        uint256[] calldata amounts
        ) external pure returns (bool) {
        if (recipients.length == 0 || recipients.length != amounts.length) {
            return false;
        }

        // Check for zero address, zero amount, and duplicates
        for (uint256 i; i < recipients.length; i++) {
            if (recipients[i] == address(0) || amounts[i] == 0) {
                return false;
            }
            // Check for duplicates
            for (uint256 j = i + 1; j < recipients.length; j++) {
                if (recipients[i] == recipients[j]) {
                    return false;
                }
            }
        }
        return true;
    }
}

// AirdropERC20 -> tokenAddress -> Raitoken.sol address
// recipients -> ["0x00..","0x00.."]
// amounts -> [1000,2000]
// totalAmount -> 3000