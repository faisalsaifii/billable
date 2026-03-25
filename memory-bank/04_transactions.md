# Transactions (Vouchers)

Path: `Transactions`

All transactions are recorded as **vouchers**. Common operations on every voucher type: **Add**, **Modify**, **List**.

---

## Voucher Common Header Fields

| Field | Description |
|---|---|
| `series` | Voucher series (user-defined groupings per type) |
| `date` | Voucher date |
| `stockDate` | Stock updation date (separate from voucher date, if feature enabled) |
| `vchNo` | Voucher number (Auto / Manual / Not Required) |
| `narration` | Voucher description (can pick from Standard Narrations via F4) |

---

## Voucher Numbering Configuration

Path: `Administration → Configuration → Vouchers Configuration → [VoucherType] → Voucher Numbering`

| Field | Type | Notes |
|---|---|---|
| `numberingType` | enum | `Automatic`, `Manual`, `Not Required` |
| `prefix` | string | Prepended to number |
| `suffix` | string | Appended to number |
| `startingNo` | int | First voucher number |
| `specifyEndingNo` | bool | Cap total vouchers |
| `endingNo` | int | Max vouchers allowed |
| `warningBeforeLeft` | int | Warn when N vouchers remain |
| `warningMessage` | string | Custom warning text |
| `renumberingFrequency` | enum | `Monthly`, `Yearly`, `Never` |
| `maintainBookNo` | bool | Book tracking |
| `bookSize` | int | Vouchers per book |
| `fixNumericPartLength` | bool | Zero-pad numeric part |
| `totalLengthNumericPart` | int | Total digits |
| `paddingCharacter` | string | e.g. `0` → `0001`, `0010` |

**Manual numbering validations:**
- `duplicateVoucherNumber`: `No Action` / `Warning Only` / `Don't Allow`
- `blankVoucherNumber`: `No Action` / `Warning Only` / `Don't Allow`

---

## Voucher Series Configuration

Path: `Administration → Configuration → Vouchers Configuration → [VoucherType] → Add New`

Each voucher type can have multiple series (e.g. CashSale, CreditSale for Sales). Configurations below apply per series.

### Series Configuration Fields

| Field | Type | Notes |
|---|---|---|
| `noOfOptionalFields` | int | 0–10 user-defined fields |
| `optionalFieldNames` | list[string] | Name for each field |
| `addFieldWithItem` | bool | Extra per-item field in grid |
| `addFieldName` | string | Name of per-item field |
| `itemWiseDescription` | bool | Multi-line description per item |
| `descriptionLinesCount` | int | 1–10 lines |
| `descriptionTitles` | list[string] | |
| `itemWiseDiscount` | bool | Discount field per item |
| `discountType` | enum | `Simple Discount` |
| `discountFedAs` | enum | `Absolute Amount`, `Percentage (on Price/MRP/Amount)`, `Per Main Qty` |
| `separateBillingDetails` | bool | Override party address per voucher |
| `inputItemMRP` | bool | Enter MRP per item in voucher |
| `skipItemQtyUnitPrice` | bool | Useful for service-type companies |
| `itemsSortingOnSave` | enum | `None`, `Alphabetically Item-Wise`, `Alphabetically Item Group-Wise` |
| `defaultDateAs` | enum | `System Date` or `Last Voucher Date` |
| `inputTransportDetails` | bool | Transport window for central transactions |
| `autoRoundOff` | bool | Auto round final amount |
| `roundOffMode` | enum | `Always Upper`, `Always Lower`, `Automatic` |
| `roundOffBillSundryUpper` | ref → BillSundry | Additive sundry for rounding up |
| `roundOffBillSundryLower` | ref → BillSundry | Subtractive sundry for rounding down |
| `askBeforeRoundOff` | bool | |
| `printAccountVoucherAfterSave` | bool | |
| `printInventoryVoucherAfterSave` | bool | |
| `printCopies` | int | Default copies to print |

---

## Voucher Types

### 1. Sales
Records outward sale of goods. Updates inventory (outward) and accounts (party debited, sales credited).

**Header:**
- `series`, `date`, `stockDate`, `vchNo`
- `saleType` – ref → SaleType (if tax enabled)
- `party` – ref → Account (Sundry Debtor/Creditor, Cash, Bank)
- `materialCentre` – ref → MaterialCentre (if multi-godown enabled)
- `salesAccount` – ref → Account (only if Sale Type = Specify in Voucher)
- `narration`

**Item Details Grid (repeating rows):**
- `item` → ref → Item
- `qty` → decimal
- `unit` → ref → Unit
- `price` → decimal
- `amount` → decimal (auto = qty × price; editable)
- `itemWiseTaxRate` → decimal (if Multi-Tax Sale Type)
- `itemWiseSurchargeRate` → decimal

**Bill Sundry Grid (repeating rows):**
- `billSundry` → ref → BillSundry
- `rate` → decimal (overrides default)
- `amount` → decimal

**Post-save windows (conditional):**
1. `STFormsDetails` – if Sale Type has Against ST Form
2. `BillByBillAdjustment` – if party has Maintain Bill-by-Bill = true
3. `SalesTaxReportingDetails` – for central transactions (description, total qty, form no)
4. `OriginalSalesInvoiceDetails` – for Sales Return, if config enabled

---

### 2. Sales Return
Identical to Sales voucher. Quantities treated as returned (increases stock).

---

### 3. Purchase
Records inward purchase of goods. Updates inventory (inward) and accounts (purchase debited, party credited).

Same structure as Sales with:
- `purchaseType` instead of `saleType`
- `purchaseAccount` instead of `salesAccount`
- Post-save: `SalesTaxReportingDetails` with purchase bill no, purchase bill date

---

### 4. Purchase Return
Identical to Purchase. Quantities treated as returned (decreases stock).

---

### 5. Payment
Records money paid out to parties or expenses.

**Two modes (configured in Features/Options):**

**Double Entry Mode:**
- `series`, `date`, `vchNo`
- `accountDetailsGrid` (repeating):
  - `dc` – `D` or `C`
  - `account` – ref → Account
  - `debit` / `credit` – decimal
  - `shortNarration`
- `longNarration`

**Single Entry Mode:**
- `series`, `date`, `vchNo`
- `paymentMode` – Cash or Bank account
- `narration`
- `accountDetailsGrid` (repeating):
  - `account` – account to debit
  - `amount`
  - `shortNarration`

**Post-save windows:**
- `BillByBillAdjustment` – if account has bill-by-bill enabled
- `VATAdjustmentDetails` – if account is a VAT account
  - vatAdjustmentType: `Payment`, `Input Tax Adjustment`, `Output Tax Adjustment`
  - challanNo, date, chequeNo, bankName, periodEnding, interest, penalty
- `CSTAdjustmentDetails` – if account is a CST account

---

### 6. Receipt
Identical structure to Payment. Records money received.

---

### 7. Journal
Records entries that don't fit other categories (e.g. depreciation, adjustments).

Same structure as Payment (double entry Account Details grid).  
Default voucher numbering: `Not Required`.

---

### 8. Contra
Records cash/bank transfers only (cash deposit, withdrawal, bank-to-bank).

Same as Journal but account list filtered to Cash and Bank groups only.

---

### 9. Debit Note
Raise a debit against a party for reasons other than an invoice (e.g. price correction upward).

Structure: same as Journal (Account Details grid with D/C).  
Default voucher numbering: `Automatic`.

---

### 10. Credit Note
Raise a credit for a party (e.g. extra discount given).

Identical structure to Debit Note.

---

### 11. Stock Transfer
Moves stock between Material Centres. Only available when `enableMultiGodown = true`.

**Header:**
- `series`, `date`, `vchNo`
- `from` – ref → MaterialCentre
- `to` – ref → MaterialCentre
- `narration`

**Item Details Grid:** `item`, `qty`, `unit`, `price`, `amount`  
**Bill Sundry Grid:** `billSundry`, `rate`, `amount`

---

### 12. Forms Received
Records Sales Tax Declaration forms received from parties. Only if Tax enabled.

| Field | Description |
|---|---|
| `date` | Receipt date |
| `form` | ref → STForm |
| `formNo` | Unique number printed on the physical form |
| `stateOfIssue` | State from which form was issued |
| `party` | ref → Account |
| `narration` | |
| `billDetailsGrid` | billNo, date, amount (links to voucher with form receivable amount) |

---

### 13. Forms Issued
Records Sales Tax Declaration forms issued to parties. Only if Tax enabled.

Same as Forms Received plus:
- `rcvdFromAuthorityOn` – date received from Sales Tax authority

---

### 14. VAT Journal
Special VAT adjustments for transactions not captured in Sales/Purchase. Only if tax type = VAT.

| Field | Description |
|---|---|
| `month` | Month being adjusted |
| `inputTaxGrid` | taxIncrease/Decrease, nature, amount, surcharge |
| `outputTaxGrid` | taxIncrease/Decrease, nature, amount, surcharge |
| `refundInputTax` | Amount to claim from government |
| `refundSurcharge` | Surcharge amount to claim |

---

## Bill-by-Bill Adjustment Window

Appears when saving a voucher for a party with `maintainBillByBill = true`.

| Field | Description |
|---|---|
| `method` | `New Ref`, `Adjust`, `Append` |
| `ref` | Reference number (new or existing) |
| `amount` | Bill amount |
| `dc` | `D` or `C` |
| `dueDate` | Payment due date |
| `group` | Bill Reference Group (optional) |