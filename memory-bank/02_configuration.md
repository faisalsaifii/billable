# Configuration

Path: `Administration → Configuration`

---

## 1. Features / Options

Grouped into tabs. Below are the tabs covered in the basic courseware.

### General Tab

| Field | Type | Description |
|---|---|---|
| `currencySymbol` | string | Default from company creation |
| `currencyString` | string | |
| `currencySubString` | string | |
| `numberFormat` | enum | `Indian` (9,99,99,999.99) or `International` (999,999,999.99) |
| `skipCurrencySeparator` | bool | Suppress commas in numbers |
| `dateFormat` | enum | Display format for dates |
| `dateSeparator` | string | `-`, `/`, `:` etc. |
| `currencyDecimalPlaces` | int | Digits after decimal in amounts |
| `country` | string | |
| `state` | string | Some states trigger "Load Default Invoice Formats" button |
| `deleteExportedFilesOnClose` | enum | `Never`, `Ask before Deletion`, `Delete Automatically` |
| `displayThoughtOfTheDay` | bool | |

### Accounts Tab

| Feature | Type | Description |
|---|---|---|
| `billByBillDetails` | bool | Track individual bills per party with due dates; enables Bill Reference Groups |
| `billReferenceGrouping` | bool | Sub-option: group bills by category (e.g. vendor name) |
| `companysActDepreciation` | bool | Charge depreciation per Company's Act in addition to IT Act |
| `postSaleReturnToPurchaseAccount` | bool | Post sale/purchase returns directly to sale/purchase account |
| `doubleEntryPaymentReceipt` | bool | If false, single-entry mode for payment/receipt vouchers |
| `showAccountBalanceDuringEntry` | bool | Show current account balance while entering a voucher |
| `bankReconciliation` | bool | Enable cheque issued/deposited tracking |

> **Rule:** If `doubleEntryPaymentReceipt` is enabled and Payment/Receipt vouchers exist, it cannot be disabled.

### Inventory Tab

| Feature | Type | Description |
|---|---|---|
| `qtyDecimalPlaces` | int | Digits after decimal in item quantities |
| `stockValuationMethod` | enum | FIFO, LIFO, Last Purchase, Last Qty In, Last Sale, Self Evaluation, Weighted Average, Average Price |
| `enableMultiGodown` | bool | Enables Material Centre masters and Stock Transfer voucher |
| `enableBillSundryNarration` | bool | Narration field in Bill Sundry grid during voucher entry |
| `showItemBalanceDuringEntry` | bool | Show current stock during voucher entry |
| `separateStockUpdationDate` | bool | Allow different date for stock movement vs voucher date |
| `separateSalesPurchaseAccountsPerItem` | bool | Post item sales/purchases to item-specific accounts |
| `separateStockValuationPerItem` | bool | Different valuation method per item |
| `itemPricingMode` | object | See below |

**itemPricingMode** (separate for Sales and Purchase):
- `showPartyLastPrice` – price from last transaction with this party
- `showLastItemPrice` – price from last transaction for this item (any party)
- `defaultFromItemMaster` – pick from Item master
- `treatMRPAsSalesPrice` – bool

### Sales Tax / VAT / GST Tab

| Field | Type | Notes |
|---|---|---|
| `enableTaxReporting` | bool | |
| `taxType` | enum | `LST`, `VAT`, `GST` |
| `defaultTaxRate1` | decimal | Non-India only |
| `defaultTaxRate2` | decimal | Non-India only |
| `lstRegNo` | string | |
| `cstRegNo` | string | |
| `stWardNo` | string | |
| `st37RegNo` | string | LST only |
| `tin` | string | VAT only |
| `signatoryDetails` | object | name, fatherName, designation |
| `adjustOutputCSTInInputVAT` | bool | VAT only |
| `pickVATOpBalFromLedger` | bool | VAT only |
| `gstNo` | string | GST only |
| `specifyOriginalSalesInReturn` | bool | Show original invoice detail in Sales Return |
| `transportDetailsInLocalSales` | bool | Prompt transport window for local transactions |
| `enableAddTax` | bool | Additional Tax / Surcharge |
| `addTaxCaption` | string | |
| `enableAddTaxInCentralTransactions` | bool | |
| `addTaxCalculatedOn` | enum | `Item Amount` or `Tax Amount` |

---

## 2. Hardware Configuration

Path: `Administration → Configuration → Hardware Configuration`

| Field | Type | Description |
|---|---|---|
| `defaultPrinterDriver` | string | Selected from installed printers |
| `pageLength` | decimal | Paper length in inches |
| `linesPerPageNormal` | int | Default 60 |
| `linesPerPageLandscape` | int | Default 60 |
| `printingStyle` | enum | `Windows` (graphics) or `DOS` (draft) |

**Windows Printing Style extra fields:**
| Field | Default |
|---|---|
| `paperTopMargin` | 0.25 in |
| `paperLeftMargin` | 0.25 in |
| `shrinkPrintingNormal` | % (e.g. 80–100%) |
| `shrinkPrintingLandscape` | % |

**DOS Printing Style extra fields:**
| Field | Description |
|---|---|
| `dosEmulation` | e.g. `Epson` – choose nearest dot-matrix driver |
| `printerCommands` | Configurable printer control codes (+ 3 custom Command slots) |

---

## 3. Warning Alarms

Path: `Administration → Configuration → Warning Alarms`

Each alarm condition has three possible actions:
- `No Action` – silently allow
- `Warning Only` – show warning, allow continuation
- `Don't Allow` – block action until corrected

**Common alarm conditions:**
- Negative Cash balance
- Negative Stock
- Minimum Sale Price violation
- (Additional alarms may be configured)