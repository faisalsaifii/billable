import Database from "@tauri-apps/plugin-sql";
import type {
  AccountGroup,
  Account,
  ItemGroup,
  Item,
  Unit,
  UnitConversion,
  MaterialCentre,
  BillSundry,
  SaleType,
  PurchaseType,
  STForm,
  StandardNarration,
} from "../../types";

const DEFAULT_ACCOUNT_GROUPS = [
  { name: "Capital Account", parentName: null, accountType: "Equity", seq: 1 },
  {
    name: "Reserves & Surplus",
    parentName: "Capital Account",
    accountType: "Equity",
    seq: 2,
  },
  { name: "Current Assets", parentName: null, accountType: "Assets", seq: 3 },
  {
    name: "Bank Accounts",
    parentName: "Current Assets",
    accountType: "Bank",
    seq: 4,
  },
  {
    name: "Cash-in-Hand",
    parentName: "Current Assets",
    accountType: "CashInHand",
    seq: 5,
  },
  {
    name: "Deposits (Asset)",
    parentName: "Current Assets",
    accountType: "Assets",
    seq: 6,
  },
  {
    name: "Loans & Advances (Asset)",
    parentName: "Current Assets",
    accountType: "Assets",
    seq: 7,
  },
  {
    name: "Stock-in-Hand",
    parentName: "Current Assets",
    accountType: "Assets",
    seq: 8,
  },
  {
    name: "Sundry Debtors",
    parentName: "Current Assets",
    accountType: "Assets",
    seq: 9,
  },
  {
    name: "Current Liabilities",
    parentName: null,
    accountType: "Liabilities",
    seq: 10,
  },
  {
    name: "Duties & Taxes",
    parentName: "Current Liabilities",
    accountType: "Liabilities",
    seq: 11,
  },
  {
    name: "Provisions",
    parentName: "Current Liabilities",
    accountType: "Liabilities",
    seq: 12,
  },
  {
    name: "Sundry Creditors",
    parentName: "Current Liabilities",
    accountType: "Liabilities",
    seq: 13,
  },
  { name: "Fixed Assets", parentName: null, accountType: "Assets", seq: 14 },
  {
    name: "Loans (Liability)",
    parentName: null,
    accountType: "Liabilities",
    seq: 15,
  },
  {
    name: "Loans & Advances (Liability)",
    parentName: "Loans (Liability)",
    accountType: "Liabilities",
    seq: 16,
  },
  {
    name: "Misc. Expenses (Asset)",
    parentName: null,
    accountType: "Assets",
    seq: 17,
  },
  {
    name: "Revenue Account",
    parentName: null,
    accountType: "Revenue",
    seq: 18,
  },
  {
    name: "Direct Expenses",
    parentName: "Revenue Account",
    accountType: "Expense",
    seq: 19,
  },
  {
    name: "Direct Incomes",
    parentName: "Revenue Account",
    accountType: "Income",
    seq: 20,
  },
  {
    name: "Indirect Expenses",
    parentName: "Revenue Account",
    accountType: "Expense",
    seq: 21,
  },
  {
    name: "Indirect Incomes",
    parentName: "Revenue Account",
    accountType: "Income",
    seq: 22,
  },
  {
    name: "Purchase Accounts",
    parentName: "Revenue Account",
    accountType: "Expense",
    seq: 23,
  },
  {
    name: "Sales Accounts",
    parentName: "Revenue Account",
    accountType: "Income",
    seq: 24,
  },
  {
    name: "Stock Adjustments",
    parentName: "Revenue Account",
    accountType: "Expense",
    seq: 25,
  },
  {
    name: "Secured Loans",
    parentName: null,
    accountType: "Liabilities",
    seq: 26,
  },
  {
    name: "Unsecured Loans",
    parentName: null,
    accountType: "Liabilities",
    seq: 27,
  },
  {
    name: "Branch / Divisions",
    parentName: "Current Assets",
    accountType: "Assets",
    seq: 28,
  },
  {
    name: "Investments",
    parentName: "Current Assets",
    accountType: "Assets",
    seq: 29,
  },
];

const DEFAULT_ACCOUNTS: {
  name: string;
  groupName: string;
  isPredefined: boolean;
}[] = [
  { name: "Cash", groupName: "Cash-in-Hand", isPredefined: true },
  { name: "Profit & Loss", groupName: "Stock Adjustments", isPredefined: true },
  { name: "Purchase", groupName: "Purchase Accounts", isPredefined: true },
  { name: "Sales", groupName: "Sales Accounts", isPredefined: true },
  { name: "Stock", groupName: "Stock-in-Hand", isPredefined: true },
  { name: "Bank OD Account", groupName: "Secured Loans", isPredefined: false },
  {
    name: "Capital Account",
    groupName: "Capital Account",
    isPredefined: false,
  },
  {
    name: "Retained Earnings",
    groupName: "Reserves & Surplus",
    isPredefined: false,
  },
  {
    name: "Advance Tax Deposit",
    groupName: "Deposits (Asset)",
    isPredefined: false,
  },
  { name: "FD Receipts", groupName: "Deposits (Asset)", isPredefined: false },
  { name: "Rent Deposit", groupName: "Deposits (Asset)", isPredefined: false },
  {
    name: "Security Deposits",
    groupName: "Deposits (Asset)",
    isPredefined: false,
  },
  {
    name: "Employee Loans",
    groupName: "Loans & Advances (Asset)",
    isPredefined: false,
  },
  {
    name: "Prepaid Expenses",
    groupName: "Loans & Advances (Asset)",
    isPredefined: false,
  },
  { name: "Closing Stock", groupName: "Stock-in-Hand", isPredefined: false },
  {
    name: "Opening Stock",
    groupName: "Stock Adjustments",
    isPredefined: false,
  },
  { name: "CGST Input", groupName: "Duties & Taxes", isPredefined: false },
  { name: "SGST Input", groupName: "Duties & Taxes", isPredefined: false },
  { name: "IGST Input", groupName: "Duties & Taxes", isPredefined: false },
  { name: "CGST Payable", groupName: "Duties & Taxes", isPredefined: false },
  { name: "SGST Payable", groupName: "Duties & Taxes", isPredefined: false },
  { name: "IGST Payable", groupName: "Duties & Taxes", isPredefined: false },
  { name: "TDS Payable", groupName: "Duties & Taxes", isPredefined: false },
  {
    name: "TDS Receivable",
    groupName: "Loans & Advances (Asset)",
    isPredefined: false,
  },
  {
    name: "Provision for Depreciation",
    groupName: "Provisions",
    isPredefined: false,
  },
  { name: "Provision for Tax", groupName: "Provisions", isPredefined: false },
  {
    name: "Furniture & Fixtures",
    groupName: "Fixed Assets",
    isPredefined: false,
  },
  { name: "Office Equipment", groupName: "Fixed Assets", isPredefined: false },
  { name: "Plant & Machinery", groupName: "Fixed Assets", isPredefined: false },
  { name: "Vehicles", groupName: "Fixed Assets", isPredefined: false },
  { name: "Bank Loan (Term)", groupName: "Secured Loans", isPredefined: false },
  { name: "CC / OD Account", groupName: "Secured Loans", isPredefined: false },
  {
    name: "Director's Loan",
    groupName: "Unsecured Loans",
    isPredefined: false,
  },
  {
    name: "Preliminary Expenses",
    groupName: "Misc. Expenses (Asset)",
    isPredefined: false,
  },
  {
    name: "Pre-operative Expenses",
    groupName: "Misc. Expenses (Asset)",
    isPredefined: false,
  },
  { name: "Freight In", groupName: "Direct Expenses", isPredefined: false },
  { name: "Labour Charges", groupName: "Direct Expenses", isPredefined: false },
  {
    name: "Administrative Charges",
    groupName: "Indirect Expenses",
    isPredefined: false,
  },
  { name: "Audit Fees", groupName: "Indirect Expenses", isPredefined: false },
  { name: "Bank Charges", groupName: "Indirect Expenses", isPredefined: false },
  {
    name: "Communication Expenses",
    groupName: "Indirect Expenses",
    isPredefined: false,
  },
  { name: "Depreciation", groupName: "Indirect Expenses", isPredefined: false },
  {
    name: "Insurance Premium",
    groupName: "Indirect Expenses",
    isPredefined: false,
  },
  {
    name: "Interest on Loan",
    groupName: "Indirect Expenses",
    isPredefined: false,
  },
  {
    name: "Miscellaneous Expenses",
    groupName: "Indirect Expenses",
    isPredefined: false,
  },
  {
    name: "Printing & Stationery",
    groupName: "Indirect Expenses",
    isPredefined: false,
  },
  {
    name: "Professional Charges",
    groupName: "Indirect Expenses",
    isPredefined: false,
  },
  {
    name: "Rent, Rates & Taxes",
    groupName: "Indirect Expenses",
    isPredefined: false,
  },
  {
    name: "Repairs & Maintenance",
    groupName: "Indirect Expenses",
    isPredefined: false,
  },
  {
    name: "Salary & Wages",
    groupName: "Indirect Expenses",
    isPredefined: false,
  },
  {
    name: "Travelling Expenses",
    groupName: "Indirect Expenses",
    isPredefined: false,
  },
  {
    name: "Interest Received",
    groupName: "Indirect Incomes",
    isPredefined: false,
  },
  {
    name: "Discount Received",
    groupName: "Indirect Incomes",
    isPredefined: false,
  },
  {
    name: "Miscellaneous Income",
    groupName: "Indirect Incomes",
    isPredefined: false,
  },
];

class MastersService {
  private db: Database | null = null;

  async initialize(db: Database) {
    this.db = db;
    await this.createTables();
  }

  private async createTables() {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS account_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyId INTEGER NOT NULL,
        name TEXT NOT NULL,
        alias TEXT,
        printName TEXT,
        parentGroupId INTEGER,
        accountType TEXT NOT NULL,
        affectsGrossProfit INTEGER DEFAULT 0,
        sequenceNo INTEGER DEFAULT 0,
        isPredefined INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        UNIQUE(companyId, name),
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (parentGroupId) REFERENCES account_groups(id) ON DELETE SET NULL
      );
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyId INTEGER NOT NULL,
        groupId INTEGER NOT NULL,
        name TEXT NOT NULL,
        alias TEXT,
        printName TEXT,
        openingBalance REAL DEFAULT 0,
        openingBalanceType TEXT DEFAULT 'Debit',
        maintainBillByBill INTEGER DEFAULT 0,
        creditDaysForSale INTEGER DEFAULT 0,
        creditDaysForPurchase INTEGER DEFAULT 0,
        bankAccountNo TEXT,
        ifscCode TEXT,
        description TEXT,
        isPredefined INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        UNIQUE(companyId, name),
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (groupId) REFERENCES account_groups(id) ON DELETE CASCADE
      );
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS item_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyId INTEGER NOT NULL,
        name TEXT NOT NULL,
        alias TEXT,
        printName TEXT,
        parentGroupId INTEGER,
        description TEXT,
        sequenceNo INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        UNIQUE(companyId, name),
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (parentGroupId) REFERENCES item_groups(id) ON DELETE SET NULL
      );
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyId INTEGER NOT NULL,
        groupId INTEGER NOT NULL,
        name TEXT NOT NULL,
        alias TEXT,
        printName TEXT,
        description TEXT,
        mainUnitId INTEGER,
        subUnitId INTEGER,
        conversionFactor REAL DEFAULT 1,
        openingStock REAL DEFAULT 0,
        openingStockRate REAL DEFAULT 0,
        mrp REAL DEFAULT 0,
        salePrice REAL DEFAULT 0,
        purchasePrice REAL DEFAULT 0,
        hsn TEXT,
        gstRate REAL DEFAULT 0,
        minSalePrice REAL DEFAULT 0,
        reorderLevel REAL DEFAULT 0,
        active INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        UNIQUE(companyId, name),
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (groupId) REFERENCES item_groups(id) ON DELETE CASCADE
      );
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS units (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyId INTEGER NOT NULL,
        name TEXT NOT NULL,
        formalName TEXT,
        description TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        UNIQUE(companyId, name),
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
      );
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS unit_conversions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyId INTEGER NOT NULL,
        fromUnitId INTEGER NOT NULL,
        toUnitId INTEGER NOT NULL,
        conversionFactor REAL NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        UNIQUE(companyId, fromUnitId, toUnitId),
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (fromUnitId) REFERENCES units(id) ON DELETE CASCADE,
        FOREIGN KEY (toUnitId) REFERENCES units(id) ON DELETE CASCADE
      );
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS material_centres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyId INTEGER NOT NULL,
        name TEXT NOT NULL,
        alias TEXT,
        printName TEXT,
        description TEXT,
        address TEXT,
        active INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        UNIQUE(companyId, name),
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
      );
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS bill_sundries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyId INTEGER NOT NULL,
        name TEXT NOT NULL,
        alias TEXT,
        printName TEXT,
        type TEXT NOT NULL DEFAULT 'Additive',
        applicableOn TEXT NOT NULL DEFAULT 'Item Basic Amount',
        rate REAL DEFAULT 0,
        isPercentage INTEGER DEFAULT 1,
        accountId INTEGER,
        description TEXT,
        active INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        UNIQUE(companyId, name),
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
      );
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS sale_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyId INTEGER NOT NULL,
        name TEXT NOT NULL,
        alias TEXT,
        region TEXT NOT NULL DEFAULT 'Local',
        taxationType TEXT NOT NULL DEFAULT 'Taxable',
        taxInvoice INTEGER DEFAULT 0,
        taxRate REAL DEFAULT 0,
        surchargeRate REAL DEFAULT 0,
        invoiceHeading TEXT,
        description TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        UNIQUE(companyId, name),
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
      );
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS purchase_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyId INTEGER NOT NULL,
        name TEXT NOT NULL,
        alias TEXT,
        region TEXT NOT NULL DEFAULT 'Local',
        taxationType TEXT NOT NULL DEFAULT 'Taxable',
        taxRate REAL DEFAULT 0,
        surchargeRate REAL DEFAULT 0,
        description TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        UNIQUE(companyId, name),
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
      );
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS st_forms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyId INTEGER NOT NULL,
        name TEXT NOT NULL,
        registrationType TEXT NOT NULL DEFAULT 'Local',
        description TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        UNIQUE(companyId, name),
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
      );
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS standard_narrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyId INTEGER NOT NULL,
        name TEXT NOT NULL,
        voucherType TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
      );
    `);
  }

  async seedDefaultData(companyId: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();

    // 1. Create 29 default account groups (must handle parent refs in two passes)
    const groupIdMap: Map<string, number> = new Map();

    // First pass: root groups (no parent)
    for (const g of DEFAULT_ACCOUNT_GROUPS.filter((x) => !x.parentName)) {
      try {
        await this.db.execute(
          `INSERT OR IGNORE INTO account_groups
           (companyId,name,parentGroupId,accountType,sequenceNo,isPredefined,affectsGrossProfit,createdAt,updatedAt)
           VALUES (?1,?2,null,?3,?4,1,0,?5,?6)`,
          [companyId, g.name, g.accountType, g.seq, now, now],
        );
      } catch (_) {}
      const rows = await this.db.select<{ id: number }[]>(
        "SELECT id FROM account_groups WHERE companyId=?1 AND name=?2",
        [companyId, g.name],
      );
      if (rows[0]) groupIdMap.set(g.name, rows[0].id);
    }

    // Second pass: sub-groups
    for (const g of DEFAULT_ACCOUNT_GROUPS.filter((x) => x.parentName)) {
      const parentId = groupIdMap.get(g.parentName!) || null;
      try {
        await this.db.execute(
          `INSERT OR IGNORE INTO account_groups
           (companyId,name,parentGroupId,accountType,sequenceNo,isPredefined,affectsGrossProfit,createdAt,updatedAt)
           VALUES (?1,?2,?3,?4,?5,1,0,?6,?7)`,
          [companyId, g.name, parentId, g.accountType, g.seq, now, now],
        );
      } catch (_) {}
      const rows = await this.db.select<{ id: number }[]>(
        "SELECT id FROM account_groups WHERE companyId=?1 AND name=?2",
        [companyId, g.name],
      );
      if (rows[0]) groupIdMap.set(g.name, rows[0].id);
    }

    // 2. Create 56 default accounts
    for (const a of DEFAULT_ACCOUNTS) {
      const groupId = groupIdMap.get(a.groupName);
      if (!groupId) continue;
      try {
        await this.db.execute(
          `INSERT OR IGNORE INTO accounts
           (companyId,groupId,name,openingBalance,openingBalanceType,isPredefined,active,createdAt,updatedAt)
           VALUES (?1,?2,?3,0,'Debit',?4,1,?5,?6)`,
          [companyId, groupId, a.name, a.isPredefined ? 1 : 0, now, now],
        );
      } catch (_) {}
    }

    // 3. Create one default Item Group
    try {
      await this.db.execute(
        `INSERT OR IGNORE INTO item_groups (companyId,name,sequenceNo,createdAt,updatedAt)
         VALUES (?1,'General',1,?2,?3)`,
        [companyId, now, now],
      );
    } catch (_) {}
  }

  // ==================== ACCOUNT GROUPS ====================

  async createAccountGroup(
    data: Omit<AccountGroup, "id" | "createdAt" | "updatedAt">,
  ): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    await this.db.execute(
      `INSERT INTO account_groups (companyId,name,alias,printName,parentGroupId,accountType,affectsGrossProfit,sequenceNo,isPredefined,createdAt,updatedAt)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)`,
      [
        data.companyId,
        data.name,
        data.alias || null,
        data.printName || null,
        data.parentGroupId || null,
        data.accountType,
        data.affectsGrossProfit ? 1 : 0,
        data.sequenceNo || 0,
        data.isPredefined ? 1 : 0,
        now,
        now,
      ],
    );
    const r = await this.db.select<{ id: number }[]>(
      "SELECT last_insert_rowid() as id",
    );
    return r[0]?.id || 0;
  }

  async getAccountGroups(companyId: number): Promise<AccountGroup[]> {
    if (!this.db) throw new Error("Database not initialized");
    return await this.db.select(
      "SELECT * FROM account_groups WHERE companyId=?1 ORDER BY sequenceNo,name",
      [companyId],
    );
  }

  async updateAccountGroup(
    id: number,
    data: Partial<
      Omit<AccountGroup, "id" | "companyId" | "createdAt" | "updatedAt">
    >,
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    const keys = Object.keys(data);
    const fields = keys.map((k, i) => `${k} = ?${i + 1}`).join(", ");
    if (!fields) return;
    await this.db.execute(
      `UPDATE account_groups SET ${fields}, updatedAt=?${
        keys.length + 1
      } WHERE id=?${keys.length + 2}`,
      [...Object.values(data), now, id],
    );
  }

  async deleteAccountGroup(id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.execute(
      "DELETE FROM account_groups WHERE id=?1 AND isPredefined=0",
      [id],
    );
  }

  // ==================== ACCOUNTS ====================

  async createAccount(
    data: Omit<Account, "id" | "createdAt" | "updatedAt">,
  ): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    await this.db.execute(
      `INSERT INTO accounts (companyId,groupId,name,alias,printName,openingBalance,openingBalanceType,
       maintainBillByBill,creditDaysForSale,creditDaysForPurchase,bankAccountNo,ifscCode,description,
       isPredefined,active,createdAt,updatedAt)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17)`,
      [
        data.companyId,
        data.groupId,
        data.name,
        data.alias || null,
        data.printName || null,
        data.openingBalance || 0,
        data.openingBalanceType || "Debit",
        data.maintainBillByBill ? 1 : 0,
        data.creditDaysForSale || 0,
        data.creditDaysForPurchase || 0,
        data.bankAccountNo || null,
        data.ifscCode || null,
        data.description || null,
        data.isPredefined ? 1 : 0,
        data.active ? 1 : 0,
        now,
        now,
      ],
    );
    const r = await this.db.select<{ id: number }[]>(
      "SELECT last_insert_rowid() as id",
    );
    return r[0]?.id || 0;
  }

  async getAccounts(companyId: number): Promise<Account[]> {
    if (!this.db) throw new Error("Database not initialized");
    return await this.db.select(
      "SELECT * FROM accounts WHERE companyId=?1 AND active=1 ORDER BY name",
      [companyId],
    );
  }

  async getAccountsByGroup(groupId: number): Promise<Account[]> {
    if (!this.db) throw new Error("Database not initialized");
    return await this.db.select(
      "SELECT * FROM accounts WHERE groupId=?1 AND active=1 ORDER BY name",
      [groupId],
    );
  }

  async updateAccount(
    id: number,
    data: Partial<
      Omit<Account, "id" | "companyId" | "createdAt" | "updatedAt">
    >,
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    const keys = Object.keys(data);
    const fields = keys.map((k, i) => `${k} = ?${i + 1}`).join(", ");
    if (!fields) return;
    await this.db.execute(
      `UPDATE accounts SET ${fields}, updatedAt=?${keys.length + 1} WHERE id=?${
        keys.length + 2
      }`,
      [...Object.values(data), now, id],
    );
  }

  async deleteAccount(id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.execute(
      "DELETE FROM accounts WHERE id=?1 AND isPredefined=0",
      [id],
    );
  }

  // ==================== ITEM GROUPS ====================

  async createItemGroup(
    data: Omit<ItemGroup, "id" | "createdAt" | "updatedAt">,
  ): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    await this.db.execute(
      `INSERT INTO item_groups (companyId,name,alias,printName,parentGroupId,description,sequenceNo,createdAt,updatedAt)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)`,
      [
        data.companyId,
        data.name,
        data.alias || null,
        data.printName || null,
        data.parentGroupId || null,
        data.description || null,
        data.sequenceNo || 0,
        now,
        now,
      ],
    );
    const r = await this.db.select<{ id: number }[]>(
      "SELECT last_insert_rowid() as id",
    );
    return r[0]?.id || 0;
  }

  async getItemGroups(companyId: number): Promise<ItemGroup[]> {
    if (!this.db) throw new Error("Database not initialized");
    return await this.db.select(
      "SELECT * FROM item_groups WHERE companyId=?1 ORDER BY sequenceNo,name",
      [companyId],
    );
  }

  async updateItemGroup(
    id: number,
    data: Partial<
      Omit<ItemGroup, "id" | "companyId" | "createdAt" | "updatedAt">
    >,
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    const keys = Object.keys(data);
    const fields = keys.map((k, i) => `${k} = ?${i + 1}`).join(", ");
    if (!fields) return;
    await this.db.execute(
      `UPDATE item_groups SET ${fields}, updatedAt=?${
        keys.length + 1
      } WHERE id=?${keys.length + 2}`,
      [...Object.values(data), now, id],
    );
  }

  async deleteItemGroup(id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.execute("DELETE FROM item_groups WHERE id=?1", [id]);
  }

  // ==================== ITEMS ====================

  async createItem(
    data: Omit<Item, "id" | "createdAt" | "updatedAt">,
  ): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    await this.db.execute(
      `INSERT INTO items (companyId,groupId,name,alias,printName,description,mainUnitId,subUnitId,
       conversionFactor,openingStock,openingStockRate,mrp,salePrice,purchasePrice,hsn,gstRate,
       minSalePrice,reorderLevel,active,createdAt,updatedAt)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21)`,
      [
        data.companyId,
        data.groupId,
        data.name,
        data.alias || null,
        data.printName || null,
        data.description || null,
        data.mainUnitId || null,
        data.subUnitId || null,
        data.conversionFactor || 1,
        data.openingStock || 0,
        data.openingStockRate || 0,
        data.mrp || 0,
        data.salePrice || 0,
        data.purchasePrice || 0,
        data.hsn || "",
        data.gstRate || 0,
        data.minSalePrice || 0,
        data.reorderLevel || 0,
        data.active ? 1 : 0,
        now,
        now,
      ],
    );
    const r = await this.db.select<{ id: number }[]>(
      "SELECT last_insert_rowid() as id",
    );
    return r[0]?.id || 0;
  }

  async getItems(companyId: number): Promise<Item[]> {
    if (!this.db) throw new Error("Database not initialized");
    return await this.db.select(
      "SELECT * FROM items WHERE companyId=?1 AND active=1 ORDER BY name",
      [companyId],
    );
  }

  async getItemsByGroup(groupId: number): Promise<Item[]> {
    if (!this.db) throw new Error("Database not initialized");
    return await this.db.select(
      "SELECT * FROM items WHERE groupId=?1 AND active=1 ORDER BY name",
      [groupId],
    );
  }

  async updateItem(
    id: number,
    data: Partial<Omit<Item, "id" | "companyId" | "createdAt" | "updatedAt">>,
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    const keys = Object.keys(data);
    const fields = keys.map((k, i) => `${k} = ?${i + 1}`).join(", ");
    if (!fields) return;
    await this.db.execute(
      `UPDATE items SET ${fields}, updatedAt=?${keys.length + 1} WHERE id=?${
        keys.length + 2
      }`,
      [...Object.values(data), now, id],
    );
  }

  async deleteItem(id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.execute("DELETE FROM items WHERE id=?1", [id]);
  }

  // ==================== UNITS ====================

  async createUnit(
    data: Omit<Unit, "id" | "createdAt" | "updatedAt">,
  ): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    await this.db.execute(
      `INSERT INTO units (companyId,name,formalName,description,createdAt,updatedAt)
       VALUES (?1,?2,?3,?4,?5,?6)`,
      [
        data.companyId,
        data.name,
        data.formalName || null,
        data.description || null,
        now,
        now,
      ],
    );
    const r = await this.db.select<{ id: number }[]>(
      "SELECT last_insert_rowid() as id",
    );
    return r[0]?.id || 0;
  }

  async getUnits(companyId: number): Promise<Unit[]> {
    if (!this.db) throw new Error("Database not initialized");
    return await this.db.select(
      "SELECT * FROM units WHERE companyId=?1 ORDER BY name",
      [companyId],
    );
  }

  async updateUnit(
    id: number,
    data: Partial<Omit<Unit, "id" | "companyId" | "createdAt" | "updatedAt">>,
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    const keys = Object.keys(data);
    const fields = keys.map((k, i) => `${k} = ?${i + 1}`).join(", ");
    if (!fields) return;
    await this.db.execute(
      `UPDATE units SET ${fields}, updatedAt=?${keys.length + 1} WHERE id=?${
        keys.length + 2
      }`,
      [...Object.values(data), now, id],
    );
  }

  async deleteUnit(id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.execute("DELETE FROM units WHERE id=?1", [id]);
  }

  // ==================== UNIT CONVERSIONS ====================

  async createUnitConversion(
    data: Omit<UnitConversion, "id" | "createdAt" | "updatedAt">,
  ): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    await this.db.execute(
      `INSERT INTO unit_conversions (companyId,fromUnitId,toUnitId,conversionFactor,createdAt,updatedAt)
       VALUES (?1,?2,?3,?4,?5,?6)`,
      [
        data.companyId,
        data.fromUnitId,
        data.toUnitId,
        data.conversionFactor,
        now,
        now,
      ],
    );
    const r = await this.db.select<{ id: number }[]>(
      "SELECT last_insert_rowid() as id",
    );
    return r[0]?.id || 0;
  }

  async getUnitConversions(companyId: number): Promise<UnitConversion[]> {
    if (!this.db) throw new Error("Database not initialized");
    return await this.db.select(
      "SELECT * FROM unit_conversions WHERE companyId=?1",
      [companyId],
    );
  }

  async deleteUnitConversion(id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.execute("DELETE FROM unit_conversions WHERE id=?1", [id]);
  }

  // ==================== MATERIAL CENTRES ====================

  async createMaterialCentre(
    data: Omit<MaterialCentre, "id" | "createdAt" | "updatedAt">,
  ): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    await this.db.execute(
      `INSERT INTO material_centres (companyId,name,alias,printName,description,address,active,createdAt,updatedAt)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)`,
      [
        data.companyId,
        data.name,
        data.alias || null,
        data.printName || null,
        data.description || null,
        data.address || null,
        data.active ? 1 : 0,
        now,
        now,
      ],
    );
    const r = await this.db.select<{ id: number }[]>(
      "SELECT last_insert_rowid() as id",
    );
    return r[0]?.id || 0;
  }

  async getMaterialCentres(companyId: number): Promise<MaterialCentre[]> {
    if (!this.db) throw new Error("Database not initialized");
    return await this.db.select(
      "SELECT * FROM material_centres WHERE companyId=?1 ORDER BY name",
      [companyId],
    );
  }

  async updateMaterialCentre(
    id: number,
    data: Partial<
      Omit<MaterialCentre, "id" | "companyId" | "createdAt" | "updatedAt">
    >,
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    const keys = Object.keys(data);
    const fields = keys.map((k, i) => `${k} = ?${i + 1}`).join(", ");
    if (!fields) return;
    await this.db.execute(
      `UPDATE material_centres SET ${fields}, updatedAt=?${
        keys.length + 1
      } WHERE id=?${keys.length + 2}`,
      [...Object.values(data), now, id],
    );
  }

  async deleteMaterialCentre(id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.execute("DELETE FROM material_centres WHERE id=?1", [id]);
  }

  // ==================== BILL SUNDRIES ====================

  async createBillSundry(
    data: Omit<BillSundry, "id" | "createdAt" | "updatedAt">,
  ): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    await this.db.execute(
      `INSERT INTO bill_sundries (companyId,name,alias,printName,type,applicableOn,rate,isPercentage,accountId,description,active,createdAt,updatedAt)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13)`,
      [
        data.companyId,
        data.name,
        data.alias || null,
        data.printName || null,
        data.type,
        data.applicableOn,
        data.rate || 0,
        data.isPercentage ? 1 : 0,
        data.accountId || null,
        data.description || null,
        data.active ? 1 : 0,
        now,
        now,
      ],
    );
    const r = await this.db.select<{ id: number }[]>(
      "SELECT last_insert_rowid() as id",
    );
    return r[0]?.id || 0;
  }

  async getBillSundries(companyId: number): Promise<BillSundry[]> {
    if (!this.db) throw new Error("Database not initialized");
    return await this.db.select(
      "SELECT * FROM bill_sundries WHERE companyId=?1 AND active=1 ORDER BY type,name",
      [companyId],
    );
  }

  async updateBillSundry(
    id: number,
    data: Partial<
      Omit<BillSundry, "id" | "companyId" | "createdAt" | "updatedAt">
    >,
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    const keys = Object.keys(data);
    const fields = keys.map((k, i) => `${k} = ?${i + 1}`).join(", ");
    if (!fields) return;
    await this.db.execute(
      `UPDATE bill_sundries SET ${fields}, updatedAt=?${
        keys.length + 1
      } WHERE id=?${keys.length + 2}`,
      [...Object.values(data), now, id],
    );
  }

  async deleteBillSundry(id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.execute("DELETE FROM bill_sundries WHERE id=?1", [id]);
  }

  // ==================== SALE TYPES ====================

  async createSaleType(
    data: Omit<SaleType, "id" | "createdAt" | "updatedAt">,
  ): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    await this.db.execute(
      `INSERT INTO sale_types (companyId,name,alias,region,taxationType,taxInvoice,taxRate,surchargeRate,invoiceHeading,description,createdAt,updatedAt)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12)`,
      [
        data.companyId,
        data.name,
        data.alias || null,
        data.region,
        data.taxationType,
        data.taxInvoice ? 1 : 0,
        data.taxRate || 0,
        data.surchargeRate || 0,
        data.invoiceHeading || null,
        data.description || null,
        now,
        now,
      ],
    );
    const r = await this.db.select<{ id: number }[]>(
      "SELECT last_insert_rowid() as id",
    );
    return r[0]?.id || 0;
  }

  async getSaleTypes(companyId: number): Promise<SaleType[]> {
    if (!this.db) throw new Error("Database not initialized");
    return await this.db.select(
      "SELECT * FROM sale_types WHERE companyId=?1 ORDER BY name",
      [companyId],
    );
  }

  async updateSaleType(
    id: number,
    data: Partial<
      Omit<SaleType, "id" | "companyId" | "createdAt" | "updatedAt">
    >,
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    const keys = Object.keys(data);
    const fields = keys.map((k, i) => `${k} = ?${i + 1}`).join(", ");
    if (!fields) return;
    await this.db.execute(
      `UPDATE sale_types SET ${fields}, updatedAt=?${
        keys.length + 1
      } WHERE id=?${keys.length + 2}`,
      [...Object.values(data), now, id],
    );
  }

  async deleteSaleType(id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.execute("DELETE FROM sale_types WHERE id=?1", [id]);
  }

  // ==================== PURCHASE TYPES ====================

  async createPurchaseType(
    data: Omit<PurchaseType, "id" | "createdAt" | "updatedAt">,
  ): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    await this.db.execute(
      `INSERT INTO purchase_types (companyId,name,alias,region,taxationType,taxRate,surchargeRate,description,createdAt,updatedAt)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)`,
      [
        data.companyId,
        data.name,
        data.alias || null,
        data.region,
        data.taxationType,
        data.taxRate || 0,
        data.surchargeRate || 0,
        data.description || null,
        now,
        now,
      ],
    );
    const r = await this.db.select<{ id: number }[]>(
      "SELECT last_insert_rowid() as id",
    );
    return r[0]?.id || 0;
  }

  async getPurchaseTypes(companyId: number): Promise<PurchaseType[]> {
    if (!this.db) throw new Error("Database not initialized");
    return await this.db.select(
      "SELECT * FROM purchase_types WHERE companyId=?1 ORDER BY name",
      [companyId],
    );
  }

  async updatePurchaseType(
    id: number,
    data: Partial<
      Omit<PurchaseType, "id" | "companyId" | "createdAt" | "updatedAt">
    >,
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    const keys = Object.keys(data);
    const fields = keys.map((k, i) => `${k} = ?${i + 1}`).join(", ");
    if (!fields) return;
    await this.db.execute(
      `UPDATE purchase_types SET ${fields}, updatedAt=?${
        keys.length + 1
      } WHERE id=?${keys.length + 2}`,
      [...Object.values(data), now, id],
    );
  }

  async deletePurchaseType(id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.execute("DELETE FROM purchase_types WHERE id=?1", [id]);
  }

  // ==================== ST FORMS ====================

  async createSTForm(
    data: Omit<STForm, "id" | "createdAt" | "updatedAt">,
  ): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    await this.db.execute(
      `INSERT INTO st_forms (companyId,name,registrationType,description,createdAt,updatedAt)
       VALUES (?1,?2,?3,?4,?5,?6)`,
      [
        data.companyId,
        data.name,
        data.registrationType,
        data.description || null,
        now,
        now,
      ],
    );
    const r = await this.db.select<{ id: number }[]>(
      "SELECT last_insert_rowid() as id",
    );
    return r[0]?.id || 0;
  }

  async getSTForms(companyId: number): Promise<STForm[]> {
    if (!this.db) throw new Error("Database not initialized");
    return await this.db.select(
      "SELECT * FROM st_forms WHERE companyId=?1 ORDER BY name",
      [companyId],
    );
  }

  async deleteSTForm(id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.execute("DELETE FROM st_forms WHERE id=?1", [id]);
  }

  // ==================== STANDARD NARRATIONS ====================

  async createStandardNarration(
    data: Omit<StandardNarration, "id" | "createdAt" | "updatedAt">,
  ): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    await this.db.execute(
      `INSERT INTO standard_narrations (companyId,name,voucherType,createdAt,updatedAt)
       VALUES (?1,?2,?3,?4,?5)`,
      [data.companyId, data.name, data.voucherType || null, now, now],
    );
    const r = await this.db.select<{ id: number }[]>(
      "SELECT last_insert_rowid() as id",
    );
    return r[0]?.id || 0;
  }

  async getStandardNarrations(companyId: number): Promise<StandardNarration[]> {
    if (!this.db) throw new Error("Database not initialized");
    return await this.db.select(
      "SELECT * FROM standard_narrations WHERE companyId=?1 ORDER BY voucherType,name",
      [companyId],
    );
  }

  async updateStandardNarration(
    id: number,
    data: Partial<
      Omit<StandardNarration, "id" | "companyId" | "createdAt" | "updatedAt">
    >,
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    const keys = Object.keys(data);
    const fields = keys.map((k, i) => `${k} = ?${i + 1}`).join(", ");
    if (!fields) return;
    await this.db.execute(
      `UPDATE standard_narrations SET ${fields}, updatedAt=?${
        keys.length + 1
      } WHERE id=?${keys.length + 2}`,
      [...Object.values(data), now, id],
    );
  }

  async deleteStandardNarration(id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.execute("DELETE FROM standard_narrations WHERE id=?1", [id]);
  }
}

export const mastersService = new MastersService();
