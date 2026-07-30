import Database from "@tauri-apps/plugin-sql";
import type {
  Voucher,
  VoucherAccountLine,
  VoucherItemLine,
  VoucherBillSundryLine,
  CreateVoucherDTO,
  VoucherType,
} from "../../types";

class VoucherService {
  private db: Database | null = null;

  private parsePositiveId(value: unknown): number | null {
    if (value === null || value === undefined || value === "") return null;
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : null;
  }

  private async idExistsInCompany(
    table:
      | "companies"
      | "accounts"
      | "items"
      | "bill_sundries"
      | "sale_types"
      | "purchase_types",
    id: number,
    companyId?: number,
  ): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");
    if (table === "companies") {
      const rows = await this.db.select<{ cnt: number }[]>(
        "SELECT COUNT(*) as cnt FROM companies WHERE id=?1",
        [id],
      );
      return (rows[0]?.cnt || 0) > 0;
    }

    const rows = await this.db.select<{ cnt: number }[]>(
      `SELECT COUNT(*) as cnt FROM ${table} WHERE id=?1 AND companyId=?2`,
      [id, companyId || 0],
    );
    return (rows[0]?.cnt || 0) > 0;
  }

  async initialize(db: Database) {
    this.db = db;
    await this.createTables();
  }

  private async createTables() {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS vouchers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyId INTEGER NOT NULL,
        voucherType TEXT NOT NULL,
        series TEXT NOT NULL DEFAULT 'Main',
        vchNo TEXT NOT NULL,
        date TEXT NOT NULL,
        stockDate TEXT,
        partyAccountId INTEGER,
        materialCentreId INTEGER,
        materialCentreToId INTEGER,
        saleTypeId INTEGER,
        purchaseTypeId INTEGER,
        narration TEXT NOT NULL DEFAULT '',
        totalAmount REAL NOT NULL DEFAULT 0,
        taxAmount REAL NOT NULL DEFAULT 0,
        transportCharges REAL NOT NULL DEFAULT 0,
        otherCharges REAL NOT NULL DEFAULT 0,
        roundedOff REAL NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (partyAccountId) REFERENCES accounts(id) ON DELETE SET NULL
      );
    `);

    // Migrate existing vouchers table to add additional charges columns
    try {
      await this.db.execute(
        `ALTER TABLE vouchers ADD COLUMN taxAmount REAL NOT NULL DEFAULT 0`,
      );
    } catch (e) {
      // Column already exists, ignore
    }
    try {
      await this.db.execute(
        `ALTER TABLE vouchers ADD COLUMN transportCharges REAL NOT NULL DEFAULT 0`,
      );
    } catch (e) {
      // Column already exists, ignore
    }
    try {
      await this.db.execute(
        `ALTER TABLE vouchers ADD COLUMN otherCharges REAL NOT NULL DEFAULT 0`,
      );
    } catch (e) {
      // Column already exists, ignore
    }
    try {
      await this.db.execute(
        `ALTER TABLE vouchers ADD COLUMN roundedOff REAL NOT NULL DEFAULT 0`,
      );
    } catch (e) {
      // Column already exists, ignore
    }

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS voucher_account_lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        voucherId INTEGER NOT NULL,
        accountId INTEGER NOT NULL,
        dc TEXT NOT NULL CHECK(dc IN ('D','C')),
        amount REAL NOT NULL DEFAULT 0,
        shortNarration TEXT,
        FOREIGN KEY (voucherId) REFERENCES vouchers(id) ON DELETE CASCADE,
        FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE CASCADE
      );
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS voucher_item_lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        voucherId INTEGER NOT NULL,
        itemId INTEGER NOT NULL,
        qty REAL NOT NULL DEFAULT 0,
        unitId INTEGER,
        rate REAL NOT NULL DEFAULT 0,
        discount REAL NOT NULL DEFAULT 0,
        amount REAL NOT NULL DEFAULT 0,
        materialCentreId INTEGER,
        FOREIGN KEY (voucherId) REFERENCES vouchers(id) ON DELETE CASCADE,
        FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE
      );
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS voucher_bill_sundry_lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        voucherId INTEGER NOT NULL,
        billSundryId INTEGER NOT NULL,
        rate REAL NOT NULL DEFAULT 0,
        amount REAL NOT NULL DEFAULT 0,
        FOREIGN KEY (voucherId) REFERENCES vouchers(id) ON DELETE CASCADE,
        FOREIGN KEY (billSundryId) REFERENCES bill_sundries(id) ON DELETE CASCADE
      );
    `);
  }

  async getNextVoucherNo(
    companyId: number,
    voucherType: VoucherType,
    series: string,
  ): Promise<string> {
    if (!this.db) throw new Error("Database not initialized");
    const rows = await this.db.select<{ cnt: number }[]>(
      "SELECT COUNT(*) as cnt FROM vouchers WHERE companyId=?1 AND voucherType=?2 AND series=?3",
      [companyId, voucherType, series],
    );
    return String((rows[0]?.cnt || 0) + 1);
  }

  async createVoucher(data: CreateVoucherDTO): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();

    const companyId = this.parsePositiveId(data.companyId);
    if (!companyId) throw new Error("Invalid company selected.");
    if (!(await this.idExistsInCompany("companies", companyId))) {
      throw new Error("Selected company does not exist.");
    }

    const partyAccountId = this.parsePositiveId(data.partyAccountId);
    if (
      partyAccountId &&
      !(await this.idExistsInCompany("accounts", partyAccountId, companyId))
    ) {
      throw new Error("Selected party account is invalid for this company.");
    }

    const saleTypeId = this.parsePositiveId(data.saleTypeId);
    if (
      saleTypeId &&
      !(await this.idExistsInCompany("sale_types", saleTypeId, companyId))
    ) {
      throw new Error("Selected sale type is invalid for this company.");
    }

    const purchaseTypeId = this.parsePositiveId(data.purchaseTypeId);
    if (
      purchaseTypeId &&
      !(await this.idExistsInCompany(
        "purchase_types",
        purchaseTypeId,
        companyId,
      ))
    ) {
      throw new Error("Selected purchase type is invalid for this company.");
    }

    for (let i = 0; i < data.accountLines.length; i++) {
      const line = data.accountLines[i];
      const accountId = this.parsePositiveId(line.accountId);
      if (!accountId) {
        throw new Error(`Account line ${i + 1} has an invalid account.`);
      }
      if (!(await this.idExistsInCompany("accounts", accountId, companyId))) {
        throw new Error(
          `Account line ${
            i + 1
          } references an account not found in this company.`,
        );
      }
    }

    for (let i = 0; i < data.itemLines.length; i++) {
      const line = data.itemLines[i];
      const itemId = this.parsePositiveId(line.itemId);
      if (!itemId) {
        throw new Error(`Item line ${i + 1} has an invalid item.`);
      }
      if (!(await this.idExistsInCompany("items", itemId, companyId))) {
        throw new Error(
          `Item line ${i + 1} references an item not found in this company.`,
        );
      }
    }

    for (let i = 0; i < data.billSundryLines.length; i++) {
      const line = data.billSundryLines[i];
      const billSundryId = this.parsePositiveId(line.billSundryId);
      if (!billSundryId) {
        throw new Error(
          `Bill sundry line ${i + 1} has an invalid bill sundry.`,
        );
      }
      if (
        !(await this.idExistsInCompany(
          "bill_sundries",
          billSundryId,
          companyId,
        ))
      ) {
        throw new Error(
          `Bill sundry line ${
            i + 1
          } references a bill sundry not found in this company.`,
        );
      }
    }

    try {
      await this.db.execute("BEGIN TRANSACTION");

      // Insert voucher header
      try {
        await this.db.execute(
          `INSERT INTO vouchers (companyId,voucherType,series,vchNo,date,stockDate,partyAccountId,
           materialCentreId,materialCentreToId,saleTypeId,purchaseTypeId,narration,totalAmount,
           taxAmount,transportCharges,otherCharges,roundedOff,createdAt,updatedAt)
           VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19)`,
          [
            companyId,
            data.voucherType,
            data.series,
            data.vchNo,
            data.date,
            data.stockDate || null,
            partyAccountId || null,
            data.materialCentreId || null,
            data.materialCentreToId || null,
            saleTypeId || null,
            purchaseTypeId || null,
            data.narration,
            data.totalAmount,
            data.taxAmount || 0,
            data.transportCharges || 0,
            data.otherCharges || 0,
            data.roundedOff || 0,
            now,
            now,
          ],
        );
      } catch (headerErr) {
        throw new Error(
          `Failed to insert voucher header: ${headerErr instanceof Error ? headerErr.message : String(headerErr)}`,
        );
      }

      const vRows = await this.db.select<{ id: number }[]>(
        "SELECT last_insert_rowid() as id",
      );
      const voucherId = vRows[0]?.id || 0;

      for (let i = 0; i < data.accountLines.length; i++) {
        const line = data.accountLines[i];
        try {
          await this.db.execute(
            `INSERT INTO voucher_account_lines (voucherId,accountId,dc,amount,shortNarration)
             VALUES (?1,?2,?3,?4,?5)`,
            [
              voucherId,
              this.parsePositiveId(line.accountId),
              line.dc,
              line.amount,
              line.shortNarration || null,
            ],
          );
        } catch (lineErr) {
          throw new Error(
            `Failed to insert account line ${i + 1} (Account ID: ${line.accountId}): ${lineErr instanceof Error ? lineErr.message : String(lineErr)}`,
          );
        }
      }

      for (let i = 0; i < data.itemLines.length; i++) {
        const line = data.itemLines[i];
        const itemId = this.parsePositiveId(line.itemId);
        const unitId = this.parsePositiveId(line.unitId);
        try {
          await this.db.execute(
            `INSERT INTO voucher_item_lines (voucherId,itemId,qty,unitId,rate,discount,amount,materialCentreId)
             VALUES (?1,?2,?3,?4,?5,?6,?7,?8)`,
            [
              voucherId,
              itemId,
              line.qty,
              unitId,
              line.rate,
              line.discount || 0,
              line.amount,
              line.materialCentreId || null,
            ],
          );
        } catch (lineErr) {
          throw new Error(
            `Failed to insert item line ${i + 1} (Item ID: ${line.itemId}, Unit ID: ${line.unitId}): ${lineErr instanceof Error ? lineErr.message : String(lineErr)}`,
          );
        }
      }

      for (let i = 0; i < data.billSundryLines.length; i++) {
        const line = data.billSundryLines[i];
        try {
          await this.db.execute(
            `INSERT INTO voucher_bill_sundry_lines (voucherId,billSundryId,rate,amount)
             VALUES (?1,?2,?3,?4)`,
            [
              voucherId,
              this.parsePositiveId(line.billSundryId),
              line.rate,
              line.amount,
            ],
          );
        } catch (lineErr) {
          throw new Error(
            `Failed to insert bill sundry line ${i + 1} (Bill Sundry ID: ${line.billSundryId}): ${lineErr instanceof Error ? lineErr.message : String(lineErr)}`,
          );
        }
      }

      await this.db.execute("COMMIT");

      return voucherId;
    } catch (err) {
      try {
        await this.db.execute("ROLLBACK");
      } catch (_) {
        // no-op: transaction may not have started
      }
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("FOREIGN KEY constraint failed")) {
        // Re-verify which foreign keys are actually invalid at the time of failure
        const errorDetails: string[] = [];

        // Check company
        if (
          companyId &&
          !(await this.idExistsInCompany("companies", companyId))
        ) {
          errorDetails.push(`Company ID ${companyId} no longer exists`);
        }

        // Check party account
        if (partyAccountId) {
          if (
            !(await this.idExistsInCompany(
              "accounts",
              partyAccountId,
              companyId,
            ))
          ) {
            errorDetails.push(
              `Party Account ID ${partyAccountId} does not exist or doesn't belong to this company`,
            );
          }
        }

        // Check accounts in account lines
        for (let i = 0; i < data.accountLines.length; i++) {
          const line = data.accountLines[i];
          const accountId = this.parsePositiveId(line.accountId);
          if (
            accountId &&
            !(await this.idExistsInCompany("accounts", accountId, companyId))
          ) {
            errorDetails.push(
              `Account line ${i + 1}: Account ID ${accountId} is invalid`,
            );
          }
        }

        // Check items in item lines
        for (let i = 0; i < data.itemLines.length; i++) {
          const line = data.itemLines[i];
          const itemId = this.parsePositiveId(line.itemId);
          if (
            itemId &&
            !(await this.idExistsInCompany("items", itemId, companyId))
          ) {
            errorDetails.push(
              `Item line ${i + 1}: Item ID ${itemId} is invalid`,
            );
          }
        }

        // Check bill sundries in bill sundry lines
        for (let i = 0; i < data.billSundryLines.length; i++) {
          const line = data.billSundryLines[i];
          const billSundryId = this.parsePositiveId(line.billSundryId);
          if (
            billSundryId &&
            !(await this.idExistsInCompany(
              "bill_sundries",
              billSundryId,
              companyId,
            ))
          ) {
            errorDetails.push(
              `Bill sundry line ${i + 1}: Bill Sundry ID ${billSundryId} is invalid`,
            );
          }
        }

        const specificMsg =
          errorDetails.length > 0
            ? `Foreign key constraint failed:\n${errorDetails.join("\n")}\n\nPlease close and re-open the voucher form, then re-select all fields.`
            : "Foreign key constraint failed. The referenced master data may have been deleted. Please close and re-open the voucher form.";

        throw new Error(specificMsg);
      }
      throw err;
    }
  }

  async getVouchers(
    companyId: number,
    voucherType?: VoucherType,
    fromDate?: string,
    toDate?: string,
  ): Promise<Voucher[]> {
    if (!this.db) throw new Error("Database not initialized");
    let query = "SELECT * FROM vouchers WHERE companyId=?1";
    const params: (string | number)[] = [companyId];
    let idx = 2;
    if (voucherType) {
      query += ` AND voucherType=?${idx++}`;
      params.push(voucherType);
    }
    if (fromDate) {
      query += ` AND date>=?${idx++}`;
      params.push(fromDate);
    }
    if (toDate) {
      query += ` AND date<=?${idx++}`;
      params.push(toDate);
    }
    query += " ORDER BY date DESC, id DESC";
    return await this.db.select(query, params);
  }

  async getVoucherById(id: number): Promise<{
    voucher: Voucher;
    accountLines: VoucherAccountLine[];
    itemLines: VoucherItemLine[];
    billSundryLines: VoucherBillSundryLine[];
  } | null> {
    if (!this.db) throw new Error("Database not initialized");
    const vouchers = await this.db.select<Voucher[]>(
      "SELECT * FROM vouchers WHERE id=?1",
      [id],
    );
    if (!vouchers[0]) return null;
    const accountLines = await this.db.select<VoucherAccountLine[]>(
      "SELECT * FROM voucher_account_lines WHERE voucherId=?1",
      [id],
    );
    const itemLines = await this.db.select<VoucherItemLine[]>(
      "SELECT * FROM voucher_item_lines WHERE voucherId=?1",
      [id],
    );
    const billSundryLines = await this.db.select<VoucherBillSundryLine[]>(
      "SELECT * FROM voucher_bill_sundry_lines WHERE voucherId=?1",
      [id],
    );
    return { voucher: vouchers[0], accountLines, itemLines, billSundryLines };
  }

  async deleteVoucher(id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.execute("DELETE FROM vouchers WHERE id=?1", [id]);
  }

  // ==================== REPORT QUERIES ====================

  async getTrialBalance(companyId: number): Promise<
    {
      accountId: number;
      name: string;
      groupName: string;
      debit: number;
      credit: number;
    }[]
  > {
    if (!this.db) throw new Error("Database not initialized");
    return await this.db.select(
      `
      SELECT a.id as accountId, a.name, ag.name as groupName,
        COALESCE(SUM(CASE WHEN val.dc='D' THEN val.amount ELSE 0 END), 0) +
          CASE WHEN a.openingBalanceType='Debit' THEN a.openingBalance ELSE 0 END as debit,
        COALESCE(SUM(CASE WHEN val.dc='C' THEN val.amount ELSE 0 END), 0) +
          CASE WHEN a.openingBalanceType='Credit' THEN a.openingBalance ELSE 0 END as credit
      FROM accounts a
      JOIN account_groups ag ON a.groupId = ag.id
      LEFT JOIN voucher_account_lines val ON a.id = val.accountId
      LEFT JOIN vouchers v ON val.voucherId = v.id AND v.companyId = ?1
      WHERE a.companyId = ?1 AND a.active = 1
      GROUP BY a.id, a.name, ag.name
      HAVING debit > 0 OR credit > 0
      ORDER BY ag.name, a.name
    `,
      [companyId],
    );
  }

  async getAccountLedger(
    companyId: number,
    accountId: number,
    fromDate?: string,
    toDate?: string,
  ): Promise<
    {
      date: string;
      voucherType: string;
      vchNo: string;
      narration: string;
      debit: number;
      credit: number;
      balance: number;
    }[]
  > {
    if (!this.db) throw new Error("Database not initialized");
    let query = `
      SELECT v.date, v.voucherType, v.vchNo, v.narration,
        CASE WHEN val.dc='D' THEN val.amount ELSE 0 END as debit,
        CASE WHEN val.dc='C' THEN val.amount ELSE 0 END as credit
      FROM voucher_account_lines val
      JOIN vouchers v ON val.voucherId = v.id
      WHERE v.companyId=?1 AND val.accountId=?2
    `;
    const params: (string | number)[] = [companyId, accountId];
    let idx = 3;
    if (fromDate) {
      query += ` AND v.date>=?${idx++}`;
      params.push(fromDate);
    }
    if (toDate) {
      query += ` AND v.date<=?${idx++}`;
      params.push(toDate);
    }
    query += " ORDER BY v.date ASC, v.id ASC";
    const rows = await this.db.select<
      {
        date: string;
        voucherType: string;
        vchNo: string;
        narration: string;
        debit: number;
        credit: number;
      }[]
    >(query, params);
    let balance = 0;
    return rows.map((r) => {
      balance += r.debit - r.credit;
      return { ...r, balance };
    });
  }

  async getStockStatus(companyId: number): Promise<
    {
      itemId: number;
      name: string;
      groupName: string;
      inQty: number;
      outQty: number;
      closingQty: number;
    }[]
  > {
    if (!this.db) throw new Error("Database not initialized");
    return await this.db.select(
      `
      SELECT i.id as itemId, i.name,
        COALESCE(ig.name,'Unknown') as groupName,
        i.openingStock +
          COALESCE(SUM(CASE WHEN v.voucherType IN ('Purchase','Purchase Return','Stock Transfer') THEN
            CASE WHEN v.voucherType='Purchase Return' THEN -vil.qty ELSE vil.qty END ELSE 0 END), 0) as inQty,
        COALESCE(SUM(CASE WHEN v.voucherType IN ('Sales','Sales Return') THEN
            CASE WHEN v.voucherType='Sales Return' THEN -vil.qty ELSE vil.qty END ELSE 0 END), 0) as outQty,
        i.openingStock +
          COALESCE(SUM(CASE WHEN v.voucherType IN ('Purchase') THEN vil.qty
            WHEN v.voucherType IN ('Sales') THEN -vil.qty ELSE 0 END), 0) as closingQty
      FROM items i
      LEFT JOIN item_groups ig ON i.groupId = ig.id
      LEFT JOIN voucher_item_lines vil ON i.id = vil.itemId
      LEFT JOIN vouchers v ON vil.voucherId = v.id AND v.companyId = ?1
      WHERE i.companyId = ?1 AND i.active = 1
      GROUP BY i.id, i.name, ig.name
      ORDER BY ig.name, i.name
    `,
      [companyId],
    );
  }
}

export const voucherService = new VoucherService();
