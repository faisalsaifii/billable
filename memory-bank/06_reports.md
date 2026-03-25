# Reports

Path: `Display & Printing`

All reports have a **Report Options** window before rendering. Common options: date range, account/item filter, display name preference (`Name` / `Alias` / `Print Name`), show zero-balance items.

Reports can be output to **Screen** or **Printer**.

---

## Module 1: Accounting Reports

### 1.1 Balance Sheet

Displays financial position (assets vs liabilities) as on a date.

**Formats:** Horizontal (liabilities left, assets right) | Vertical (liabilities then assets)  
**Date options:** Month End | As on Date

**Report Options:**
| Option | Description |
|---|---|
| `atEndOf` | Month or specific date |
| `updateBalanceSheetStock` | Reflect calculated stock value |
| `showSecondLevelGroupDetails` | Show sub-group breakdown |
| `showZeroBalanceMasterOnDrillDown` | Include zero-balance masters when drilling down |
| `showAccountLevelDetails` | Show leaf-level accounts |
| `showZeroBalanceAccount` | Include zero-balance accounts |

---

### 1.2 Trial Balance

Checks arithmetic accuracy: debit vs credit balances.

**Formats:**
- `Closing Trial – Grouped` – group-wise, month end or as-on-date
- `Closing Trial – Alphabetical` – accounts sorted A-Z; sub-formats: Balances Only | Detailed
- `Closing Trial – Hierarchical` – accounts in group hierarchy
- `Opening Trial – Grouped/Alphabetical/Hierarchical` – same as closing variants

**Report Options (Alphabetical – Detailed):**
- startingDate, endingDate
- mastersToPick: `All` | `Moved` | `Moved/Closing Bal`
- splitDrCrOpeningClosing: bool
- showParentGroup: bool

---

### 1.3 Account Books

#### Day Book
All accounting transactions sequentially.

**Options:** showCashBalances (Y/N splits into Dr/Cr columns), startDate, endDate, showLongNarration, showOptFields, showItemDetails, showBillReferences, showVchBillNo, showShortNarration, clubDailyCashSales

#### Ledger
All transactions for an account.

**Sub-formats:**
- `Account-Wise` – per account; format: Standard | T-Format
- `Merged Accounts` – combined for Account Group or Selected Accounts

**Options:** accountName, startDate, endDate, showFullVoucherDetails, showNarration, balancesShownAs (`Daily`/`Monthly`/`All`)

#### Cash / Bank Book
Transactions involving cash or bank accounts. Format: Single Column | Multiple Column.

#### Account Registers (Standard)
One register per voucher type:
- Sales Register, Purchase Register, Sales Return Register, Purchase Return Register
- Payment Register, Receipt Register, Journal Register, Contra Register
- Debit Note Register, Credit Note Register

**Common options:** saleType/purchaseType filter, party filter (All/One/Group/Selected), voucherSeries, startDate, endDate, showBifurcationOfAmount, showMobileNo

#### Account Activity Report
Month-range summary per account. Options: accountName, startMonth, endMonth.

---

### 1.4 Account Summaries

| Report | Description |
|---|---|
| `Daily Balances` | Date-wise closing balance for an account |
| `Daily Summary` | Date-wise opening, debit total, credit total, closing balance |
| `Monthly Summary` | Month-wise summary; formats: Vertical (one account/group) or Horizontal (all accounts) |
| `Consolidated Summary` | Opening, debit, credit, closing for a date range; Account-wise or Group-wise |
| `Transaction Summary` | Extended consolidated with per-voucher-type columns |
| `Profit & Loss A/c` | Net profit/loss for a period; formats: Month or Date range |
| `Profit & Loss Summary` | Month-wise P&L components |
| `Min/Max Cash Balances` | Min and max cash balance in a date range |
| `Account Ledger Comparison` | Month-wise comparison of two accounts |

---

### 1.5 Outstanding Analysis

Requires `billByBillDetails` feature enabled.

| Report | Description |
|---|---|
| `Amount Receivable` | Parties with debit balances (money owed to company) |
| `Bills Receivable` | Pending/due/cleared bill references from parties |
| `Ageing (Receivable)` | Bills classified into time slabs by age |
| `Amount Payable` | Parties with credit balances (money owed by company) |
| `Bills Payable` | Bills to be paid |
| `Ageing (Payable)` | Payables aged into time slabs |
| `On Account Entries` | Transactions without bill references |
| `Bills Summary` | Bills Receivable + Bills Payable + On Account + Ledger Balance per account |
| `Bill-Wise Statement` | Detailed bill-wise report for an account in a date range |
| `Bill Reference Details` | Full detail for a single bill reference |

**Bills Receivable options:**
- typeOfEntries: `All Including Cleared` | `Due` | `Pending`
- referenceGroup filter
- billsStatusAsOn: date
- considerBillsOlderThan: days
- showOnAccAmountAndLedgerBal: bool
- showLastReceiptDetails: bool
- showBillsAdjustmentDetails: bool
- applyFilterOnAmount: bool

---

## Module 2: Inventory Reports

### 2.1 Stock Status

Stock quantity (and optionally value) per item.

**Formats:**
- `Closing Stock – Grouped` – group-wise at month end
- `Closing Stock – Alphabetical` – A-Z; sub-formats: Balances Only | Detailed
- `Closing Stock – Hierarchical` – by item group hierarchy
- `Opening Stock – Grouped/Alphabetical/Hierarchical`

**Balances Only options:** materialCentreFilter (One MC / Group of MC / All MC), itemFilter (One / Group / All), reportDate, showValue, showZeroStock, showParentGroup

**Detailed options:** startDate, endDate, showSalesPurchaseSeparately, showValue, considerStockTransferEntries, mastersToPick

---

### 2.2 Inventory Books

#### Day Book
All inventory-affecting transactions sequentially. Options: startDate, endDate, showValue.

#### Stock Ledger
All transactions for an item.
- `Item-Wise` – single item at one or all MCs
- `Merged Items` – combined for Item Group or Selected Items

**Options:** itemName, materialCentre, startDate, endDate, showValue, showStockTransferEntries

#### Item MC Ledger
Transactions for a specific item at a specific Material Centre. (Only with multi-godown enabled.)

#### Material Centre Register
All inventory transactions at a Material Centre.

#### Inventory Registers (Standard)
- Sales Register, Purchase Register, Sales Return Register, Purchase Return Register, Stock Transfer Register

**Common options:** partyFilter, voucherSeries, startDate, endDate, showValue

#### Bill Sundry Ledger
All transactions using a specific Bill Sundry. Options: billSundry, startDate, endDate.

---

### 2.3 Inventory Summaries

| Report | Description |
|---|---|
| `Daily Stock Summary` | Date-wise qty in/out/closing per item |
| `Monthly Stock Summary` | Month-wise stock movement |
| `Consolidated Stock Summary` | Opening + qty in + qty out + closing for a date range |
| `Item Sales Summary` | Sales quantity and value per item |
| `Item Purchase Summary` | Purchase quantity and value per item |
| `Item Sales & Purchase Summary` | Combined sales and purchase per item |
| `Party Item-Wise Sales` | Item-wise sales for a specific party |
| `Party Item-Wise Purchase` | Item-wise purchase for a specific party |

---

## Module 3: Sales Tax & VAT Reports

### 3.1 ST Forms Reports

| Report | Description |
|---|---|
| `Forms Receivable` | Forms to be received from parties |
| `Forms Issued` | Forms issued to parties |
| `Forms Received` | Forms actually received |
| `Forms Summary` | Summary of all form activity |

---

### 3.2 Sales Tax / VAT Summaries

| Report | Description |
|---|---|
| `VAT Summary` | Output VAT, Input VAT, Net VAT payable per period |
| `CST Summary` | CST payable summary |
| `Input VAT Summary` | Tax paid on purchases |
| `Output VAT Summary` | Tax charged on sales |

---

### 3.3 Sales Tax / VAT Registers (General)

| Report | Description |
|---|---|
| `Purchase Register (VAT)` | All purchases with tax breakdown |
| `Sale Register (VAT)` | All sales with tax breakdown |
| `Purchase Return Register (VAT)` | Purchase returns with tax |
| `Sale Return Register (VAT)` | Sale returns with tax |

---

### 3.4 Sales Tax / VAT Reports (State Specific)

State-specific VAT return formats (vary by state). Includes forms like DVAT-30, DVAT-31 (Delhi), etc.

---

### 3.5 VAT Adjustment Details

Report of all VAT Journal entries and adjustments made.

---

### 3.6 Reconcile Accounts & Sales/Purchase Tax

Reconciliation report comparing VAT in ledger accounts vs VAT in sales/purchase transactions. Flags discrepancies.