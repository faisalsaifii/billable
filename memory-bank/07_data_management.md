# Data Management

---

## 1. Backup

### 1.1 Backup Configuration

Path: `Administration → Configuration → Backup Configuration`

| Field | Type | Description |
|---|---|---|
| `backupType` | enum | `Normal Backup` (disk) or `FTP Backup` |
| `backupPathByDay[Monday..Sunday]` | string | Folder path per weekday for normal backup |
| `ftpServerName` | string | FTP server hostname |
| `ftpUserName` | string | |
| `ftpPassword` | string | |
| `ftpFolderByDay[Monday..Sunday]` | string | Folder per weekday on FTP |
| `promptForBackupOnCompanyClose` | bool | Show backup reminder when closing company |

### 1.2 Taking Backup

Path: `Company → Backup Data`

- Requires authentication (username + password)
- Options: `Normal Backup` (path on disk) or `FTP Backup` (remote server)
- `selectFinYear`: single FY or All FY
- Backup path auto-populated from Backup Configuration if configured
- Creates a backup archive; can create multiple copies in one session

### 1.3 Restore Data

Path: `Company → Restore Data`

- Options: `Normal Backup Restoration` (local path) or `FTP Backup Restoration`
- **Conflict handling:**
  - If full company with same name exists → prompt overwrite (Yes) or create new company with date appended (No)
  - If single FY with same FY exists → same overwrite/new-company logic

---

## 2. Utilities

### 2.1 Data Freezing

Path: `Administration → Utilities → Data Freezing`

Prevents any add/modify/delete of masters or vouchers on or before the freeze date.

| Field | Description |
|---|---|
| `freezeData` | `Y` to freeze, `N` to unfreeze |
| `freezingDate` | Date up to which data is frozen |

**Business rules:**
- Frozen data cannot be modified
- Can be unfrozen by setting `freezeData = N`
- Window shows current freeze status

### 2.2 Data Export

Path: Export button in any Report window (Display menu)

| Field | Description |
|---|---|
| `dataFormat` | `MS-Excel (XLS)`, `PDF`, `HTML`, `Text File – Delimited`, `Text File – Fixed Width` |
| `fileName` | Output file path |
| `delimiter` | Separator character (Delimited mode only) |
| `columnWidths` | Width per column (Fixed Width mode only) |

All reports viewed via Display menu can be exported.

---

## 3. Housekeeping

### 3.1 Rebuild Databases

Path: `Company → Rebuild Databases` or `Housekeeping → Rebuild Databases`

- Re-indexes corrupted database files
- Compacts unused database space
- **Always take a backup before rebuilding**
- Requires selecting the company; no authentication shown (operates at app level)

### 3.2 Rewrite Books

Path: `Housekeeping → Rewrite Books`

Re-posts all transactions to the books of account. Needed when:
- Configuration changes affect how vouchers are posted (e.g. Sales Account changed in Sale Type)
- Incomplete transactions due to power failure or crash

**Always take a backup before rewriting books.**

### 3.3 Regenerate Help File

Path: `Housekeeping → Regenerate Help File`

Must be run after changing **Masters Configuration → Additional Fields in Dropdown List** so that new fields appear in master selection dropdowns.

---

## 4. Year-End Process

### 4.1 Year-End Journal Entries

Standard entries posted at financial year end via Journal voucher:

| Entry | Debit | Credit |
|---|---|---|
| Depreciation on fixed assets | Depreciation A/c | Fixed Asset A/c |
| Interest on loan | Interest on Loan A/c | Loan A/c |
| Profit transfer (partnership) | Profit & Loss A/c | Partners' Capital A/cs |
| Profit transfer (company) | Profit & Loss A/c | Reserves & Surplus A/c |
| VAT payable (last quarter) | VAT A/c | VAT Payable A/c |

**VAT payment for last quarter (cross-FY pattern):**
1. On 31st March: enter Payment voucher debiting VAT A/c, crediting VAT Payable A/c — leave VAT Adjustment Details blank
2. In new FY when depositing: enter Payment voucher (VAT Payable A/c Dr, Bank A/c Cr)
3. Switch back to previous FY and fill in VAT Adjustment Details (challan, cheque, bank) on original voucher

### 4.2 Changing Financial Year

Path: `Administration → Change Financial Year`

**Create new FY:**
- Select `New Year From 01/04/XXXX`
- System runs year-close process: carries forward balances, opens new FY
- Prompt: carry forward uncleaned bank reconciliation entries (Yes/No)

**Switch to previous FY:**
- Select `F.Y. From – 01/04/XXXX` for the desired year
- Make corrections as needed
- Switch back to current FY → **Carry Balances** prompt appears:
  - `All Masters` – carry forward balances of all masters
  - `New & Changed Masters` – carry forward only modified masters
- Bank Reconciliation prompt: carry forward uncleared entries (Yes/No)

**Business rules:**
- Cannot switch to a FY prior to the company's original `fyBeginningFrom`
- Multiple FYs can exist; only first and last can be deleted

---

## 5. Keyboard Shortcuts Reference

| Shortcut | Action |
|---|---|
| F1 | Online Help |
| F2 | Save Master / Voucher |
| F3 | Add New Master (in voucher field) |
| F4 | Pick Standard Narration / BOM Help |
| F5 | List of Records |
| F6 | Change Voucher Type |
| F7 / ALT+R | Repeat last value |
| F8 | Delete selected Master / Voucher |
| F9 | Delete selected row in grid |
| F10 | Calculator |
| F11 | Pick data from Orders |
| ALT/CTRL+F1 | Add New Account |
| ALT/CTRL+F2 | Add Item |
| ALT/CTRL+F3 | Add Voucher |
| ALT/CTRL+F5 | Add Payment Voucher |
| ALT/CTRL+F6 | Add Receipt Voucher |
| ALT/CTRL+F7 | Add Journal Voucher |
| ALT/CTRL+F8 | Add Sales Voucher |
| ALT/CTRL+F9 | Add Purchase Voucher |
| ALT/CTRL+A | Accounts Monthly Summary |
| ALT/CTRL+B | Balance Sheet |
| CTRL+D | Batch Deletion |
| ALT/CTRL+E | Data Export / Import |
| ALT/CTRL+F | Configuration |
| ALT/CTRL+G | Item Ledger |
| ALT/CTRL+I | Item Monthly Summary |
| ALT/CTRL+L | Account Ledger |
| ALT/CTRL+M | Modify Master |
| ALT/CTRL+N | Notes Manager |
| ALT/CTRL+Q | Query on Transactions |
| ALT/CTRL+S | Stock Status (Grouped) |
| ALT/CTRL+T | Trial Balance (Grouped) |
| ALT/CTRL+U | Utilities |
| ALT+V | VAT Summary |
| ALT+P | Show Pending Batches |