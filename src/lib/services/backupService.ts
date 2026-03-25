import Database from "@tauri-apps/plugin-sql";
import type { BackupConfiguration, BackupRecord, DataFreezeSettings } from "../../types";

class BackupService {
  private db: Database | null = null;

  async initialize(db: Database) {
    this.db = db;
    await this.createTables();
  }

  private async createTables() {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS backup_configurations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyId INTEGER NOT NULL UNIQUE,
        backupType TEXT NOT NULL DEFAULT 'Normal',
        backupPath TEXT,
        backupPathMonday TEXT,
        backupPathTuesday TEXT,
        backupPathWednesday TEXT,
        backupPathThursday TEXT,
        backupPathFriday TEXT,
        backupPathSaturday TEXT,
        backupPathSunday TEXT,
        ftpServerName TEXT,
        ftpUserName TEXT,
        ftpPassword TEXT,
        ftpFolderMonday TEXT,
        ftpFolderTuesday TEXT,
        ftpFolderWednesday TEXT,
        ftpFolderThursday TEXT,
        ftpFolderFriday TEXT,
        ftpFolderSaturday TEXT,
        ftpFolderSunday TEXT,
        promptForBackupOnCompanyClose INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
      );
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS backup_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyId INTEGER NOT NULL,
        backupType TEXT NOT NULL,
        backupPath TEXT NOT NULL,
        backupDateTime TEXT NOT NULL,
        financialYears TEXT,
        backupSize INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Success',
        notes TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
      );
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS data_freeze_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        companyId INTEGER NOT NULL UNIQUE,
        freezeData INTEGER DEFAULT 0,
        freezingDate TEXT,
        freezeReason TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
      );
    `);
  }

  // ==================== BACKUP CONFIGURATION ====================
  async createBackupConfig(data: Omit<BackupConfiguration, "id" | "createdAt" | "updatedAt">): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    await this.db.execute(
      `INSERT INTO backup_configurations (companyId,backupType,backupPath,backupPathMonday,backupPathTuesday,backupPathWednesday,backupPathThursday,backupPathFriday,backupPathSaturday,backupPathSunday,ftpServerName,ftpUserName,ftpPassword,ftpFolderMonday,ftpFolderTuesday,ftpFolderWednesday,ftpFolderThursday,ftpFolderFriday,ftpFolderSaturday,ftpFolderSunday,promptForBackupOnCompanyClose,createdAt,updatedAt)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23)`,
      [data.companyId, data.backupType, data.backupPath||null, data.backupPathMonday||null, data.backupPathTuesday||null,
       data.backupPathWednesday||null, data.backupPathThursday||null, data.backupPathFriday||null,
       data.backupPathSaturday||null, data.backupPathSunday||null, data.ftpServerName||null,
       data.ftpUserName||null, data.ftpPassword||null, data.ftpFolderMonday||null, data.ftpFolderTuesday||null,
       data.ftpFolderWednesday||null, data.ftpFolderThursday||null, data.ftpFolderFriday||null,
       data.ftpFolderSaturday||null, data.ftpFolderSunday||null, data.promptForBackupOnCompanyClose?1:0,
       now, now]
    );
    const r = await this.db.select<{id:number}[]>("SELECT last_insert_rowid() as id");
    return r[0]?.id || 0;
  }

  async getBackupConfig(companyId: number): Promise<BackupConfiguration | null> {
    if (!this.db) throw new Error("Database not initialized");
    const rows = await this.db.select<BackupConfiguration[]>(
      "SELECT * FROM backup_configurations WHERE companyId=?1", [companyId]
    );
    return rows[0] || null;
  }

  async updateBackupConfig(companyId: number, data: Partial<Omit<BackupConfiguration, "id"|"companyId"|"createdAt"|"updatedAt">>): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    const keys = Object.keys(data);
    const fields = keys.map((k, i) => `${k} = ?${i+1}`).join(", ");
    if (!fields) return;
    await this.db.execute(
      `UPDATE backup_configurations SET ${fields}, updatedAt=?${keys.length+1} WHERE companyId=?${keys.length+2}`,
      [...Object.values(data), now, companyId]
    );
  }

  // ==================== BACKUP RECORDS ====================
  async recordBackup(data: Omit<BackupRecord, "id">): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.execute(
      `INSERT INTO backup_records (companyId,backupType,backupPath,backupDateTime,financialYears,backupSize,status,notes,createdAt)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)`,
      [data.companyId, data.backupType, data.backupPath, data.backupDateTime,
       data.financialYears||null, data.backupSize||0, data.status, data.notes||null, data.createdAt]
    );
    const r = await this.db.select<{id:number}[]>("SELECT last_insert_rowid() as id");
    return r[0]?.id || 0;
  }

  async getBackupHistory(companyId: number): Promise<BackupRecord[]> {
    if (!this.db) throw new Error("Database not initialized");
    return await this.db.select(
      "SELECT * FROM backup_records WHERE companyId=?1 ORDER BY backupDateTime DESC", [companyId]
    );
  }

  // ==================== DATA FREEZE ====================
  async createDataFreeze(data: Omit<DataFreezeSettings, "id" | "createdAt" | "updatedAt">): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    await this.db.execute(
      `INSERT INTO data_freeze_settings (companyId,freezeData,freezingDate,freezeReason,createdAt,updatedAt)
       VALUES (?1,?2,?3,?4,?5,?6)`,
      [data.companyId, data.freezeData?1:0, data.freezingDate||null, data.freezeReason||null, now, now]
    );
    const r = await this.db.select<{id:number}[]>("SELECT last_insert_rowid() as id");
    return r[0]?.id || 0;
  }

  async getDataFreeze(companyId: number): Promise<DataFreezeSettings | null> {
    if (!this.db) throw new Error("Database not initialized");
    const rows = await this.db.select<DataFreezeSettings[]>(
      "SELECT * FROM data_freeze_settings WHERE companyId=?1", [companyId]
    );
    return rows[0] || null;
  }

  async updateDataFreeze(companyId: number, data: Partial<Omit<DataFreezeSettings, "id"|"companyId"|"createdAt"|"updatedAt">>): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    const now = new Date().toISOString();
    const keys = Object.keys(data);
    const fields = keys.map((k, i) => `${k} = ?${i+1}`).join(", ");
    if (!fields) return;
    await this.db.execute(
      `UPDATE data_freeze_settings SET ${fields}, updatedAt=?${keys.length+1} WHERE companyId=?${keys.length+2}`,
      [...Object.values(data), now, companyId]
    );
  }

  async isDataFrozen(companyId: number, checkDate: string): Promise<boolean> {
    const settings = await this.getDataFreeze(companyId);
    if (!settings || !settings.freezeData || !settings.freezingDate) return false;
    return checkDate <= settings.freezingDate;
  }
}

export const backupService = new BackupService();
