// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RaiTKN is ERC20, Ownable {
    constructor() ERC20("Raik Coin", "RKC") Ownable(msg.sender) {
        // Mint a Thousand tokens with 18 decimals to the contract owner
        _mint(msg.sender, 1000 * 10 ** 18); 
    }  

    // Function to mint new tokens  
    function MintTokens(uint256 amount) public onlyOwner {
        _mint(msg.sender, amount);
    }  

    // function to burn tokens 
    function BurnTokens(uint256 amount) public {
        require(balanceOf(msg.sender) >= amount, "You do not have enough Raik coin to burn");
        _burn(msg.sender, amount);
    }
}
     

// approve-> spender-> Tsender.sol contract address and total 
//        -> value-> Total supply