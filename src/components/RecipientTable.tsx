'use client';

import { RecipientData } from '@/utils/validation';
import { formatTokenAmount } from '@/utils/parseRecipients';
import { formatAddress } from '@/utils/errors';

interface RecipientTableProps {
  recipients: RecipientData[];
  decimals: number;
  symbol: string;
}

export function RecipientTable({ recipients, decimals, symbol }: RecipientTableProps) {
  if (recipients.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-8 text-center">
        <p className="text-slate-500">No recipients added yet</p>
        <p className="mt-1 text-sm text-slate-600">
          Enter addresses and amounts above to preview the airdrop
        </p>
      </div>
    );
  }

  const total = recipients.reduce((sum, r) => sum + r.amount, 0n);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-700/50 bg-slate-800/30">
      {/* Table Header */}
      <div className="border-b border-slate-700/50 bg-slate-800/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">
            {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
          </span>
          <span className="text-sm font-semibold text-purple-400">
            Total: {formatTokenAmount(total, decimals)} {symbol}
          </span>
        </div>
      </div>

      {/* Table Content */}
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-slate-800/90 backdrop-blur-sm">
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Address</th>
              <th className="px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {recipients.map((recipient, index) => (
              <tr
                key={index}
                className="text-sm transition-colors hover:bg-slate-700/20"
              >
                <td className="px-4 py-2 text-slate-500">{index + 1}</td>
                <td className="px-4 py-2">
                  <code className="font-mono text-slate-300">
                    {formatAddress(recipient.address)}
                  </code>
                </td>
                <td className="px-4 py-2 text-right font-mono text-slate-300">
                  {formatTokenAmount(recipient.amount, decimals)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
