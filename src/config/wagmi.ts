"use client"

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum, base, mainnet, optimism, anvil, zksync, sepolia
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Tsender',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [
    arbitrum, base, mainnet, optimism, anvil, zksync, sepolia
  ],
  ssr: false,
});
