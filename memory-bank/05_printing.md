# Printing Documents

Path: `Administration → Configuration → Document Printing (Standard)` and `Printing → Print Utilities`

---

## 1. Document Configuration (Standard)

Configures the layout/content of printable invoices for each voucher type.

### Header Section

| Field | Description |
|---|---|
| `printCompanyName` | bool |
| `printCompanyAddress` | bool |
| `printCompanyPhone` | bool |
| `printCompanyTIN` | bool |
| `prePrintedHeader` | bool – skip printing header if stationery already has it |
| `headerText` | custom text below company details |
| `invoiceWidth` | enum: `80`, `94/96`, `132/136` characters |

### Item Details Section

| Field | Description |
|---|---|
| `printItemCode` | bool |
| `printItemDescription` | bool |
| `printItemRate` | bool |
| `printVATWithItems` | bool – price + tax + total per item |
| `printVATSeparatelyWithItems` | bool – for Tax Invoice / Multi Tax / Tax Inclusive |
| `printNarration` | bool |
| `printQtyTotals` | bool – sum of all item quantities |
| `printDailyMessage` | bool |
| `useFullPageForDocument` | bool – continue next invoice on same page if space allows |
| `ejectPageAfterPrinting` | bool |
| `printZeroAmountBillSundries` | bool |

### Optional Fields & Transport Details Printing

- `optionalFieldsPrintMode`: `As Specified in Voucher Series Config` or `As Mentioned Below`
- If `As Mentioned Below`: per-field checkbox to include in document

### Logo

| Field | Type | Notes |
|---|---|---|
| `printLogo` | bool | |
| `imagePath` | string | file path |
| `position` | enum | placement on document |
| `printType` | enum | `Superimpose` (may overlap) or `Create Space` (shifts content down) |
| `height` | int | 0 = default |
| `width` | int | 0 = default |

### Declaration
`declaration` – freetext, printed above footer

### Footer

| Field | Default |
|---|---|
| `termsAndConditions` | standard terms text |
| `signatoryLine1` | company name |
| `signatoryLine2` | "Authorized Signatory" |

---

## 2. Printing Modes

### Online Printing (at voucher save time)

Per voucher series (in Voucher Series Configuration):

| Field | Effect |
|---|---|
| `printAccountVoucherAfterSave` | prompt to print Dr/Cr lines |
| `printInventoryVoucherAfterSave` | prompt to print item lines |
| `printSalesInvoiceAfterSave` | prompt to print full formatted invoice |
| `promptForPrinting` | show prompt vs auto-print |
| `showPrintOptions` | show Printing Options form before printing |
| `defaultCopies` | int |
| `canChangeCopies` | bool |

### Bulk / Offline Printing (Print Utilities)

Path: `Printing → Print Utilities`

**Document** – formatted invoice  
**Inventory Vouchers** – item lines only (no custom format)  
**Accounts Vouchers** – Dr/Cr lines only

Common Printing Options:

| Field | Description |
|---|---|
| `voucherSeries` | filter by series |
| `printBasis` | `Date-Wise` or `Voucher No.-Wise` |
| `startDate` / `endDate` | |
| `startVchNo` / `endVchNo` | |
| `partyScope` | `All Parties`, `Group of Parties`, `One Party` |
| `noOfCopies` | |
| printer/page settings | override Hardware Config defaults |