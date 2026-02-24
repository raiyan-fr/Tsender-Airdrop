'use client';

import { useChainId } from 'wagmi';
import { getExplorerTxUrl, isChainSupported } from '@/config/contracts';
import { TransactionStep } from '@/hooks/useAirdrop';
import { formatTxHash, parseError } from '@/utils/errors';
import { formatTokenAmount } from '@/utils/parseRecipients';

interface TransactionButtonsProps {
  step: TransactionStep;
  needsApproval: boolean;
  allowance: bigint;
  totalAmount: bigint;
  decimals: number;
  symbol: string;
  onApprove: () => void;
  onAirdrop: () => void;
  onReset: () => void;
  approveHash?: string;
  airdropHash?: string;
  errorMessage?: string | null;
  isLoading: boolean;
  isValid: boolean;
  recipientCount: number;
}

export function TransactionButtons({
  step,
  needsApproval,
  allowance,
  totalAmount,
  decimals,
  symbol,
  onApprove,
  onAirdrop,
  onReset,
  approveHash,
  airdropHash,
  errorMessage,
  isLoading,
  isValid,
  recipientCount,
}: TransactionButtonsProps) {
  const chainId = useChainId();
  const chainSupported = isChainSupported(chainId);

  if (!chainSupported) {
    return (
      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
        <div className="flex items-center gap-2 text-yellow-400">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium">Unsupported Network</span>
        </div>
        <p className="mt-2 text-sm text-yellow-400/80">
          Please switch to a supported network using the network selector.
        </p>
      </div>
    );
  }

  if (step === 'completed') {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <div className="flex items-center gap-2 text-green-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Airdrop Completed!</span>
          </div>
          {airdropHash && (
            <a
              href={getExplorerTxUrl(chainId, airdropHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-green-400 hover:text-green-300"
            >
              <span>View transaction:</span>
              <code className="font-mono">{formatTxHash(airdropHash)}</code>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
        <button
          onClick={onReset}
          className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 font-medium text-slate-200 transition-all hover:bg-slate-600"
        >
          Start New Airdrop
        </button>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-center gap-2 text-red-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-medium">Transaction Failed</span>
          </div>
          <p className="mt-2 text-sm text-red-400/80">
            {errorMessage ? parseError(new Error(errorMessage)) : 'An error occurred'}
          </p>
        </div>
        <button
          onClick={onReset}
          className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 font-medium text-slate-200 transition-all hover:bg-slate-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Allowance Info */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>Current Allowance:</span>
        <span className="font-mono">{formatTokenAmount(allowance, decimals)} {symbol}</span>
      </div>

      {/* Step 1: Approve */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
            step === 'approving' || step === 'approved' || !needsApproval
              ? 'bg-purple-500 text-white'
              : 'bg-slate-700 text-slate-400'
          }`}>
            {!needsApproval || step === 'approved' ? '✓' : '1'}
          </div>
          <span className="text-sm font-medium text-slate-300">Approve Tokens</span>
        </div>
        <button
          onClick={onApprove}
          disabled={!needsApproval || step !== 'idle' || !isValid || recipientCount === 0}
          className={`w-full rounded-lg px-4 py-3 font-medium transition-all ${
            !needsApproval
              ? 'cursor-not-allowed bg-green-500/20 text-green-400'
              : step === 'approving'
              ? 'cursor-wait bg-purple-500/50 text-white'
              : !isValid || recipientCount === 0
              ? 'cursor-not-allowed bg-slate-700 text-slate-500'
              : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
          }`}
        >
          {step === 'approving' ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Approving...
            </span>
          ) : !needsApproval ? (
            'Approved ✓'
          ) : (
            `Approve ${formatTokenAmount(totalAmount, decimals)} ${symbol}`
          )}
        </button>
        {approveHash && step === 'approving' && (
          <a
            href={getExplorerTxUrl(chainId, approveHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-purple-400"
          >
            <span>Tx:</span>
            <code className="font-mono">{formatTxHash(approveHash)}</code>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>

      {/* Step 2: Airdrop */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
            step === 'airdropping'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-700 text-slate-400'
          }`}>
            {'2'}
          </div>
          <span className="text-sm font-medium text-slate-300">Send Airdrop</span>
        </div>
        <button
          onClick={onAirdrop}
          disabled={needsApproval || step === 'approving' || step === 'airdropping' || !isValid || recipientCount === 0}
          className={`w-full rounded-lg px-4 py-3 font-medium transition-all ${
            step === 'airdropping'
              ? 'cursor-wait bg-cyan-500/50 text-white'
              : needsApproval || !isValid || recipientCount === 0
              ? 'cursor-not-allowed bg-slate-700 text-slate-500'
              : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40'
          }`}
        >
          {step === 'airdropping' ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sending Airdrop...
            </span>
          ) : (
            `Send to ${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}`
          )}
        </button>
        {airdropHash && step === 'airdropping' && (
          <a
            href={getExplorerTxUrl(chainId, airdropHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400"
          >
            <span>Tx:</span>
            <code className="font-mono">{formatTxHash(airdropHash)}</code>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
