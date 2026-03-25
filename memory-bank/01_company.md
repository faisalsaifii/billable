# Company Management

## Company Entity Fields

| Field | Type | Rules |
|---|---|---|
| `name` | string (unique) | Cannot duplicate; reserved names blocked |
| `printName` | string | Appears on reports; multiple companies may share same printName |
| `fyBeginningFrom` | date | First day of financial year (immutable after save) |
| `booksCommencingFrom` | date | Actual start date of books (can differ from FY start) |
| `address1..4` | string | |
| `itPAN` | string | |
| `telNo` | string | |
| `ward` | string | |
| `fax` | string | |
| `email` | string | |
| `country` | string | |
| `state` | string | |
| `currencySymbol` | string | e.g. `Rs.`, `$` |
| `currencyString` | string | e.g. `Rupees`, `Dollar` |
| `currencySubString` | string | e.g. `Paisa`, `Cent` |
| `enableTax` | boolean | |
| `taxType` | enum | `LST`, `VAT`, `GST` |
| `enableAddTax` | boolean | Additional Tax / Surcharge |
| `addTaxCaption` | string | Label shown for additional tax |
| `tin` | string | Active when taxType = VAT |
| `lstNo` | string | Active when taxType = LST |
| `gstNo` | string | Active when taxType = GST |
| `cstNo` | string | Active when taxType = LST or VAT |
| `defaultTaxRate1` | decimal | Non-India companies only |
| `defaultTaxRate2` | decimal | Non-India companies only |

---

## Operations

### Create Company
1. User fills company form → save
2. System prompts: "Copy Masters & Configuration from existing company?" (Yes/No)
3. System creates company with 56 default Account masters + default Account Groups
4. Immediately prompt **SuperUser creation** (see below)
5. After SuperUser saved → open Features/Options window automatically

### SuperUser Creation
Fields: `superUserName` (max 20 chars), `password` (max 20 chars), `recheckPassword`  
Rules:
- Only one SuperUser per company
- SuperUser has unrestricted access to all data and user management

### Open Company
- Show list of existing companies
- Prompt login (username + password)
- All menus inactive until a company is open (except Company menu)

### Edit Company
- All fields editable except `fyBeginningFrom`

### Close Company
- Must close before exiting application
- Only possible when a company is open

### Delete Company
- Requires SuperUser authentication
- Options:
  - **Complete Company** – delete all financial years
  - **Single F.Y.** – delete first or last FY only (not middle)
- Irreversible (no recovery)

### Set Data Directory
Fields:
- `dataDirectoryPath` – where company data files are stored
- `sessionOnly` (checkbox) – if checked, path is not persisted after app close

### Set Color Scheme
Configurable color components:
- Title Bar (fore/back)
- Textbox (active, inactive, read-only) – fore/back
- Selection List – fore/back
- Data Grid – fore/back for data area and fixed (header) area
- Captions & Notes
- Reports – fore/back, special effect (sub-headings), headings/labels
- Progress Bar – fore/back

Actions: Save Scheme to File, Read Scheme from File, Restore Default Colors, Implement Color Scheme

---

## Business Rules
- Two companies cannot share the same `name`
- Two companies **can** share the same `printName`
- `fyBeginningFrom` cannot be changed after creation
- Cannot delete a middle financial year
- Cannot exit app while a company is open
- Only SuperUser can delete a company