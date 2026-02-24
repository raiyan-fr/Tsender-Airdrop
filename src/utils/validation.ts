// Validation utilities mirroring the contract's areListsValid logic

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RecipientData {
  address: string;
  amount: bigint;
}

// Check if a string is a valid Ethereum address
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Validate recipient lists (mirrors contract's areListsValid)
export function validateRecipients(recipients: RecipientData[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for empty list
  if (recipients.length === 0) {
    errors.push('Recipient list is empty');
    return { isValid: false, errors, warnings };
  }

  const seenAddresses = new Set<string>();

  for (let i = 0; i < recipients.length; i++) {
    const { address, amount } = recipients[i];
    const rowNum = i + 1;

    // Check for valid address format
    if (!isValidAddress(address)) {
      errors.push(`Row ${rowNum}: Invalid address format`);
      continue;
    }

    // Check for zero address
    if (address.toLowerCase() === '0x0000000000000000000000000000000000000000') {
      errors.push(`Row ${rowNum}: Zero address is not allowed`);
    }

    // Check for zero amount
    if (amount === 0n) {
      errors.push(`Row ${rowNum}: Amount cannot be zero`);
    }

    // Check for duplicates
    const lowerAddress = address.toLowerCase();
    if (seenAddresses.has(lowerAddress)) {
      errors.push(`Row ${rowNum}: Duplicate address detected`);
    } else {
      seenAddresses.add(lowerAddress);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate token address
export function validateTokenAddress(address: string): { isValid: boolean; error?: string } {
  if (!address) {
    return { isValid: false, error: 'Token address is required' };
  }

  if (!isValidAddress(address)) {
    return { isValid: false, error: 'Invalid token address format' };
  }

  if (address.toLowerCase() === '0x0000000000000000000000000000000000000000') {
    return { isValid: false, error: 'Zero address is not a valid token' };
  }

  return { isValid: true };
}
