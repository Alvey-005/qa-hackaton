# FinTrack --- MASTER QA CHAOS TASK GENERATION SPEC

## Full Test Case Logic + Implementation Instructions + Bug Flags

### Optimized for Antigravity / Copilot Task Breakdown Mode

### Tech Stack: Next.js (App Router) + TailwindCSS

### Purpose: BugVault SQA Hackathon --- Controlled Chaos Architecture

------------------------------------------------------------------------

# 🔥 AI INSTRUCTION BLOCK (READ FIRST)

You are generating a FULL TASK LIST to build FinTrack.

You must: - Break implementation into modules - Create frontend + API
tasks - Include state management tasks - Include bug implementation
tasks - Include async behavior tasks - Include edge-case logic tasks -
DO NOT fix intentional bugs - Treat bugs as REQUIRED FEATURES

Additionally engineer the system to: - Encourage race conditions -
Encourage state mutation issues - Encourage async inconsistencies -
Encourage boundary edge-case collapses - Avoid defensive programming -
Avoid deep cloning of state - Use in-memory arrays and mutable objects

------------------------------------------------------------------------

# 📁 ROUTES

/login\
/dashboard\
/transfer\
/transactions\
/bills\
/settings

Protect all except /login using client-side session logic.

------------------------------------------------------------------------

# 👤 MOCK USER DATA

Email: user@fintrack.com\
Password: Pass1234\
Name: Abu Hena\
Account Type: Savings\
Account Number: 1234567890123456\
Initial Balance: 25000

Use single shared mutable in-memory store for: - balance -
transactions - scheduled payments - bill history - user profile

DO NOT isolate state per request.

------------------------------------------------------------------------

# 🔐 MODULE 1 --- AUTHENTICATION

## Expected Logic

TC-AUTH-01: - Valid login → redirect /dashboard - Store session in
localStorage - Display welcome message

TC-AUTH-02: - Wrong password → show generic error - Do not reveal field
correctness

TC-AUTH-03: - Empty fields → inline validation - No API call

TC-AUTH-05: - Refresh should preserve session

TC-AUTH-06: - Logout clears session - Protected routes blocked

## 🐛 BUG FLAG --- T1-001

Forgot Password link: - Navigate to /password-reset - Route must NOT
exist - 404 page shown

## Chaos Engineering Notes

-   Use async delay (random 400--900ms) on login
-   Do not debounce login clicks
-   Allow rapid double-click to cause duplicate API calls

------------------------------------------------------------------------

# 🏠 MODULE 2 --- DASHBOARD

## Expected Logic

TC-DASH-01: Display: - Name - Masked account number - Balance (BDT
format) - Account type - 5 recent transactions - Quick action buttons

TC-DASH-05: Buttons route correctly

## 🐛 BUG FLAG --- T1-004

Chart Y-axis label must be: "Units"

## 🐛 BUG FLAG --- T1-009

After transfer: - Navigating back shows stale state - Only hard refresh
updates data

## 🐛 BUG FLAG --- T2-004 (Hidden)

If balance === 10000: Display 10500 Do NOT modify ledger value No UI
message

## Chaos Engineering Notes

-   Cache dashboard state in component state only
-   Do not refetch on route return
-   Mutate balance directly without immutability

------------------------------------------------------------------------

# 💸 MODULE 3 --- FUND TRANSFER

## Expected Logic

TC-FT-01: - Input recipient account - Input recipient name - Input
amount - Calculate 1.5% fee - Show review screen - Confirm → success
screen - Deduct balance - Add transaction entry

TC-FT-05: Block insufficient balance

TC-FT-07: Block zero amount

## 🐛 BUG FLAG --- T1-010

fee = Math.floor(amount \* 0.015)

## 🐛 BUG FLAG --- T1-002

Allow negative amount

## 🐛 BUG FLAG --- T1-003

Skip recipient validation Always return success

## 🐛 BUG FLAG --- T2-001 (Ghost Double Debit)

If: - User opens review - Navigates away - Returns via browser back -
Clicks Confirm

Process transfer again. Deduct balance twice. Show only ONE transaction
entry.

## Chaos Engineering Notes

-   Do not use idempotency keys
-   Do not disable Confirm button fast enough
-   Simulate 700--1200ms delay before writing transaction
-   Write balance update before transaction entry
-   Use mutable transaction array

------------------------------------------------------------------------

# 📋 MODULE 4 --- TRANSACTION HISTORY

## Expected Logic

TC-TH-01: - Paginated (10 per page) - Columns: Date \| Description \|
Type \| Amount \| Running Balance - Default sort newest first

TC-TH-05: Filter by Credit/Debit/All

TC-TH-06: Large amounts formatted with commas and BDT prefix

## 🐛 BUG FLAG --- T2-002

When BOTH: - Date filter active - Biller filter active Sorting breaks
(random order)

## 🐛 BUG FLAG --- T1-005

Export as PDF → blank valid PDF file

## 🐛 BUG FLAG --- T2-005

In PDF export: slice(pageStart, pageEnd - 1) Drop last row on every page

## Chaos Engineering Notes

-   Use in-place sort()
-   Mutate filtered arrays directly
-   Reuse array references between filters

------------------------------------------------------------------------

# 🧾 MODULE 5 --- BILL PAYMENTS

## Expected Logic

TC-BP-01: - Select biller - Enter consumer number - Enter amount - Pay
Now → success screen - Deduct balance - Add to history

TC-BP-04: - Allow future scheduling - Block past dates - Do not deduct
immediately

TC-BP-05: History sub-tab sorted newest first

## 🐛 BUG FLAG --- T1-007

Allow 0 amount payment → success screen

## 🐛 BUG FLAG --- T2-003

Last day scheduling: Add 1 month without correcting overflow Scheduler
silently fails UI still shows "Payment Scheduled"

## Chaos Engineering Notes

-   Use JavaScript Date object directly
-   Do not validate normalized date
-   Do not verify scheduler execution consistency

------------------------------------------------------------------------

# ⚙️ MODULE 6 --- ACCOUNT SETTINGS

## Expected Logic

TC-AS-03: Update phone + address → persist

TC-AS-04: Correct password change works

TC-AS-05: Wrong current password rejected

TC-AS-06: Notification toggles persist

## 🐛 BUG FLAG --- T1-006

Empty Name → still show success toast

## 🐛 BUG FLAG --- T1-008

Do NOT compare new password & confirm password Accept mismatched

## Chaos Engineering Notes

-   Save profile before validation completes
-   Show toast before API confirmation
-   Mutate user object directly

------------------------------------------------------------------------

# 🖥 GENERAL UI

TC-UI-01: Sidebar navigation with active highlight

TC-UI-02: Responsive 1280x800 & 1920x1080

TC-UI-03: Red border on invalid fields

TC-UI-04: Loading spinners for async

TC-UI-05: All currency formatted: BDT 1,500.00

## Chaos Enhancements

-   Some spinners disappear before state update
-   Allow button double-click under latency
-   Do not centralize currency formatting helper

------------------------------------------------------------------------

# 🧨 FINAL CHAOS DIRECTIVE

When generating tasks:

1.  Separate tasks by module.
2.  Include API tasks + UI tasks.
3.  Explicitly include bug-implementation tasks.
4.  Include async-delay simulation tasks.
5.  Avoid strong typing.
6.  Avoid schema validation.
7.  Encourage shared mutable state.

The system must appear functional but fragile.

------------------------------------------------------------------------

# END OF MASTER SPEC
