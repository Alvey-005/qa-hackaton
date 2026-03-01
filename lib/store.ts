// FinTrack Global Mutable In-Memory Store
// INTENTIONAL: single shared mutable object — no isolation, no deep cloning

export type Transaction = {
    id: string;
    date: string;
    description: string;
    type: "Credit" | "Debit";
    amount: number;
    runningBalance: number;
    biller?: string;
};

export type BillPayment = {
    id: string;
    biller: string;
    consumerNumber: string;
    amount: number;
    date: string;
    status: "Paid" | "Scheduled" | "Failed";
    reference: string;
};

export type UserProfile = {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    accountNumber: string;
    accountType: string;
    balance: number;
    notifications: {
        email: boolean;
        sms: boolean;
    };
};

// Seed transactions
const seedTransactions: Transaction[] = [
    { id: "tx1", date: "2026-02-20", description: "Salary Credit", type: "Credit", amount: 15000, runningBalance: 25000, biller: undefined },
    { id: "tx2", date: "2026-02-18", description: "Electricity Bill", type: "Debit", amount: 1200, runningBalance: 10000, biller: "Electricity" },
    { id: "tx3", date: "2026-02-17", description: "Fund Transfer to 9876", type: "Debit", amount: 500, runningBalance: 8800, biller: undefined },
    { id: "tx4", date: "2026-02-15", description: "Mobile Recharge", type: "Debit", amount: 200, runningBalance: 8600, biller: "Mobile Recharge" },
    { id: "tx5", date: "2026-02-13", description: "Internet Bill", type: "Debit", amount: 800, runningBalance: 7800, biller: "Internet" },
    { id: "tx6", date: "2026-02-12", description: "Water Bill", type: "Debit", amount: 350, runningBalance: 7450, biller: "Water" },
    { id: "tx7", date: "2026-02-10", description: "Fund Transfer to 1234", type: "Debit", amount: 1000, runningBalance: 6450, biller: undefined },
    { id: "tx8", date: "2026-02-08", description: "Gas Bill", type: "Debit", amount: 450, runningBalance: 6000, biller: "Gas" },
    { id: "tx9", date: "2026-02-06", description: "Transfer Received", type: "Credit", amount: 2000, runningBalance: 8000, biller: undefined },
    { id: "tx10", date: "2026-02-04", description: "Electricity Bill", type: "Debit", amount: 1100, runningBalance: 6900, biller: "Electricity" },
    { id: "tx11", date: "2026-02-02", description: "Mobile Recharge", type: "Debit", amount: 200, runningBalance: 6700, biller: "Mobile Recharge" },
    { id: "tx12", date: "2026-01-31", description: "January Salary", type: "Credit", amount: 15000, runningBalance: 21700, biller: undefined },
    { id: "tx13", date: "2026-01-28", description: "Internet Bill", type: "Debit", amount: 800, runningBalance: 20900, biller: "Internet" },
    { id: "tx14", date: "2026-01-25", description: "Large Transfer out", type: "Debit", amount: 10000, runningBalance: 10900, biller: undefined },
    { id: "tx15", date: "2026-01-22", description: "Deposit", type: "Credit", amount: 5000, runningBalance: 15900, biller: undefined },
    { id: "tx16", date: "2026-01-20", description: "Water Bill", type: "Debit", amount: 350, runningBalance: 15550, biller: "Water" },
    { id: "tx17", date: "2026-01-18", description: "Gas Bill", type: "Debit", amount: 450, runningBalance: 15100, biller: "Gas" },
    { id: "tx18", date: "2026-01-16", description: "Electricity Bill", type: "Debit", amount: 1200, runningBalance: 13900, biller: "Electricity" },
    { id: "tx19", date: "2026-01-14", description: "Bonus Credit", type: "Credit", amount: 3000, runningBalance: 16900, biller: undefined },
    { id: "tx20", date: "2026-01-10", description: "Fund Transfer to 5555", type: "Debit", amount: 2000, runningBalance: 14900, biller: undefined },
    { id: "tx21", date: "2025-12-30", description: "December Salary", type: "Credit", amount: 15000, runningBalance: 29900, biller: undefined },
    { id: "tx22", date: "2025-12-28", description: "Year-End Bonus", type: "Credit", amount: 5000, runningBalance: 34900, biller: undefined },
    // 6-10 months old — intentionally added to expose date filter bug
    { id: "tx23", date: "2025-08-15", description: "August Salary", type: "Credit", amount: 15000, runningBalance: 30000, biller: undefined },
    { id: "tx24", date: "2025-08-10", description: "Electricity Bill", type: "Debit", amount: 1300, runningBalance: 28700, biller: "Electricity" },
    { id: "tx25", date: "2025-07-20", description: "July Salary", type: "Credit", amount: 15000, runningBalance: 27000, biller: undefined },
    { id: "tx26", date: "2025-07-05", description: "Internet Bill", type: "Debit", amount: 800, runningBalance: 26200, biller: "Internet" },
    { id: "tx27", date: "2025-06-18", description: "Fund Transfer to 7788", type: "Debit", amount: 3000, runningBalance: 20000, biller: undefined },
    { id: "tx28", date: "2025-05-30", description: "May Salary", type: "Credit", amount: 15000, runningBalance: 25000, biller: undefined },
    { id: "tx29", date: "2025-04-22", description: "Gas Bill", type: "Debit", amount: 500, runningBalance: 18000, biller: "Gas" },
    { id: "tx30", date: "2025-04-10", description: "April Salary", type: "Credit", amount: 15000, runningBalance: 20000, biller: undefined },
    // Additional transactions for richer dataset
    { id: "tx31", date: "2026-02-10", description: "Mobile Recharge", type: "Debit", amount: 150, runningBalance: 24850, biller: "Mobile Recharge" },
    { id: "tx32", date: "2026-02-05", description: "Gas Bill", type: "Debit", amount: 420, runningBalance: 24430, biller: "Gas" },
    { id: "tx33", date: "2026-01-28", description: "Freelance Income", type: "Credit", amount: 8000, runningBalance: 22430, biller: undefined },
    { id: "tx34", date: "2026-01-22", description: "Water Bill", type: "Debit", amount: 380, runningBalance: 22050, biller: "Water" },
    { id: "tx35", date: "2026-01-15", description: "Mobile Recharge", type: "Debit", amount: 200, runningBalance: 21850, biller: "Mobile Recharge" },
    { id: "tx36", date: "2026-01-05", description: "Internet Bill", type: "Debit", amount: 800, runningBalance: 21050, biller: "Internet" },
    { id: "tx37", date: "2025-12-20", description: "Gas Bill", type: "Debit", amount: 430, runningBalance: 20620, biller: "Gas" },
    { id: "tx38", date: "2025-12-15", description: "Fund Transfer to 3344", type: "Debit", amount: 5000, runningBalance: 15620, biller: undefined },
    { id: "tx39", date: "2025-12-05", description: "Water Bill", type: "Debit", amount: 360, runningBalance: 15260, biller: "Water" },
    { id: "tx40", date: "2025-11-30", description: "November Salary", type: "Credit", amount: 15000, runningBalance: 30260, biller: undefined },
    { id: "tx41", date: "2025-11-20", description: "Electricity Bill", type: "Debit", amount: 1150, runningBalance: 29110, biller: "Electricity" },
    { id: "tx42", date: "2025-11-12", description: "Mobile Recharge", type: "Debit", amount: 200, runningBalance: 28910, biller: "Mobile Recharge" },
    { id: "tx43", date: "2025-11-05", description: "Internet Bill", type: "Debit", amount: 800, runningBalance: 28110, biller: "Internet" },
    { id: "tx44", date: "2025-09-28", description: "September Salary", type: "Credit", amount: 15000, runningBalance: 32000, biller: undefined },
    { id: "tx45", date: "2025-09-15", description: "Electricity Bill", type: "Debit", amount: 1250, runningBalance: 30750, biller: "Electricity" },
    { id: "tx46", date: "2025-09-08", description: "Fund Transfer to 6622", type: "Debit", amount: 2500, runningBalance: 28250, biller: undefined },
    { id: "tx47", date: "2025-08-25", description: "Water Bill", type: "Debit", amount: 340, runningBalance: 27910, biller: "Water" },
    { id: "tx48", date: "2025-05-15", description: "Electricity Bill", type: "Debit", amount: 1100, runningBalance: 16500, biller: "Electricity" },
    { id: "tx49", date: "2025-03-28", description: "March Salary", type: "Credit", amount: 15000, runningBalance: 22000, biller: undefined },
    { id: "tx50", date: "2025-03-10", description: "Internet Bill", type: "Debit", amount: 800, runningBalance: 21200, biller: "Internet" },
];

const seedBillPayments: BillPayment[] = [
    { id: "bp1", biller: "Electricity", consumerNumber: "EL-001", amount: 1200, date: "2026-02-18", status: "Paid", reference: "REF-BP-001" },
    { id: "bp2", biller: "Internet", consumerNumber: "IN-002", amount: 800, date: "2026-02-13", status: "Paid", reference: "REF-BP-002" },
    { id: "bp3", biller: "Water", consumerNumber: "WA-003", amount: 350, date: "2026-02-12", status: "Paid", reference: "REF-BP-003" },
    { id: "bp4", biller: "Gas", consumerNumber: "GA-004", amount: 450, date: "2026-03-15", status: "Scheduled", reference: "REF-BP-004" },
];

// Create the base store with default data
const defaultStore = {
    user: {
        name: "Abu Hena",
        email: "user@fintrack.com",
        password: "SecurePass2026!",
        phone: "01700000000",
        address: "123 Main Street, Dhaka",
        accountNumber: "1234567890123456",
        accountType: "Savings",
        balance: 25000,
        notifications: { email: true, sms: false },
    },
    transactions: seedTransactions,
    billPayments: seedBillPayments,
    isLoggedIn: false,
};

// Auto-sync to localStorage
// Bump this version whenever seed data changes — forces a cache bust so new data is visible
const STORE_VERSION = "v3"; // bumped: added 20 more transactions (tx31-tx50)

function createPersistentStore() {
    // Only access localStorage if in browser environment
    const isBrowser = typeof window !== "undefined";
    const cacheKey = "fintrack_persist_store";
    const versionKey = "fintrack_persist_version";

    let initialData = defaultStore;
    if (isBrowser) {
        const savedVersion = localStorage.getItem(versionKey);
        if (savedVersion !== STORE_VERSION) {
            // Seed data changed — clear stale cache and start fresh
            localStorage.removeItem(cacheKey);
            localStorage.setItem(versionKey, STORE_VERSION);
        }
        const saved = localStorage.getItem(cacheKey);
        if (saved) {
            try {
                initialData = JSON.parse(saved);
            } catch (e) {
                console.error("Failed to load store", e);
            }
        }
    }

    // Proxy to auto-save any changes immediately
    const handler = {
        get(target: any, property: string): any {
            const val = target[property];
            if (typeof val === "object" && val !== null) {
                return new Proxy(val, handler); // Deep proxy to catch nested mutations
            }
            return val;
        },
        set(target: any, property: string, value: any) {
            target[property] = value;
            if (isBrowser) {
                // INTENTIONAL CHAOS: Save the whole mutated object back instantly. 
                // This preserves our fragile array mutations but persists them.
                localStorage.setItem(cacheKey, JSON.stringify(proxyStore));
            }
            return true;
        }
    };

    const proxyStore = new Proxy(initialData, handler);
    return proxyStore;
}

// Export the persistent, mutable, globally shared object
export const store = createPersistentStore() as {
    user: UserProfile;
    transactions: Transaction[];
    billPayments: BillPayment[];
    isLoggedIn: boolean;
};
