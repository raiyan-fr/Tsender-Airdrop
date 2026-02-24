# Tsender — Multi-Chain ERC-20 Token Airdrop Platform

A frontend-only dApp for efficient bulk ERC-20 token distribution, powered by Wagmi, RainbowKit, and the Tsender smart contract.

---

## 1. Web3 Provider & Wallet Setup

- Install and configure **@rainbow-me/rainbowkit**, **wagmi**, and **nextjs** as core Web3 dependencies
- Create a `Web3Provider` wrapper using `getDefaultConfig` from RainbowKit with multi-chain support
- Configure chains: **Ethereum Mainnet, Sepolia, Polygon, Arbitrum, Optimism, Base**, and other testnets
- RainbowKit provides a polished **Connect Wallet** button UI with support for MetaMask, WalletConnect, Coinbase Wallet, and more
- Wrap the entire app in `WagmiProvider` → `QueryClientProvider` → `RainbowKitProvider`

---

## 2. Dark Crypto Theme & Layout

- Apply a **dark crypto-themed** design system: deep backgrounds, neon/gradient accents (blues, purples, cyans), glowing card borders
- Update CSS variables for a dark-first palette
- **Single-page layout** with:
  - **Top navigation bar**: Logo/brand, network selector (from RainbowKit), Connect Wallet button
  - **Main content area**: The airdrop form in a centered card
  - **Footer**: Links, contract info
- Subtle animations and glassmorphism effects for a modern Web3 feel

---

## 3. Airdrop Form — Core UI

The main interface where users configure and execute airdrops:

- **Token Address Input**: Text field to paste the ERC-20 token contract address, with validation (valid Ethereum address format)
- **Token Info Display**: Once a valid token address is entered, automatically fetch and display the token **name, symbol, decimals, and user's balance** using wagmi's `useReadContract` hooks
- **Recipient Input** — Two modes via tabs:
  - **Manual Entry (Text Area)**: Paste comma-separated or newline-separated `address,amount` pairs
  - **CSV Upload**: Drag-and-drop or file picker for `.csv` files with `address,amount` columns; parse and preview the data
- **Parsed Recipients Table**: Display a preview table showing all recipients with addresses (truncated) and amounts, with a total sum displayed
- **Total Amount**: Auto-calculated from the recipient list, clearly displayed
- **Validation Feedback**: Real-time validation using the contract's `areListsValid` logic (client-side mirror) — highlights duplicates, zero addresses, zero amounts, and mismatched lengths

---

## 4. Approve & Send Flow

A two-step transaction flow:

1. **Step 1 — Approve**: Button to call `ERC20.approve(tsenderContractAddress, totalAmount)` so the Tsender contract can pull tokens
   - Show current allowance; skip if already sufficient
   - Transaction status indicator (pending, confirmed, failed)
2. **Step 2 — Airdrop**: Button to call `Tsender.airdropERC20(tokenAddress, recipients, amounts, totalAmount)`
   - Disabled until approval is confirmed
   - Transaction status with link to block explorer (Etherscan, etc.)
- Both steps show **loading spinners**, **success toasts**, and **error messages** with decoded contract error names (e.g., `Tsender__LengthsDontMatch`)

---

## 5. Transaction Feedback & Status

- **Toast notifications** for wallet actions (approval sent, airdrop confirmed, errors)
- **Transaction hash** displayed with a clickable link to the relevant block explorer based on the connected chain
- **Error handling**: Map custom Solidity errors (`Tsender__InvalidToken`, `Tsender__TransferFailed`, etc.) to user-friendly messages

---

## 6. Multi-Chain Contract Configuration

- Store Tsender contract addresses per chain in a config file (easily extendable)
- Contract ABI defined as a TypeScript constant for type-safe wagmi hooks
- Automatically switch contract address when the user changes networks via RainbowKit's chain switcher
- Show a warning if the user is on an unsupported chain

---

## 7. Responsive & Polished UX

- Fully **responsive** layout — works on desktop and mobile
- Dark theme with high contrast for readability
- Accessible form labels and keyboard navigation
- Empty/loading/error states for all async operations