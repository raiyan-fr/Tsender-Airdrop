// Map Solidity custom errors to user-friendly messages

export const errorMessages: Record<string, string> = {
  Tsender__InvalidToken: 'Invalid token address. Please check the token contract address.',
  Tsender__LengthsDontMatch: 'The number of recipients and amounts must match.',
  Tsender__TransferFailed: 'Token transfer failed. Please ensure you have approved enough tokens.',
  Tsender__ZeroAddress: 'Zero address is not allowed in the recipient list.',
  Tsender__TotalDoesntAddUp: 'The total amount does not match the sum of individual amounts.',
};

// Parse error from wagmi/viem and return user-friendly message
export function parseError(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message;

    // Check for custom contract errors
    for (const [errorName, friendlyMessage] of Object.entries(errorMessages)) {
      if (message.includes(errorName)) {
        return friendlyMessage;
      }
    }

    // Handle user rejection
    if (
      message.includes('User rejected') ||
      message.includes('user rejected') ||
      message.includes('User denied')
    ) {
      return 'Transaction was rejected by the user.';
    }

    // Handle insufficient funds
    if (message.includes('insufficient funds')) {
      return 'Insufficient funds for gas. Please add more ETH to your wallet.';
    }

    // Handle insufficient allowance
    if (message.includes('insufficient allowance') || message.includes('ERC20: insufficient allowance')) {
      return 'Insufficient token allowance. Please approve more tokens.';
    }

    // Handle insufficient balance
    if (message.includes('exceeds balance') || message.includes('insufficient balance')) {
      return 'Insufficient token balance. You do not have enough tokens to complete this airdrop.';
    }

    // Return the original message if no pattern matches
    return message.length > 100 ? message.slice(0, 100) + '...' : message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  return 'An unknown error occurred. Please try again.';
}

// Format transaction hash for display
export function formatTxHash(hash: string): string {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

// Format address for display
export function formatAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
