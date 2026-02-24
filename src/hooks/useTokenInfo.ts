'use client';

import { useMemo } from 'react';
import { useReadContracts, useAccount } from 'wagmi';
import { erc20Abi } from '@/config/contracts';

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  balance: bigint;
}

export function useTokenInfo(tokenAddress: `0x${string}` | undefined) {
  const { address: userAddress } = useAccount();

  const { data, isLoading, isError, error, refetch } = useReadContracts({
    contracts: tokenAddress
      ? [
          {
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'name',
          },
          {
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'symbol',
          },
          {
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'decimals',
          },
          {
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: userAddress ? [userAddress] : undefined,
          },
        ]
      : [],
    query: {
      enabled: !!tokenAddress && !!userAddress,
    },
  });

  // Memoize tokenInfo to prevent new object reference on every render,
  // which would cause infinite loops in consumer useEffects.
  const tokenInfo: TokenInfo | null = useMemo(() => {
    if (
      data &&
      data.length >= 3 &&
      data[0]?.status === 'success' &&
      data[1]?.status === 'success' &&
      data[2]?.status === 'success'
    ) {
      return {
        name: data[0].result as string,
        symbol: data[1].result as string,
        decimals: Number(data[2].result),
        balance: data[3]?.status === 'success' ? BigInt(data[3].result as string | number | bigint) : 0n,
      };
    }
    return null;
  }, [data]);

  return {
    tokenInfo,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// Mock Token Address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512