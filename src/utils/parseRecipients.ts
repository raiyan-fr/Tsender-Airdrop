import { RecipientData, isValidAddress } from './validation';

export interface ParseResult {
  recipients: RecipientData[];
  errors: string[];
  rawLines: string[];
}

// Parse comma/newline-separated text into recipient arrays
export function parseRecipientsText(text: string, decimals: number): ParseResult {
  const recipients: RecipientData[] = [];
  const errors: string[] = [];
  const rawLines: string[] = [];

  if (!text.trim()) {
    return { recipients, errors, rawLines };
  }

  // Split by newlines, then handle comma separation within each line
  const lines = text.trim().split(/\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    rawLines.push(line);

    // Support formats:
    // address,amount
    // address, amount
    // address amount
    const parts = line.split(/[,\s]+/).filter(Boolean);

    if (parts.length < 2) {
      errors.push(`Line ${i + 1}: Invalid format. Expected "address,amount"`);
      continue;
    }

    const address = parts[0];
    const amountStr = parts[1];

    if (!isValidAddress(address)) {
      errors.push(`Line ${i + 1}: Invalid address "${address}"`);
      continue;
    }

    try {
      // Parse the amount with decimals
      const amount = parseTokenAmount(amountStr, decimals);
      if (amount === null) {
        errors.push(`Line ${i + 1}: Invalid amount "${amountStr}"`);
        continue;
      }

      recipients.push({ address, amount });
    } catch (e) {
      errors.push(`Line ${i + 1}: Failed to parse amount "${amountStr}"`);
    }
  }

  return { recipients, errors, rawLines };
}

// Parse CSV file content
export function parseCSV(csvContent: string, decimals: number): ParseResult {
  const recipients: RecipientData[] = [];
  const errors: string[] = [];
  const rawLines: string[] = [];

  if (!csvContent.trim()) {
    return { recipients, errors, rawLines };
  }

  const lines = csvContent.trim().split(/\n/);

  // Check if first line is a header
  const firstLine = lines[0].toLowerCase();
  const startIndex = firstLine.includes('address') || firstLine.includes('recipient') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    rawLines.push(line);

    // CSV format: address,amount
    const parts = line.split(',').map((p) => p.trim());

    if (parts.length < 2) {
      errors.push(`Row ${i + 1}: Invalid format. Expected "address,amount"`);
      continue;
    }

    const address = parts[0];
    const amountStr = parts[1];

    if (!isValidAddress(address)) {
      errors.push(`Row ${i + 1}: Invalid address "${address}"`);
      continue;
    }

    try {
      const amount = parseTokenAmount(amountStr, decimals);
      if (amount === null) {
        errors.push(`Row ${i + 1}: Invalid amount "${amountStr}"`);
        continue;
      }

      recipients.push({ address, amount });
    } catch (e) {
      errors.push(`Row ${i + 1}: Failed to parse amount "${amountStr}"`);
    }
  }

  return { recipients, errors, rawLines };
}

// Parse a token amount string to bigint with decimals
export function parseTokenAmount(amountStr: string, decimals: number): bigint | null {
  try {
    const cleanAmount = amountStr.trim().replace(/,/g, '');

    if (!/^[0-9]*\.?[0-9]+$/.test(cleanAmount)) {
      return null;
    }

    // Handle decimal amounts
    const parts = cleanAmount.split('.');
    const integerPart = parts[0] || '0';
    let decimalPart = parts[1] || '';

    // Pad or truncate decimal part to match token decimals
    if (decimalPart.length > decimals) {
      decimalPart = decimalPart.slice(0, decimals);
    } else {
      decimalPart = decimalPart.padEnd(decimals, '0');
    }

    const fullAmount = integerPart + decimalPart;
    return BigInt(fullAmount);
  } catch {
    return null;
  }
}

// Format a bigint amount with decimals for display
export function formatTokenAmount(amount: bigint, decimals: number): string {
  const str = amount.toString().padStart(decimals + 1, '0');
  const integerPart = str.slice(0, -decimals) || '0';
  const decimalPart = str.slice(-decimals);

  // Remove trailing zeros from decimal part
  const trimmedDecimal = decimalPart.replace(/0+$/, '');

  if (trimmedDecimal) {
    return `${integerPart}.${trimmedDecimal}`;
  }
  return integerPart;
}

// Calculate total amount from recipients
export function calculateTotal(recipients: RecipientData[]): bigint {
  return recipients.reduce((sum, r) => sum + r.amount, 0n);
}
