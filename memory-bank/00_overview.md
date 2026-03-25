# Billable – Overview & Architecture

## What is Billable?

Billable is an integrated business accounting software for small & medium businesses. It handles:
- Financial Accounting (multi-currency)
- Multi-location Inventory Management
- Sales/Purchase Order Processing
- Invoicing & Document Printing
- Sales Tax / VAT / GST Reporting
- MIS Reports & Analysis

Editions: Single-User (Desktop), Multi-User (LAN), Client-Server (MS-SQL).

---

## Core Architecture

### Two Pillars
| Pillar | Menu | Purpose |
|---|---|---|
| Data Entry | Masters + Transactions | Enter static info and daily transactions |
| Reporting | Display & Printing | View and print reports |

### Menu Structure
```
Company          → create/open/close/edit/delete companies
Administration
  ├── Configuration
  │     ├── Features / Options   (enable/disable modules)
  │     ├── Hardware Configuration (printer settings)
  │     └── Warning Alarms
  ├── Masters
  │     ├── Accounts, Account Groups
  │     ├── Items, Item Groups
  │     ├── Material Centres, Material Centre Groups
  │     ├── Units, Unit Conversions
  │     ├── Bill Sundries
  │     ├── ST Forms, Sale Types, Purchase Types
  │     └── Standard Narrations
  └── Utilities
        ├── Data Freezing
        ├── Data Export (Excel/PDF/HTML)
        ├── Rebuild Databases
        └── Rewrite Books
Transactions
  ├── Sales, Sales Return
  ├── Purchase, Purchase Return
  ├── Payment, Receipt
  ├── Journal, Contra
  ├── Debit Note, Credit Note
  ├── Stock Transfer
  ├── Forms Received/Issued
  └── VAT Journal
Display & Printing
  ├── Accounting Reports (Balance Sheet, Trial Balance, Account Books, Summaries, Outstanding)
  ├── Inventory Reports (Stock Status, Inventory Books, Summaries)
  └── Tax Reports (ST Forms, VAT Summaries, Registers, Reconciliation)
```

---

## Data Model (High Level)

```
Company
  └── FinancialYear(s)
        ├── Masters
        │     ├── AccountGroup (hierarchy)
        │     ├── Account (ledger) → belongs to AccountGroup
        │     ├── ItemGroup (hierarchy)
        │     ├── Item (product/service) → belongs to ItemGroup
        │     ├── MaterialCentre (godown/warehouse)
        │     ├── Unit + UnitConversion
        │     ├── BillSundry (charges/taxes on invoices)
        │     ├── SaleType / PurchaseType
        │     └── STForm
        └── Transactions (Vouchers)
              ├── header: voucherNo, date, stockDate, series, type, narration
              ├── AccountLines (debit/credit entries)
              ├── ItemLines (qty, unit, rate, amount, materialCentre)
              ├── BillSundryLines (additional charges/taxes)
              └── BillReferences (bill-by-bill tracking)
```

---

## Key Domain Concepts

### Voucher Types
All financial events are stored as vouchers:
- **Dual vouchers** – affect both inventory and accounts (Sales, Purchase, etc.)
- **Accounting-only vouchers** – Payment, Receipt, Journal, Contra, Debit/Credit Note
- **Inventory-only vouchers** – Stock Transfer

### Bill-by-Bill Tracking
Each party account can maintain individual bill references with due dates, enabling outstanding analysis.

### Material Centres (Multi-Godown)
Optional feature. Items can be tracked per godown/warehouse location.

### Stock Valuation Methods
FIFO, LIFO, Last Purchase, Last Qty In, Last Sale, Self Evaluation, Weighted Average, Average Price.

### Tax Framework
- **LST** – Local Sales Tax (single-point)
- **VAT** – Value Added Tax (multi-point, Input Tax Credit system)
- **GST** – Goods & Services Tax
- Tax is configured at company level and applied via Sale Type / Purchase Type masters

---

## User & Security Model

- **SuperUser** – one per company, full access, created at company creation
- **Users** – created by SuperUser with configurable access rights
- Authentication required to open a company (username + password)
- Only SuperUser can delete a company

---

## Financial Year Rules
- Company has one original FY start date (immutable)
- Multiple FYs can exist sequentially
- Can delete only first or last FY (not middle)
- Year-end process closes current FY and opens next

---

## Files Referenced in This Spec

| File | Content |
|---|---|
| `01_company.md` | Company setup & management |
| `02_configuration.md` | Features/Options, Hardware, Warning Alarms |
| `03_masters.md` | All master data entities |
| `04_transactions.md` | All voucher types and entry rules |
| `05_printing.md` | Document configuration and printing |
| `06_reports.md` | Accounting, Inventory, Tax reports |
| `07_data_management.md` | Backup, Utilities, Housekeeping, Year-end |