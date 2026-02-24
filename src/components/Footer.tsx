'use client';

import { useChainId } from 'wagmi';
import { getTsenderAddress, getExplorerTxUrl } from '@/config/contracts';
import { formatAddress } from '@/utils/errors';

export function Footer() {
  const chainId = useChainId();
  const tsenderAddress = getTsenderAddress(chainId);

  return (
    <footer className="border-t border-purple-500/20 bg-slate-900/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* Left: Logo and tagline */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500">
              <span className="text-sm font-bold text-white">Ts</span>
            </div>
            <span className="text-sm text-slate-400">
              Efficient bulk ERC-20 token distribution
            </span>
          </div>

          {/* Right: Contract info */}
          <div className="flex flex-col items-center gap-2 text-sm text-slate-500 sm:items-end">
            {tsenderAddress && tsenderAddress !== '0x0000000000000000000000000000000000000000' && (
              <a
                href={getExplorerTxUrl(chainId, '').replace('/tx/', '/address/') + tsenderAddress}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-400 transition-colors hover:text-purple-400"
              >
                <span>Contract:</span>
                <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs">
                  {formatAddress(tsenderAddress)}
                </code>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            <p className="text-slate-600">
              © {new Date().getFullYear()} Tsender. Open source.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
