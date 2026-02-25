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
];

const seedBillPayments: BillPayment[] = [
    { id: "bp1", biller: "Electricity", consumerNumber: "EL-001", amount: 1200, date: "2026-02-18", status: "Paid", reference: "REF-BP-001" },
    { id: "bp2", biller: "Internet", consumerNumber: "IN-002", amount: 800, date: "2026-02-13", status: "Paid", reference: "REF-BP-002" },
    { id: "bp3", biller: "Water", consumerNumber: "WA-003", amount: 350, date: "2026-02-12", status: "Paid", reference: "REF-BP-003" },
    { id: "bp4", biller: "Gas", consumerNumber: "GA-004", amount: 450, date: "2026-03-15", status: "Scheduled", reference: "REF-BP-004" },
];

// INTENTIONAL: mutable, globally shared object — no isolation
export const store: {
    user: UserProfile;
    transactions: Transaction[];
    billPayments: BillPayment[];
    isLoggedIn: boolean;
} = {
    user: {
        name: "Abu Hena",
        email: "user@fintrack.com",
        password: "Pass1234",
        phone: "01700000000",
        address: "123 Main Street, Dhaka",
        accountNumber: "1234567890123456",
        accountType: "Savings",
        balance: 25000,
        notifications: { email: true, sms: false },
    },
    transactions: seedTransactions,      // INTENTIONAL: mutable reference
    billPayments: seedBillPayments,
    isLoggedIn: false,
};
