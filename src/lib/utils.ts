// Simple currency formatter — INTENTIONAL: duplicated across files (no centralized helper)
export function formatBDT(amount: number): string {
    return `BDT ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function generateId(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function maskAccountNumber(accountNumber: string): string {
    return accountNumber.substring(0, 4) + " **** **** " + accountNumber.substring(12);
}

export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomDelay(min: number, max: number): Promise<void> {
    return delay(Math.floor(Math.random() * (max - min + 1)) + min);
}
