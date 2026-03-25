import Database from "@tauri-apps/plugin-sql";
import type { DocumentConfiguration, VoucherType } from "../../types";

class DocumentConfigService {
  private db: Database | null = null;

  async initialize(db: Database) {
    this.db = db;
    await this.createTables();
  }

  private async createTables() {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS document_configurations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyId INTEGER NOT NULL,
        voucherType TEXT NOT NULL,
        printCompanyName INTEGER DEFAULT 1,
        printCompanyAddress INTEGER DEFAULT 1,
        printCompanyPhone INTEGER DEFAULT 0,
        printCompanyTIN INTEGER DEFAULT 0,
        prePrintedHeader INTEGER DEFAULT 0,
        headerText TEXT,
        invoiceWidth TEXT DEFAULT '80',
        printItemCode INTEGER DEFAULT 1,
        printItemDescription INTEGER DEFAULT 1,
        printItemRate INTEGER DEFAULT 1,
        printVATWithItems INTEGER DEFAULT 0,
        printVATSeparatelyWithItems INTEGER DEFAULT 0,
        printNarration INTEGER DEFAULT 1,
        printQtyTotals INTEGER DEFAULT 1,
        printDailyMessage INTEGER DEFAULT 0,
        useFullPageForDocument INTEGER DEFAULT 0,
        ejectPageAfterPrinting INTEGER DEFAULT 0,
        printZeroAmountBillSundries INTEGER DEFAULT 0,
        printLogo INTEGER DEFAULT 0,
        logoPath TEXT,
        logoPosition TEXT,
        logoHeight INTEGER DEFAULT 0,
        logoWidth INTEGER DEFAULT 0,
        declaration TEXT,
        termsAndConditions TEXT,
        signatoryLine1 TEXT,
        signatoryLine2 TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        UNIQUE(companyId, voucherType),
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
      );
    `);
  }

  async createDocConfig(data: Omit<DocumentConfiguration, "id" | "createdAt" | "updatedAt">): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    await this.db.execute(
      `INSERT INTO document_configurations (companyId,voucherType,printCompanyName,printCompanyAddress,printCompanyPhone,printCompanyTIN,prePrintedHeader,headerText,invoiceWidth,printItemCode,printItemDescription,printItemRate,printVATWithItems,printVATSeparatelyWithItems,printNarration,printQtyTotals,printDailyMessage,useFullPageForDocument,ejectPageAfterPrinting,printZeroAmountBillSundries,printLogo,logoPath,logoPosition,logoHeight,logoWidth,declaration,termsAndConditions,signatoryLine1,signatoryLine2,createdAt,updatedAt)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,?24,?25,?26,?27,?28,?29,?30,?31)`,
      [data.companyId, data.voucherType, data.printCompanyName?1:0, data.printCompanyAddress?1:0,
       data.printCompanyPhone?1:0, data.printCompanyTIN?1:0, data.prePrintedHeader?1:0,
       data.headerText||null, data.invoiceWidth, data.printItemCode?1:0, data.printItemDescription?1:0,
       data.printItemRate?1:0, data.printVATWithItems?1:0, data.printVATSeparatelyWithItems?1:0,
       data.printNarration?1:0, data.printQtyTotals?1:0, data.printDailyMessage?1:0,
       data.useFullPageForDocument?1:0, data.ejectPageAfterPrinting?1:0, data.printZeroAmountBillSundries?1:0,
       data.printLogo?1:0, data.logoPath||null, data.logoPosition||null,
       data.logoHeight||0, data.logoWidth||0, data.declaration||null,
       data.termsAndConditions||null, data.signatoryLine1||null, data.signatoryLine2||null,
       now, now]
    );
    const r = await this.db.select<{id:number}[]>("SELECT last_insert_rowid() as id");
    return r[0]?.id || 0;
  }

  async getDocConfig(companyId: number, voucherType: VoucherType): Promise<DocumentConfiguration | null> {
    if (!this.db) throw new Error("Database not initialized");
    const rows = await this.db.select<DocumentConfiguration[]>(
      "SELECT * FROM document_configurations WHERE companyId=?1 AND voucherType=?2",
      [companyId, voucherType]
    );
    return rows[0] || null;
  }

  async getAllDocConfigs(companyId: number): Promise<DocumentConfiguration[]> {
    if (!this.db) throw new Error("Database not initialized");
    return await this.db.select(
      "SELECT * FROM document_configurations WHERE companyId=?1 ORDER BY voucherType",
      [companyId]
    );
  }

  async updateDocConfig(id: number, data: Partial<Omit<DocumentConfiguration, "id"|"companyId"|"voucherType"|"createdAt"|"updatedAt">>): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    const keys = Object.keys(data);
    const fields = keys.map((k, i) => `${k} = ?${i+1}`).join(", ");
    if (!fields) return;
    await this.db.execute(
      `UPDATE document_configurations SET ${fields}, updatedAt=?${keys.length+1} WHERE id=?${keys.length+2}`,
      [...Object.values(data), now, id]
    );
  }
}

export const documentConfigService = new DocumentConfigService();
