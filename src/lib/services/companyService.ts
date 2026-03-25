import Database from "@tauri-apps/plugin-sql";
import type { Company, SuperUser, CreateCompanyDTO } from "../../types";
import { mastersService } from "./mastersService";
import { configurationService } from "./configurationService";
import { voucherService } from "./voucherService";
import { backupService } from "./backupService";
import { documentConfigService } from "./documentConfigService";

class CompanyService {
  private db: Database | null = null;

  async initialize() {
    try {
      this.db = await Database.load("sqlite:billable.db");
      await this.createTables();
      await mastersService.initialize(this.db);
      await configurationService.initialize(this.db);
      await voucherService.initialize(this.db);
      await backupService.initialize(this.db);
      await documentConfigService.initialize(this.db);
    } catch (err) {
      console.error("Database initialization error:", err);
      throw err;
    }
  }

  private async createTables() {
    if (!this.db) throw new Error("Database not initialized");

    // Companies table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        printName TEXT NOT NULL,
        fyBeginningFrom TEXT NOT NULL,
        booksCommencingFrom TEXT NOT NULL,
        address1 TEXT,
        address2 TEXT,
        address3 TEXT,
        address4 TEXT,
        itPAN TEXT,
        telNo TEXT,
        ward TEXT,
        fax TEXT,
        email TEXT,
        country TEXT,
        state TEXT,
        currencySymbol TEXT NOT NULL DEFAULT 'Rs.',
        currencyString TEXT NOT NULL DEFAULT 'Rupees',
        currencySubString TEXT NOT NULL DEFAULT 'Paisa',
        enableTax INTEGER DEFAULT 0,
        taxType TEXT,
        enableAddTax INTEGER DEFAULT 0,
        addTaxCaption TEXT,
        tin TEXT,
        lstNo TEXT,
        gstNo TEXT,
        cstNo TEXT,
        defaultTaxRate1 REAL,
        defaultTaxRate2 REAL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    // SuperUsers table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS superusers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyId INTEGER NOT NULL UNIQUE,
        username TEXT NOT NULL,
        passwordHash TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
      );
    `);

    // Sessions table (for tracking open companies)
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyId INTEGER NOT NULL,
        username TEXT NOT NULL,
        loginTime TEXT NOT NULL,
        FOREIGN KEY (companyId) REFERENCES companies(id)
      );
    `);
  }

  async createCompany(data: CreateCompanyDTO): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");

    const now = new Date().toISOString();
    const result = await this.db.execute(
      `INSERT INTO companies (
        name, printName, fyBeginningFrom, booksCommencingFrom,
        address1, address2, address3, address4, itPAN, telNo, ward, fax, email,
        country, state, currencySymbol, currencyString, currencySubString,
        enableTax, taxType, enableAddTax, addTaxCaption, tin, lstNo, gstNo, cstNo,
        defaultTaxRate1, defaultTaxRate2, createdAt, updatedAt
      ) VALUES (
        ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16,
        ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26, ?27, ?28, ?29, ?30
      )`,
      [
        data.name,
        data.printName,
        data.fyBeginningFrom,
        data.booksCommencingFrom,
        data.address1,
        data.address2,
        data.address3,
        data.address4,
        data.itPAN,
        data.telNo,
        data.ward,
        data.fax,
        data.email,
        data.country,
        data.state,
        data.currencySymbol,
        data.currencyString,
        data.currencySubString,
        data.enableTax ? 1 : 0,
        data.taxType,
        data.enableAddTax ? 1 : 0,
        data.addTaxCaption,
        data.tin,
        data.lstNo,
        data.gstNo,
        data.cstNo,
        data.defaultTaxRate1,
        data.defaultTaxRate2,
        now,
        now,
      ]
    );

    const companies = await this.db.select<{ id: number }[]>(
      "SELECT last_insert_rowid() as id"
    );
    const companyId = companies[0]?.id || 0;
    // Seed 29 default account groups + 56 accounts + default item group
    await mastersService.seedDefaultData(companyId);
    // Create default configuration
    await configurationService.createDefaults(companyId);
    return companyId;
  }

  async getCompanies(): Promise<Company[]> {
    if (!this.db) throw new Error("Database not initialized");
    return await this.db.select("SELECT * FROM companies ORDER BY name");
  }

  async getCompanyById(id: number): Promise<Company | null> {
    if (!this.db) throw new Error("Database not initialized");
    const companies = await this.db.select<Company[]>(
      "SELECT * FROM companies WHERE id = ?1",
      [id]
    );
    return companies[0] || null;
  }

  async getCompanyByName(name: string): Promise<Company | null> {
    if (!this.db) throw new Error("Database not initialized");
    const companies = await this.db.select<Company[]>(
      "SELECT * FROM companies WHERE name = ?1",
      [name]
    );
    return companies[0] || null;
  }

  async updateCompany(
    id: number,
    data: Partial<CreateCompanyDTO>
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    // fyBeginningFrom cannot be changed
    const { fyBeginningFrom, booksCommencingFrom, ...updateData } = data as any;

    const now = new Date().toISOString();
    const fields = Object.keys(updateData)
      .map((key, index) => `${key} = ?${index + 1}`)
      .join(", ");

    if (!fields) return; // No fields to update

    await this.db.execute(
      `UPDATE companies SET ${fields}, updatedAt = ?${
        Object.keys(updateData).length + 1
      } WHERE id = ?${Object.keys(updateData).length + 2}`,
      [...Object.values(updateData), now, id]
    );
  }

  async deleteCompany(id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.execute("DELETE FROM companies WHERE id = ?1", [id]);
  }

  async createSuperUser(
    companyId: number,
    username: string,
    passwordHash: string
  ): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");

    const now = new Date().toISOString();
    await this.db.execute(
      `INSERT INTO superusers (companyId, username, passwordHash, createdAt, updatedAt)
       VALUES (?1, ?2, ?3, ?4, ?5)`,
      [companyId, username, passwordHash, now, now]
    );

    const result = await this.db.select<{ id: number }[]>(
      "SELECT last_insert_rowid() as id"
    );
    return result[0]?.id || 0;
  }

  async getSuperUser(companyId: number): Promise<SuperUser | null> {
    if (!this.db) throw new Error("Database not initialized");
    const users = await this.db.select<SuperUser[]>(
      "SELECT * FROM superusers WHERE companyId = ?1",
      [companyId]
    );
    return users[0] || null;
  }

  async validateLogin(
    companyId: number,
    username: string,
    password: string
  ): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");

    const superUser = await this.getSuperUser(companyId);
    if (!superUser) return false;

    // For now, simple comparison. In production, use proper hashing
    return (
      superUser.username === username && superUser.passwordHash === password
    );
  }
}

export const companyService = new CompanyService();
