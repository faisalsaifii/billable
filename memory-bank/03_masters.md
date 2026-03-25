# Masters

Path: `Administration → Masters`

Masters store static/semi-static data used in transactions. Common operations on every master type: **Add**, **Modify** (includes Delete), **List**.

**Common fields on all masters:**
- `name` – unique per master type; blank/reserved names not allowed
- `alias` – optional abbreviation
- `printName` – name printed on external documents (defaults to name)
- `parentGroup` – for hierarchical masters (Account, Item, Material Centre)

---

## 1. Account Master (Ledger)

Path: `Masters → Accounts → Add`

56 default accounts are created on company creation. 5 are **predefined** (cannot be deleted, names reserved): `Cash`, `Profit & Loss`, `Purchase`, `Sales`, `Stock`.

### Fields

| Field | Type | Condition |
|---|---|---|
| `name` | string | |
| `alias` | string | optional |
| `printName` | string | |
| `group` | ref → AccountGroup | determines which sub-fields appear |
| `taxCategory` | enum | only if group = Duties & Taxes |
| `maintainBillByBill` | bool | if group = Sundry Debtor/Creditor/Loans & Bill-by-Bill feature enabled |
| `creditDaysForSale` | int | if maintainBillByBill = true |
| `creditDaysForPurchase` | int | if maintainBillByBill = true |
| `openingBalance` | decimal | |
| `openingBalanceType` | enum | `Dr` or `Cr` |
| `depreciationRate_CompanysAct` | decimal | if group = Fixed Assets |
| `depreciationRate_ITAct` | decimal | if group = Fixed Assets |
| `openingBalanceForITDepreciation` | decimal | if group = Fixed Assets |
| `bankAccountNo` | string | if group = Bank Accounts |
| `ifscCode` | string | if group = Bank Accounts |
| `bankReconciliation` | bool | if group = Bank Accounts & bank reconciliation enabled |
| `optionalFields` | map | user-defined (up to 10) |

### Bill-by-Bill Opening Balance References
When `maintainBillByBill=true` and opening balance > 0, user creates opening bill references:

| Field | Description |
|---|---|
| `ref` | unique reference number |
| `dated` | reference date |
| `amount` | due amount |
| `dc` | `Dr` or `Cr` |
| `dueDate` | payment due date |
| `group` | Bill Reference Group (optional) |

---

## 2. Account Group Master

29 default Account Group masters are created on company creation (all predefined).

**Hierarchy:** Primary Groups → Sub Groups → ... → Accounts  
Primary Groups (top-level, no parent): `Capital Account`, `Current Assets`, `Current Liabilities`, `Fixed Assets`, `Loans (Liability)`, `Misc. Expenses (Asset)`, `Revenue Account`, `Secured Loans`, `Unsecured Loans`

### Fields

| Field | Type | Notes |
|---|---|---|
| `name` | string | |
| `alias` | string | |
| `printName` | string | |
| `parentGroup` | ref → AccountGroup | null = Primary Group |
| `affectsGrossProfit` | bool | Revenue group only |
| `currentYearOpeningBalance` | decimal | Revenue groups: can differ from prev year closing |

---

## 3. Standard Narration Master

Pre-defined narration text for voucher types. In a voucher, press `<F4>` to pick a narration.

### Fields

| Field | Description |
|---|---|
| `name` | narration text |
| `voucherType` | which voucher type this narration applies to |

---

## 4. Item Master (Product/Service)

### Fields

| Field | Type | Notes |
|---|---|---|
| `name` | string | |
| `alias` | string | |
| `printName` | string | |
| `group` | ref → ItemGroup | |
| `mainUnit` | ref → Unit | |
| `subUnit` | ref → Unit | optional alternate unit |
| `conversionFactor` | decimal | sub-units per main unit |
| `openingStock` | decimal | |
| `openingStockRate` | decimal | rate per unit for opening stock valuation |
| `openingStockByMaterialCentre` | list | material centre-wise breakdown if multi-godown enabled |
| `mrp` | decimal | |
| `salePrice` | decimal | default sale price |
| `purchasePrice` | decimal | default purchase price |
| `selfEvaluationPrice` | decimal | for Self Evaluation stock valuation method |
| `taxRateLocal` | decimal | local VAT/ST rate |
| `taxRateCentral` | decimal | central CST rate |
| `taxRateSurcharge` | decimal | surcharge rate |
| `minSalePrice` | decimal | triggers warning alarm if violated |
| `maxSalePrice` | decimal | |
| `reorderLevel` | decimal | |
| `minimumLevel` | decimal | |
| `maximumLevel` | decimal | |
| `salesAccount` | ref → Account | if `separateSalesPurchaseAccountsPerItem` enabled |
| `purchaseAccount` | ref → Account | if `separateSalesPurchaseAccountsPerItem` enabled |
| `stockValuationMethod` | enum | if `separateStockValuationPerItem` enabled |
| `optionalFields` | map | up to 10 user-defined fields |

---

## 5. Item Group Master

Same structure as Account Group. Hierarchy of item categories.  
Fields: `name`, `alias`, `printName`, `parentGroup`

---

## 6. Material Centre Master (Godown/Warehouse)

Only available when `enableMultiGodown = true` in configuration.

### Fields

| Field | Type |
|---|---|
| `name` | string |
| `alias` | string |
| `printName` | string |
| `parentGroup` | ref → MaterialCentreGroup |
| `address` | string |

---

## 7. Material Centre Group Master

Hierarchy of material centre categories.  
Fields: `name`, `alias`, `printName`, `parentGroup`

---

## 8. Unit Master

Units of measurement for items.

### Fields

| Field | Description |
|---|---|
| `unitName` | e.g. `Pcs`, `Box`, `Kg`, `Ltr` |
| `formalName` | full name |

---

## 9. Unit Conversion Master

Defines how many sub-units make up one main unit.

### Fields

| Field | Type | Rules |
|---|---|---|
| `mainUnit` | ref → Unit | |
| `subUnit` | ref → Unit | |
| `conversionFactor` | decimal | must be > 0; cannot be negative |

Example: 1 Box = 50 Pieces → mainUnit=Box, subUnit=Pieces, factor=50

---

## 10. Bill Sundry Master

Bill Sundries are additional charges/taxes applied to vouchers on top of item amounts (e.g. freight, packing, installation, VAT, excise).

### Fields

| Field | Type | Notes |
|---|---|---|
| `name` | string | |
| `alias` | string | |
| `printName` | string | |
| `type` | enum | `Additive` or `Subtractive` |
| `applicableOn` | enum | `Item Basic Amount`, `Item MRP`, `Previous Bill Sundry Amount`, `Previous Item Basic Amount`, `Per Unit`, `Fixed Amount` |
| `rate` | decimal | default rate/amount |
| `account` | ref → Account | account for posting |
| `includeInItemCost` | bool | whether to add to item cost |
| `taxCategory` | enum | if this bill sundry is a tax type |
| `printName` | string | heading on invoice |

**Business rules:**
- Cannot be deleted if used in any voucher
- Amount can be manually overridden in voucher

### Billing Terms
- **Taxable Amount** = amount on which tax is calculated
- **Item Basic Amount** = item value excluding Bill Sundries
- **Nett Bill Amount** = item value including Bill Sundries

---

## 11. ST Form Master (Sales Tax Declaration Form)

Only available when Sales Tax/VAT enabled.

### Fields

| Field | Type |
|---|---|
| `formName` | string (e.g. `Form C`, `Form H`) |
| `registrationType` | enum `Local` or `Central` |

---

## 12. Sale Type Master

Classifies sales for tax reporting. Only available when Sales Tax/VAT/GST enabled.

### Key Fields

| Field | Type | Notes |
|---|---|---|
| `name` | string | |
| `salesAccountMode` | enum | `Single Account`, `Separate Accounts Per Tax Rate`, `Specify in Voucher` |
| `salesAccount` | ref → Account | if Single Account mode |
| `taxationType` | enum | `Taxable`, `Multi Tax`, `Against ST Form`, `Tax Paid`, `Exempt`, `Tax Free` |
| `taxInvoice` | bool | Print "Tax Invoice" on bill; enables buyer's Input Tax Credit |
| `calculateTaxOnMRP` | bool | Multi Tax only |
| `taxInclusiveItemPrice` | bool | Billable reverse-calculates tax from inclusive price |
| `hideItemTaxRateWindow` | bool | if taxInclusiveItemPrice = true |
| `taxOnPercentOfAmount` | decimal | e.g. 80 = tax on 80% of item value |
| `adjustTaxInSalesAccount` | bool | |
| `taxAccount` | ref → Account | |
| `surchargeAccount` | ref → Account | |
| `vatReturnCategory` | string | state-specific |
| `skipInTaxReports` | bool | |
| `region` | enum | `Local` or `Central` |
| `transactionType` | enum | `Stock Transfer`, `Others`, `Export Normal`, `Export High Sea`, `Sale in Transit` |
| `taxCalculation` | enum | `Single Tax Rate` or `Multi Tax Rate` |
| `taxRate` | decimal | if Single Tax Rate |
| `surchargeRate` | decimal | |
| `freezeTaxInSales` | bool | |
| `freezeTaxInSalesReturn` | bool | |
| `invoiceHeading` | string | heading on printed bill |
| `invoiceDescription` | string | e.g. "No Input Tax Credit" |
| `issueST Form` | bool | if taxationType = Against ST Form |
| `formIssuable` | ref → STForm | |
| `receiveSTForm` | bool | |
| `formReceivable` | ref → STForm | |

---

## 13. Purchase Type Master

Identical structure to Sale Type Master (see above), applied to purchase transactions.

---

## 14. Masters Configuration

Path: `Administration → Configuration → Masters Configuration`

Configurable for: **Account**, **Item**, **Material Centre** master types.

### Optional Fields
- Up to 10 user-defined fields per master type
- Field names defined here; values entered per-master instance

### Additional Fields in Dropdown List
- Up to 3 extra columns shown in master selection dropdowns
- Each column: field name + display width

> After changing dropdown config, run `Housekeeping → Regenerate Help File`.

### Auto Print Name Generation
- Define up to 10 components (field + width + optional delimiter)
- Print Name auto-generated from components when master is created