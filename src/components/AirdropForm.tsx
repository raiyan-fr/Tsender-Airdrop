'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAccount, useChainId } from 'wagmi';
import toast from 'react-hot-toast';
import { useTokenInfo } from '@/hooks/useTokenInfo';
import { useAirdrop } from '@/hooks/useAirdrop';
import { validateTokenAddress, validateRecipients, RecipientData } from '@/utils/validation';
import { parseRecipientsText, parseCSV, calculateTotal, formatTokenAmount } from '@/utils/parseRecipients';
import { isChainSupported, getTsenderAddress } from '@/config/contracts';
import { RecipientTable } from './RecipientTable';
import { TransactionButtons } from './TransactionButtons';

type InputMode = 'manual' | 'csv';

export function AirdropForm() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();

  // Prevent hydration mismatch: server always renders "not connected"
  // while client may already have a wallet connected
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Form state
  const [tokenAddress, setTokenAddress] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [manualInput, setManualInput] = useState('');
  const [recipients, setRecipients] = useState<RecipientData[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Token info
  const isValidTokenAddress = validateTokenAddress(tokenAddress).isValid;
  const { tokenInfo, isLoading: isLoadingToken, isError: isTokenError } = useTokenInfo(
    isValidTokenAddress ? (tokenAddress as `0x${string}`) : undefined
  );

  // Calculate total
  const totalAmount = calculateTotal(recipients);

  // Airdrop hook
  const {
    step,
    needsApproval,
    allowance,
    approve,
    airdrop,
    reset,
    approveHash,
    airdropHash,
    errorMessage,
    isLoading: isTransactionLoading,
  } = useAirdrop(
    isValidTokenAddress ? (tokenAddress as `0x${string}`) : undefined,
    recipients,
    totalAmount
  );

  // Parse recipients when input changes
  useEffect(() => {
    if (!tokenInfo) {
      setRecipients([]);
      setParseErrors([]);
      return;
    }

    if (inputMode === 'manual' && manualInput.trim()) {
      const result = parseRecipientsText(manualInput, tokenInfo.decimals);
      setRecipients(result.recipients);
      setParseErrors(result.errors);
    } else if (inputMode === 'manual') {
      setRecipients([]);
      setParseErrors([]);
    }
  }, [manualInput, inputMode, tokenInfo]);

  // Validate recipients
  useEffect(() => {
    if (recipients.length > 0) {
      const validation = validateRecipients(recipients);
      setValidationErrors(validation.errors);
    } else {
      setValidationErrors([]);
    }
  }, [recipients]);

  // Show toast notifications for transaction updates
  useEffect(() => {
    if (step === 'approved') {
      toast.success('Approval confirmed! Ready to send airdrop.');
    } else if (step === 'completed') {
      toast.success('Airdrop completed successfully!');
    } else if (step === 'error' && errorMessage) {
      toast.error(errorMessage);
    }
  }, [step, errorMessage]);

  // Handle CSV file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !tokenInfo) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = parseCSV(content, tokenInfo.decimals);
      setRecipients(result.recipients);
      setParseErrors(result.errors);
    };
    reader.readAsText(file);
  }, [tokenInfo]);

  // Handle drag and drop
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file || !tokenInfo) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = parseCSV(content, tokenInfo.decimals);
      setRecipients(result.recipients);
      setParseErrors(result.errors);
    };
    reader.readAsText(file);
  }, [tokenInfo]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const isFormValid = 
    isValidTokenAddress && 
    tokenInfo && 
    recipients.length > 0 && 
    parseErrors.length === 0 && 
    validationErrors.length === 0 &&
    totalAmount > 0n &&
    totalAmount <= tokenInfo.balance;

  const tsenderAddress = getTsenderAddress(chainId);
  const chainSupported = isChainSupported(chainId);

  if (!mounted || !isConnected) {
    return (
      <div className="rounded-2xl border border-purple-500/20 bg-slate-900/50 p-8 text-center backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
          <svg className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white">Connect Your Wallet</h2>
        <p className="mt-2 text-slate-400">
          Connect your wallet to start distributing tokens
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-purple-500/20 bg-slate-900/50 p-6 backdrop-blur-xl sm:p-8">
      <h2 className="mb-6 text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
        Airdrop ERC-20 Tokens
      </h2>

      {/* Chain warning */}
      {!chainSupported && (
        <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
          <div className="flex items-center gap-2 text-yellow-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">Unsupported Network</span>
          </div>
          <p className="mt-2 text-sm text-yellow-400/80">
            Please switch to a supported network using the network selector in the header.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Token Address Input */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Token Contract Address
          </label>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="0x..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          {tokenAddress && !isValidTokenAddress && (
            <p className="mt-1 text-sm text-red-400">
              {validateTokenAddress(tokenAddress).error}
            </p>
          )}
        </div>

        {/* Token Info Display */}
        {isLoadingToken && isValidTokenAddress && (
          <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/30 p-4">
            <svg className="h-5 w-5 animate-spin text-purple-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-slate-400">Loading token info...</span>
          </div>
        )}

        {isTokenError && isValidTokenAddress && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            Failed to load token info. Make sure the address is a valid ERC-20 token.
          </div>
        )}

        {tokenInfo && (
          <div className="rounded-lg border border-purple-500/20 bg-slate-800/30 p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500">Name</span>
                <p className="font-medium text-white">{tokenInfo.name}</p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500">Symbol</span>
                <p className="font-medium text-white">{tokenInfo.symbol}</p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500">Decimals</span>
                <p className="font-medium text-white">{tokenInfo.decimals}</p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500">Your Balance</span>
                <p className="font-medium text-purple-400">
                  {formatTokenAmount(tokenInfo.balance, tokenInfo.decimals)} {tokenInfo.symbol}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recipient Input */}
        {tokenInfo && (
          <>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">
                  Recipients
                </label>
                <div className="flex rounded-lg border border-slate-700 bg-slate-800/50 p-1">
                  <button
                    onClick={() => setInputMode('manual')}
                    className={`rounded-md px-3 py-1 text-sm transition-all ${
                      inputMode === 'manual'
                        ? 'bg-purple-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Manual
                  </button>
                  <button
                    onClick={() => setInputMode('csv')}
                    className={`rounded-md px-3 py-1 text-sm transition-all ${
                      inputMode === 'csv'
                        ? 'bg-purple-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    CSV Upload
                  </button>
                </div>
              </div>

              {inputMode === 'manual' ? (
                <textarea
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="0x1234...abcd, 100&#10;0x5678...efgh, 250&#10;0x9abc...ijkl, 75"
                  rows={6}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 font-mono text-sm text-white placeholder-slate-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-800/30 p-6 transition-all hover:border-purple-500/50"
                >
                  <svg className="mb-3 h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-slate-400">Drag and drop your CSV file here</p>
                  <p className="mt-1 text-sm text-slate-500">or click to browse</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </div>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Format: address, amount (one per line)
              </p>
            </div>

            {/* Parse Errors */}
            {parseErrors.length > 0 && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                <p className="mb-2 font-medium text-red-400">Parse Errors:</p>
                <ul className="list-inside list-disc space-y-1 text-sm text-red-400/80">
                  {parseErrors.slice(0, 5).map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                  {parseErrors.length > 5 && (
                    <li>...and {parseErrors.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                <p className="mb-2 font-medium text-yellow-400">Validation Issues:</p>
                <ul className="list-inside list-disc space-y-1 text-sm text-yellow-400/80">
                  {validationErrors.slice(0, 5).map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                  {validationErrors.length > 5 && (
                    <li>...and {validationErrors.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}

            {/* Insufficient Balance Warning */}
            {totalAmount > 0n && tokenInfo && totalAmount > tokenInfo.balance && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                <div className="flex items-center gap-2 text-red-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-medium">Insufficient Balance</span>
                </div>
                <p className="mt-1 text-sm text-red-400/80">
                  You need {formatTokenAmount(totalAmount, tokenInfo.decimals)} {tokenInfo.symbol} but only have{' '}
                  {formatTokenAmount(tokenInfo.balance, tokenInfo.decimals)} {tokenInfo.symbol}
                </p>
              </div>
            )}

            {/* Recipient Table */}
            <RecipientTable
              recipients={recipients}
              decimals={tokenInfo.decimals}
              symbol={tokenInfo.symbol}
            />

            {/* Transaction Buttons */}
            <TransactionButtons
              step={step}
              needsApproval={needsApproval}
              allowance={allowance}
              totalAmount={totalAmount}
              decimals={tokenInfo.decimals}
              symbol={tokenInfo.symbol}
              onApprove={approve}
              onAirdrop={airdrop}
              onReset={reset}
              approveHash={approveHash}
              airdropHash={airdropHash}
              errorMessage={errorMessage}
              isLoading={isTransactionLoading}
              isValid={isFormValid ?? false}
              recipientCount={recipients.length}
            />
          </>
        )}
      </div>
    </div>
  );
}
