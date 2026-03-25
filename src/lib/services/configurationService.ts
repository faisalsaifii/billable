import Database from "@tauri-apps/plugin-sql";
import type { Configuration } from "../../types";

const DEFAULTS: Omit<Configuration, "id" | "companyId" | "createdAt" | "updatedAt"> = {
  numberFormat: "Indian",
  dateFormat: "DD/MM/YYYY",
  dateSeparator: "/",
  currencyDecimalPlaces: 2,
  skipCurrencySeparator: false,
  deleteExportedFilesOnClose: "Ask before Deletion",
  displayThoughtOfTheDay: false,
  billByBillDetails: false,
  billReferenceGrouping: false,
  postSaleReturnToPurchaseAccount: false,
  doubleEntryPaymentReceipt: true,
  showAccountBalanceDuringEntry: true,
  bankReconciliation: false,
  qtyDecimalPlaces: 2,
  stockValuationMethod: "FIFO",
  enableMultiGodown: false,
  enableBillSundryNarration: false,
  showItemBalanceDuringEntry: true,
  separateStockUpdationDate: false,
  enableTaxReporting: false,
  defaultPrinterDriver: null,
  pageLength: 11,
  linesPerPageNormal: 60,
  linesPerPageLandscape: 60,
  printingStyle: "Windows",
  paperTopMargin: 0.25,
  paperLeftMargin: 0.25,
  negativeCashAction: "Warning Only",
  negativeStockAction: "Warning Only",
  minSalePriceAction: "Warning Only",
};

class ConfigurationService {
  private db: Database | null = null;

  async initialize(db: Database) {
    this.db = db;
    await this.createTable();
  }

  private async createTable() {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS configuration (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyId INTEGER NOT NULL UNIQUE,
        numberFormat TEXT NOT NULL DEFAULT 'Indian',
        dateFormat TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
        dateSeparator TEXT NOT NULL DEFAULT '/',
        currencyDecimalPlaces INTEGER NOT NULL DEFAULT 2,
        skipCurrencySeparator INTEGER NOT NULL DEFAULT 0,
        deleteExportedFilesOnClose TEXT NOT NULL DEFAULT 'Ask before Deletion',
        displayThoughtOfTheDay INTEGER NOT NULL DEFAULT 0,
        billByBillDetails INTEGER NOT NULL DEFAULT 0,
        billReferenceGrouping INTEGER NOT NULL DEFAULT 0,
        postSaleReturnToPurchaseAccount INTEGER NOT NULL DEFAULT 0,
        doubleEntryPaymentReceipt INTEGER NOT NULL DEFAULT 1,
        showAccountBalanceDuringEntry INTEGER NOT NULL DEFAULT 1,
        bankReconciliation INTEGER NOT NULL DEFAULT 0,
        qtyDecimalPlaces INTEGER NOT NULL DEFAULT 2,
        stockValuationMethod TEXT NOT NULL DEFAULT 'FIFO',
        enableMultiGodown INTEGER NOT NULL DEFAULT 0,
        enableBillSundryNarration INTEGER NOT NULL DEFAULT 0,
        showItemBalanceDuringEntry INTEGER NOT NULL DEFAULT 1,
        separateStockUpdationDate INTEGER NOT NULL DEFAULT 0,
        enableTaxReporting INTEGER NOT NULL DEFAULT 0,
        defaultPrinterDriver TEXT,
        pageLength REAL NOT NULL DEFAULT 11,
        linesPerPageNormal INTEGER NOT NULL DEFAULT 60,
        linesPerPageLandscape INTEGER NOT NULL DEFAULT 60,
        printingStyle TEXT NOT NULL DEFAULT 'Windows',
        paperTopMargin REAL NOT NULL DEFAULT 0.25,
        paperLeftMargin REAL NOT NULL DEFAULT 0.25,
        negativeCashAction TEXT NOT NULL DEFAULT 'Warning Only',
        negativeStockAction TEXT NOT NULL DEFAULT 'Warning Only',
        minSalePriceAction TEXT NOT NULL DEFAULT 'Warning Only',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
      );
    `);
  }

  async createDefaults(companyId: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    await this.db.execute(
      `INSERT OR IGNORE INTO configuration
       (companyId,numberFormat,dateFormat,dateSeparator,currencyDecimalPlaces,
        skipCurrencySeparator,deleteExportedFilesOnClose,displayThoughtOfTheDay,
        billByBillDetails,billReferenceGrouping,postSaleReturnToPurchaseAccount,
        doubleEntryPaymentReceipt,showAccountBalanceDuringEntry,bankReconciliation,
        qtyDecimalPlaces,stockValuationMethod,enableMultiGodown,enableBillSundryNarration,
        showItemBalanceDuringEntry,separateStockUpdationDate,enableTaxReporting,
        defaultPrinterDriver,pageLength,linesPerPageNormal,linesPerPageLandscape,
        printingStyle,paperTopMargin,paperLeftMargin,
        negativeCashAction,negativeStockAction,minSalePriceAction,createdAt,updatedAt)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,?24,?25,?26,?27,?28,?29,?30,?31,?32,?33)`,
      [companyId, DEFAULTS.numberFormat, DEFAULTS.dateFormat, DEFAULTS.dateSeparator,
       DEFAULTS.currencyDecimalPlaces, DEFAULTS.skipCurrencySeparator?1:0,
       DEFAULTS.deleteExportedFilesOnClose, DEFAULTS.displayThoughtOfTheDay?1:0,
       DEFAULTS.billByBillDetails?1:0, DEFAULTS.billReferenceGrouping?1:0,
       DEFAULTS.postSaleReturnToPurchaseAccount?1:0, DEFAULTS.doubleEntryPaymentReceipt?1:0,
       DEFAULTS.showAccountBalanceDuringEntry?1:0, DEFAULTS.bankReconciliation?1:0,
       DEFAULTS.qtyDecimalPlaces, DEFAULTS.stockValuationMethod,
       DEFAULTS.enableMultiGodown?1:0, DEFAULTS.enableBillSundryNarration?1:0,
       DEFAULTS.showItemBalanceDuringEntry?1:0, DEFAULTS.separateStockUpdationDate?1:0,
       DEFAULTS.enableTaxReporting?1:0, DEFAULTS.defaultPrinterDriver,
       DEFAULTS.pageLength, DEFAULTS.linesPerPageNormal, DEFAULTS.linesPerPageLandscape,
       DEFAULTS.printingStyle, DEFAULTS.paperTopMargin, DEFAULTS.paperLeftMargin,
       DEFAULTS.negativeCashAction, DEFAULTS.negativeStockAction, DEFAULTS.minSalePriceAction,
       now, now]
    );
  }

  async getConfiguration(companyId: number): Promise<Configuration | null> {
    if (!this.db) throw new Error("Database not initialized");
    const rows = await this.db.select<Configuration[]>(
      "SELECT * FROM configuration WHERE companyId=?1", [companyId]
    );
    return rows[0] || null;
  }

  async updateConfiguration(companyId: number, data: Partial<Omit<Configuration, "id"|"companyId"|"createdAt"|"updatedAt">>): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    const keys = Object.keys(data);
    if (!keys.length) return;
    const fields = keys.map((k, i) => `${k} = ?${i+1}`).join(", ");
    const vals = Object.values(data).map(v => typeof v === 'boolean' ? (v ? 1 : 0) : v);
    await this.db.execute(
      `UPDATE configuration SET ${fields}, updatedAt=?${keys.length+1} WHERE companyId=?${keys.length+2}`,
      [...vals, now, companyId]
    );
  }
}

export const configurationService = new ConfigurationService();
