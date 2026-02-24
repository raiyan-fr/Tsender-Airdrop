'use client';

import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount, useChainId } from 'wagmi';
import { erc20Abi, tsenderAbi, getTsenderAddress } from '@/config/contracts';
import { RecipientData } from '@/utils/validation';
import { useState, useEffect } from 'react';

export type TransactionStep = 'idle' | 'approving' | 'approved' | 'airdropping' | 'completed' | 'error';

export function useAirdrop(
  tokenAddress: `0x${string}` | undefined,
  recipients: RecipientData[],
  totalAmount: bigint
) {
  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  const tsenderAddress = getTsenderAddress(chainId);

  const [step, setStep] = useState<TransactionStep>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Read current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: userAddress && tsenderAddress ? [userAddress, tsenderAddress] : undefined,
    query: {
      enabled: !!tokenAddress && !!userAddress && !!tsenderAddress,
    },
  });

  const needsApproval = allowance !== undefined && allowance < totalAmount;

  // Approve transaction
  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApprovePending,
    error: approveError,
    reset: resetApprove,
  } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Airdrop transaction
  const {
    writeContract: writeAirdrop,
    data: airdropHash,
    isPending: isAirdropPending,
    error: airdropError,
    reset: resetAirdrop,
  } = useWriteContract();

  const { isLoading: isAirdropConfirming, isSuccess: isAirdropConfirmed } = useWaitForTransactionReceipt({
    hash: airdropHash,
  });

  // Update step based on transaction states
  useEffect(() => {
    if (approveError || airdropError) {
      setStep('error');
      setErrorMessage((approveError || airdropError)?.message || 'Transaction failed');
    } else if (isAirdropConfirmed) {
      setStep('completed');
    } else if (isAirdropPending || isAirdropConfirming) {
      setStep('airdropping');
    } else if (isApproveConfirmed) {
      setStep('approved');
      refetchAllowance();
    } else if (isApprovePending || isApproveConfirming) {
      setStep('approving');
    }
  }, [
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    isAirdropPending,
    isAirdropConfirming,
    isAirdropConfirmed,
    approveError,
    airdropError,
    refetchAllowance,
  ]);

  const approve = () => {
    if (!tokenAddress || !tsenderAddress) return;

    setStep('approving');
    setErrorMessage(null);

    writeApprove({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [tsenderAddress, totalAmount],
    });
  };

  const airdrop = () => {
    if (!tokenAddress || !tsenderAddress || recipients.length === 0) return;

    setStep('airdropping');
    setErrorMessage(null);

    const addresses = recipients.map((r) => r.address as `0x${string}`);
    const amounts = recipients.map((r) => r.amount);

    writeAirdrop({
      address: tsenderAddress,
      abi: tsenderAbi,
      functionName: 'airdropERC20',
      args: [tokenAddress, addresses, amounts, totalAmount],
    });
  };

  const reset = () => {
    setStep('idle');
    setErrorMessage(null);
    resetApprove();
    resetAirdrop();
    refetchAllowance();
  };

  return {
    step,
    needsApproval,
    allowance: allowance ?? 0n,
    approve,
    airdrop,
    reset,
    approveHash,
    airdropHash,
    errorMessage,
    isLoading: isApprovePending || isApproveConfirming || isAirdropPending || isAirdropConfirming,
  };
}
