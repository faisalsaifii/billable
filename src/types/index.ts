// Company entity
export interface Company {
  id: number;
  name: string;
  printName: string;
  fyBeginningFrom: string;
  booksCommencingFrom: string;
  address1: string;
  address2: string;
  address3: string;
  address4: string;
  itPAN: string;
  telNo: string;
  ward: string;
  fax: string;
  email: string;
  country: string;
  state: string;
  currencySymbol: string;
  currencyString: string;
  currencySubString: string;
  enableTax: boolean;
  taxType: "LST" | "VAT" | "GST" | null;
  enableAddTax: boolean;
  addTaxCaption: string;
  tin: string;
  lstNo: string;
  gstNo: string;
  cstNo: string;
  defaultTaxRate1: number;
  defaultTaxRate2: number;
  bankName: string;
  bankBranch: string;
  bankAccountNo: string;
  bankIFSC: string;
  createdAt: string;
  updatedAt: string;
}

export interface SuperUser {
  id: number;
  companyId: number;
  username: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginDTO {
  username: string;
  password: string;
}
export type CreateCompanyDTO = Omit<Company, "id" | "createdAt" | "updatedAt">;

// ==================== MASTERS ====================

export interface AccountGroup {
  id: number;
  companyId: number;
  name: string;
  alias: string | null;
  printName: string | null;
  parentGroupId: number | null;
  accountType: string;
  affectsGrossProfit: boolean;
  sequenceNo: number;
  isPredefined: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: number;
  companyId: number;
  groupId: number;
  name: string;
  alias: string | null;
  printName: string | null;
  openingBalance: number;
  openingBalanceType: "Debit" | "Credit";
  prevYearBalance: number;
  prevYearBalanceType: "Debit" | "Credit";
  address: string | null;
  country: string | null;
  typeOfDealer: string | null;
  gst: string | null;
  cnic: string | null;
  itPan: string | null;
  email: string | null;
  mobileNo: string | null;
  telNo: string | null;
  contactPerson: string | null;
  station: string | null;
  tin: string | null;
  ward: string | null;
  whatsappNo: string | null;
  fax: string | null;
  transport: string | null;
  maintainBillByBill: boolean;
  creditDaysForSale: number;
  creditDaysForPurchase: number;
  bankAccountNo: string | null;
  ifscCode: string | null;
  description: string | null;
  isPredefined: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemGroup {
  id: number;
  companyId: number;
  name: string;
  alias: string | null;
  printName: string | null;
  parentGroupId: number | null;
  description: string | null;
  sequenceNo: number;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: number;
  companyId: number;
  groupId: number;
  name: string;
  alias: string | null;
  printName: string | null;
  description: string | null;
  mainUnitId: number | null;
  subUnitId: number | null;
  conversionFactor: number;
  openingStock: number;
  openingStockRate: number;
  mrp: number;
  salePrice: number;
  purchasePrice: number;
  hsn: string;
  gstRate: number;
  minSalePrice: number;
  reorderLevel: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  id: number;
  companyId: number;
  name: string;
  formalName: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UnitConversion {
  id: number;
  companyId: number;
  fromUnitId: number;
  toUnitId: number;
  conversionFactor: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialCentre {
  id: number;
  companyId: number;
  name: string;
  alias: string | null;
  printName: string | null;
  description: string | null;
  address: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BillSundry {
  id: number;
  companyId: number;
  name: string;
  alias: string | null;
  printName: string | null;
  type: "Additive" | "Subtractive";
  applicableOn:
    | "Item Basic Amount"
    | "Item MRP"
    | "Per Unit"
    | "Fixed Amount"
    | "Previous Bill Sundry Amount";
  rate: number;
  isPercentage: boolean;
  accountId: number | null;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaleType {
  id: number;
  companyId: number;
  name: string;
  alias: string | null;
  region: "Local" | "Central";
  taxationType:
    | "Taxable"
    | "Exempt"
    | "Tax Free"
    | "Against ST Form"
    | "Multi Tax"
    | "Tax Paid";
  taxInvoice: boolean;
  taxRate: number;
  surchargeRate: number;
  invoiceHeading: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseType {
  id: number;
  companyId: number;
  name: string;
  alias: string | null;
  region: "Local" | "Central";
  taxationType:
    | "Taxable"
    | "Exempt"
    | "Tax Free"
    | "Against ST Form"
    | "Multi Tax"
    | "Tax Paid";
  taxRate: number;
  surchargeRate: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface STForm {
  id: number;
  companyId: number;
  name: string;
  registrationType: "Local" | "Central";
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StandardNarration {
  id: number;
  companyId: number;
  name: string;
  voucherType: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==================== CONFIGURATION ====================

export interface Configuration {
  id: number;
  companyId: number;
  numberFormat: "Indian" | "International";
  dateFormat: string;
  dateSeparator: string;
  currencyDecimalPlaces: number;
  skipCurrencySeparator: boolean;
  deleteExportedFilesOnClose:
    | "Never"
    | "Ask before Deletion"
    | "Delete Automatically";
  displayThoughtOfTheDay: boolean;
  billByBillDetails: boolean;
  billReferenceGrouping: boolean;
  postSaleReturnToPurchaseAccount: boolean;
  doubleEntryPaymentReceipt: boolean;
  showAccountBalanceDuringEntry: boolean;
  bankReconciliation: boolean;
  qtyDecimalPlaces: number;
  stockValuationMethod:
    | "FIFO"
    | "LIFO"
    | "Weighted Average"
    | "Last Purchase"
    | "Average Price"
    | "Self Evaluation";
  enableMultiGodown: boolean;
  enableBillSundryNarration: boolean;
  showItemBalanceDuringEntry: boolean;
  separateStockUpdationDate: boolean;
  enableTaxReporting: boolean;
  defaultPrinterDriver: string | null;
  pageLength: number;
  linesPerPageNormal: number;
  linesPerPageLandscape: number;
  printingStyle: "Windows" | "DOS";
  paperTopMargin: number;
  paperLeftMargin: number;
  negativeCashAction: "No Action" | "Warning Only" | "Dont Allow";
  negativeStockAction: "No Action" | "Warning Only" | "Dont Allow";
  minSalePriceAction: "No Action" | "Warning Only" | "Dont Allow";
  createdAt: string;
  updatedAt: string;
}

// ==================== VOUCHERS / TRANSACTIONS ====================

export type VoucherType =
  | "Sales"
  | "Sales Return"
  | "Purchase"
  | "Purchase Return"
  | "Payment"
  | "Receipt"
  | "Journal"
  | "Contra"
  | "Debit Note"
  | "Credit Note"
  | "Stock Transfer"
  | "Forms Received"
  | "Forms Issued"
  | "VAT Journal";

export interface Voucher {
  id: number;
  companyId: number;
  voucherType: VoucherType;
  series: string;
  vchNo: string;
  date: string;
  stockDate: string | null;
  partyAccountId: number | null;
  materialCentreId: number | null;
  materialCentreToId: number | null;
  saleTypeId: number | null;
  purchaseTypeId: number | null;
  narration: string;
  totalAmount: number;
  taxAmount: number;
  transportCharges: number;
  otherCharges: number;
  roundedOff: number;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherAccountLine {
  id: number;
  voucherId: number;
  accountId: number;
  dc: "D" | "C";
  amount: number;
  shortNarration: string | null;
}

export interface VoucherItemLine {
  id: number;
  voucherId: number;
  itemId: number;
  qty: number;
  unitId: number | null;
  rate: number;
  discount: number;
  amount: number;
  materialCentreId: number | null;
}

export interface VoucherBillSundryLine {
  id: number;
  voucherId: number;
  billSundryId: number;
  rate: number;
  amount: number;
}

export interface CreateVoucherDTO {
  companyId: number;
  voucherType: VoucherType;
  series: string;
  vchNo: string;
  date: string;
  stockDate?: string;
  partyAccountId?: number;
  materialCentreId?: number;
  materialCentreToId?: number;
  saleTypeId?: number;
  purchaseTypeId?: number;
  narration: string;
  totalAmount: number;
  taxAmount?: number;
  transportCharges?: number;
  otherCharges?: number;
  roundedOff?: number;
  accountLines: Omit<VoucherAccountLine, "id" | "voucherId">[];
  itemLines: Omit<VoucherItemLine, "id" | "voucherId">[];
  billSundryLines: Omit<VoucherBillSundryLine, "id" | "voucherId">[];
}

// ==================== MODULE 5: PRINTING ====================

export interface DocumentConfiguration {
  id: number;
  companyId: number;
  voucherType: VoucherType;
  printCompanyName: boolean;
  printCompanyAddress: boolean;
  printCompanyPhone: boolean;
  printCompanyTIN: boolean;
  prePrintedHeader: boolean;
  headerText: string | null;
  invoiceWidth: "80" | "94/96" | "132/136";
  printItemCode: boolean;
  printItemDescription: boolean;
  printItemRate: boolean;
  printVATWithItems: boolean;
  printVATSeparatelyWithItems: boolean;
  printNarration: boolean;
  printQtyTotals: boolean;
  printDailyMessage: boolean;
  useFullPageForDocument: boolean;
  ejectPageAfterPrinting: boolean;
  printZeroAmountBillSundries: boolean;
  printLogo: boolean;
  logoPath: string | null;
  logoPosition: "Top Left" | "Top Right" | "Center" | null;
  logoHeight: number;
  logoWidth: number;
  declaration: string | null;
  termsAndConditions: string | null;
  signatoryLine1: string | null;
  signatoryLine2: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PrintingMode {
  id: number;
  seriesId: number;
  printAfterSave: boolean;
  showPrintOptions: boolean;
  defaultCopies: number;
  canChangeCopies: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== MODULE 7: DATA MANAGEMENT ====================

export interface BackupConfiguration {
  id: number;
  companyId: number;
  backupType: "Normal" | "FTP";
  backupPath: string | null;
  backupPathMonday: string | null;
  backupPathTuesday: string | null;
  backupPathWednesday: string | null;
  backupPathThursday: string | null;
  backupPathFriday: string | null;
  backupPathSaturday: string | null;
  backupPathSunday: string | null;
  ftpServerName: string | null;
  ftpUserName: string | null;
  ftpPassword: string | null;
  ftpFolderMonday: string | null;
  ftpFolderTuesday: string | null;
  ftpFolderWednesday: string | null;
  ftpFolderThursday: string | null;
  ftpFolderFriday: string | null;
  ftpFolderSaturday: string | null;
  ftpFolderSunday: string | null;
  promptForBackupOnCompanyClose: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DataFreezeSettings {
  id: number;
  companyId: number;
  freezeData: boolean;
  freezingDate: string | null;
  freezeReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackupRecord {
  id: number;
  companyId: number;
  backupType: "Normal" | "FTP";
  backupPath: string;
  backupDateTime: string;
  financialYears: string;
  backupSize: number;
  status: "Success" | "Failed";
  notes: string | null;
  createdAt: string;
}

// Report result types
export interface BalanceSheetRow {
  groupName: string;
  accountName: string;
  accountId: number;
  debitBalance: number;
  creditBalance: number;
  level: number;
}

export interface ProfitLossRow {
  accountName: string;
  accountId: number;
  amount: number;
  category:
    | "Direct Expense"
    | "Direct Income"
    | "Indirect Expense"
    | "Indirect Income";
  level: number;
}

export interface StockLedgerRow {
  date: string;
  voucherType: string;
  vchNo: string;
  inQty: number;
  outQty: number;
  rate: number;
  closingQty: number;
  narration: string | null;
}

export interface VATSummaryRow {
  period: string;
  inputVAT: number;
  outputVAT: number;
  netVAT: number;
}
