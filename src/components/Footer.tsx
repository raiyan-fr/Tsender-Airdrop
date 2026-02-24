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

          {/* Right: Tsender address */}
          <div className="flex flex-col items-center gap-2 text-sm text-slate-500 sm:items-end">
            <p className="text-slate-600">
              © {new Date().getFullYear()} Tsender. Open source.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
