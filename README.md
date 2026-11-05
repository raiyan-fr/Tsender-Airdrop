# Tsender

Tsender is a web app for distributing ERC-20 tokens to multiple wallets in a single transaction. Connect a wallet, enter a token contract address, add recipients manually or upload a CSV, then approve and send the airdrop.

## Features

- Connect wallets with RainbowKit and Wagmi.
- Read ERC-20 token details and your balance.
- Enter recipients manually or upload a CSV.
- Review recipient addresses, amounts, and the total before sending.
- Approve the required token allowance and submit the airdrop.
- View transaction links on supported block explorers.


## Tech stack

- Next.js 16 and React 19
- TypeScript
- Wagmi, RainbowKit, and Viem
- Solidity contracts in `contracts/`

### Prerequisites

- Node.js
- pnpm
- A WalletConnect project ID
- A compatible wallet with the native token needed for network gas fees

## Getting started

### Install and configure

```bash
pnpm install
```

Create `.env.local` in the project root and set your WalletConnect project ID:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Using Tsender

1. Connect your wallet and select a supported network.
2. Enter the ERC-20 token contract address.
3. Add recipients in `address,amount` format, one recipient per line, or upload a CSV with address and amount columns.
4. Review the parsed recipients and total amount.
5. Approve the token amount if prompted, then submit the airdrop transaction.

Amounts are entered in whole token units (for example, `1.5` tokens), and the app uses the token’s decimals when preparing transactions. Your wallet must hold enough tokens to cover the total.

## Supported networks

The app has Tsender contract addresses configured for:

- Ethereum
- Optimism
- Arbitrum
- zkSync Era
- Base
- Sepolia
- Local Anvil (chain ID `31337`)

Contract addresses and supported-network configuration are maintained in `src/config/contracts.ts`. The wallet network list is configured in `src/config/wagmi.ts`.

## Local Anvil

The project includes an Anvil state file and an `anvil` script:

```bash
pnpm anvil
```

This requires Anvil to be installed and available on your `PATH`.


## Available scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Start the production server |
| `pnpm anvil` | Start Anvil with the included saved state |

## Project structure

- `src/app/` — Next.js app entry point and global styles
- `src/components/` — Wallet, airdrop form, recipient table, and transaction UI
- `src/config/` — Wallet and contract configuration
- `src/hooks/` — Token reads and airdrop transaction flow
- `src/utils/` — Recipient parsing, validation, and error handling
- `contracts/` — Tsender and sample ERC-20 Solidity contracts

## Author

- [@raiyan-fr](https://www.github.com/raiyan-fr)
  
## License

[![License](https://img.shields.io/badge/license-MIT-brightgreen)](https://opensource.org/licenses/MIT)

This code is licensed under the MIT License. See the [LICENSE](https://choosealicense.com/licenses/mit/) file for details.