<script lang="ts">
  import { onMount } from "svelte";
  import { session } from "../../lib/stores/session";
  import { companyService } from "../../lib/services/companyService";
  import { voucherService } from "../../lib/services/voucherService";
  import { documentConfigService } from "../../lib/services/documentConfigService";
  import { mastersService } from "../../lib/services/mastersService";
  import html2canvas from "html2canvas";
  import jsPDF from "jspdf";
  import type {
    Voucher,
    Company,
    DocumentConfiguration,
    VoucherItemLine,
    VoucherAccountLine,
    Item,
    Account,
    Unit,
  } from "../../types";

  interface Props {
    voucher: Voucher;
    showExportButton?: boolean;
  }

  interface EnrichedItemLine extends VoucherItemLine {
    itemName?: string;
    hsnCode?: string;
    gstRate?: number;
    unitName?: string;
    discountPercent?: number;
    gstAmount?: number;
    taxableAmount?: number;
  }

  let { voucher, showExportButton = false }: Props = $props();

  let company = $state<Company | null>(null);
  let config = $state<DocumentConfiguration | null>(null);
  let itemLines = $state<EnrichedItemLine[]>([]);
  let accountLines = $state<VoucherAccountLine[]>([]);
  let partyAccount = $state<Account | null>(null);
  let loading = $state(true);
  let exporting = $state(false);
  let invoiceRef: HTMLDivElement | null = $state(null);

  const A4_PAGE_WIDTH_MM = 210;
  const A4_PAGE_HEIGHT_MM = 297;
  const PRINT_MARGIN_MM = 5;
  const PRINT_PADDING_MM = 4;
  const A4_PRINTABLE_WIDTH_MM = A4_PAGE_WIDTH_MM - PRINT_MARGIN_MM * 2;
  const A4_PRINTABLE_HEIGHT_MM = A4_PAGE_HEIGHT_MM - PRINT_MARGIN_MM * 2;

  function mmToPx(mm: number): number {
    return (mm * 96) / 25.4;
  }

  function applySinglePageScale() {
    if (!invoiceRef) return;

    // Reset scale first to measure natural content height.
    invoiceRef.style.setProperty("--print-scale", "1");

    const maxHeightPx = mmToPx(A4_PRINTABLE_HEIGHT_MM);
    const naturalHeight = invoiceRef.scrollHeight;
    const scale = naturalHeight > maxHeightPx ? maxHeightPx / naturalHeight : 1;

    // Keep a sane lower bound so content remains legible if data is very dense.
    const boundedScale = Math.max(0.65, Math.min(1, scale));
    invoiceRef.style.setProperty("--print-scale", boundedScale.toFixed(4));
  }

  onMount(() => {
    void loadData();
    const handleBeforePrint = () => applySinglePageScale();
    window.addEventListener("beforeprint", handleBeforePrint);

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
    };
  });

  async function loadData() {
    try {
      loading = true;

      // Load company details
      const companies = await companyService.getCompanies();
      company =
        companies.find((c: Company) => c.id === voucher.companyId) || null;

      // Load document configuration
      config = await documentConfigService.getDocConfig(
        voucher.companyId,
        voucher.voucherType
      );

      // Load voucher lines
      const voucherData = await voucherService.getVoucherById(voucher.id);
      if (voucherData) {
        accountLines = voucherData.accountLines;

        // Load items, units, and party account data
        const [items, units, accounts] = await Promise.all([
          mastersService.getItems(voucher.companyId),
          mastersService.getUnits(voucher.companyId),
          mastersService.getAccounts(voucher.companyId),
        ]);

        // Enrich item lines with additional data
        itemLines = voucherData.itemLines.map((line) => {
          const item = items.find((i) => i.id === line.itemId);
          const unit = units.find((u) => u.id === line.unitId);

          const discountPercent =
            line.rate > 0 ? (line.discount / (line.qty * line.rate)) * 100 : 0;
          const taxableAmount = line.amount;
          const gstAmount = item?.gstRate
            ? (taxableAmount * item.gstRate) / 100
            : 0;

          return {
            ...line,
            itemName: item?.name || `Item ${line.itemId}`,
            hsnCode: item?.hsn || "",
            gstRate: item?.gstRate || 0,
            unitName: unit?.name || "",
            discountPercent,
            gstAmount,
            taxableAmount,
          };
        });

        // Load party account details
        if (voucher.partyAccountId) {
          partyAccount =
            accounts.find((a) => a.id === voucher.partyAccountId) || null;
        }
      }
    } catch (err) {
      console.error("Error loading invoice data:", err);
    } finally {
      loading = false;
      requestAnimationFrame(() => applySinglePageScale());
    }
  }

  async function exportToPDF() {
    console.log("exportToPDF called", { invoiceRef, company, loading });
    if (loading) {
      console.error("Still loading data");
      return;
    }
    if (!company) {
      console.error("Missing company data");
      alert("Company data not loaded. Please wait and try again.");
      return;
    }
    if (!invoiceRef) {
      console.error("Missing invoiceRef - DOM element not ready");
      alert(
        "Invoice not ready for export. Please wait a moment and try again."
      );
      return;
    }

    try {
      exporting = true;
      console.log("Starting PDF export...");

      // Small delay to ensure DOM is fully rendered
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Capture the invoice as canvas
      const canvas = await html2canvas(invoiceRef, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      });

      console.log("Canvas created:", canvas.width, "x", canvas.height);

      // Calculate PDF dimensions (A4)
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF({
        orientation: imgHeight > 297 ? "portrait" : "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Generate filename
      const filename = `${voucher.voucherType.replace(/\s+/g, "_")}_${voucher.series}_${voucher.vchNo}.pdf`;

      console.log("Saving PDF:", filename);
      // Save PDF
      pdf.save(filename);
      console.log("PDF saved successfully");
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert(
        `Failed to export PDF: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      exporting = false;
    }
  }

  function formatCurrency(amount: number): string {
    if (!company) return amount.toFixed(2);
    return amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function getInvoiceTitle(): string {
    const type = voucher.voucherType;
    if (type === "Sales") return "TAX INVOICE";
    if (type === "Sales Return") return "CREDIT NOTE";
    if (type === "Purchase") return "PURCHASE INVOICE";
    if (type === "Purchase Return") return "DEBIT NOTE";
    return type.toUpperCase();
  }

  interface GSTBreakdown {
    gstRate: number;
    taxableAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalAmount: number;
  }

  function calculateGSTBreakdown(): GSTBreakdown[] {
    const breakdown = new Map<number, GSTBreakdown>();

    itemLines.forEach((line) => {
      const rate = line.gstRate || 0;
      if (!breakdown.has(rate)) {
        breakdown.set(rate, {
          gstRate: rate,
          taxableAmount: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          totalAmount: 0,
        });
      }

      const entry = breakdown.get(rate)!;
      entry.taxableAmount += line.taxableAmount || 0;
      const gstAmt = line.gstAmount || 0;

      // Assuming intra-state transaction, split into CGST and SGST
      entry.cgstAmount += gstAmt / 2;
      entry.sgstAmount += gstAmt / 2;
      entry.totalAmount += (line.taxableAmount || 0) + gstAmt;
    });

    return Array.from(breakdown.values()).sort((a, b) => b.gstRate - a.gstRate);
  }

  function getTotalTaxableAmount(): number {
    return itemLines.reduce((sum, line) => sum + (line.taxableAmount || 0), 0);
  }

  function getTotalGSTAmount(): number {
    return itemLines.reduce((sum, line) => sum + (line.gstAmount || 0), 0);
  }

  function getTotalCGST(): number {
    return getTotalGSTAmount() / 2;
  }

  function getTotalSGST(): number {
    return getTotalGSTAmount() / 2;
  }
</script>

<div>
  {#if loading}
    <div class="text-center py-8 text-neutral-400">Loading invoice...</div>
  {:else if company}
    {#if showExportButton}
      <div class="mb-4 flex justify-end gap-2 no-print">
        <button
          onclick={exportToPDF}
          disabled={exporting}
          class="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? "Exporting..." : "Export PDF"}
        </button>
      </div>
    {/if}

    <div
      class="invoice-print-frame w-full max-w-[210mm] mx-auto bg-white print:max-w-none"
    >
      <div
        bind:this={invoiceRef}
        class="invoice-container bg-white text-black p-8 font-sans print:p-4"
      >
        <!-- Top Header Row: GSTIN | Title | Original Copy -->
        <div
          class="top-header grid grid-cols-3 gap-4 mb-4 text-sm border-b border-black pb-2"
        >
          <div class="text-left">
            <span class="font-semibold">GSTIN:</span>
            {company.gstNo || "N/A"}
          </div>
          <div class="text-center font-bold text-lg">{getInvoiceTitle()}</div>
          <div class="text-right font-semibold">Original Copy</div>
        </div>

        <!-- Company Header -->
        {#if !config?.prePrintedHeader}
          <div class="company-header mb-4 border-b-2 border-black pb-4">
            <div class="flex items-start gap-4">
              {#if config?.printLogo && config?.logoPath}
                <div class="logo flex-shrink-0">
                  <img
                    src={config.logoPath}
                    alt="Company Logo"
                    style="width: {config.logoWidth}px; height: {config.logoHeight}px;"
                  />
                </div>
              {/if}

              <div class="flex-grow text-center">
                {#if config?.printCompanyName !== false}
                  <h1 class="text-3xl font-bold mb-2">{company.name}</h1>
                {/if}

                {#if config?.printCompanyAddress !== false}
                  <div class="text-sm mb-1">
                    {#if company.address1}<div>{company.address1}</div>{/if}
                    {#if company.address2}<div>{company.address2}</div>{/if}
                    {#if company.address3}{company.address3},
                    {/if}
                    {#if company.address4}{company.address4}{/if}
                  </div>
                {/if}

                {#if config?.printCompanyPhone}
                  <div class="text-sm">
                    {#if company.telNo}Tel: {company.telNo}{/if}
                    {#if company.email}, Email: {company.email}{/if}
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/if}

        <!-- Buyer & Invoice Details: Two Column Layout -->
        <div
          class="details-section grid grid-cols-2 gap-6 mb-6 text-sm border border-black"
        >
          <!-- Left: Buyer Details -->
          <div class="p-3 border-r border-black">
            <div class="font-bold mb-2">Billed To (BUYER):</div>
            {#if partyAccount}
              <div class="font-semibold text-base mb-1">
                {partyAccount.name}
              </div>
              {#if partyAccount.printName && partyAccount.printName !== partyAccount.name}
                <div class="text-sm mb-1">{partyAccount.printName}</div>
              {/if}
              {#if partyAccount.description}
                <div class="text-sm mb-1">{partyAccount.description}</div>
              {/if}
              <div class="mt-2">
                <div>PARTY GSTIN: <span class="font-medium">N/A</span></div>
                <div>PARTY PAN NO: <span class="font-medium">N/A</span></div>
              </div>
            {:else}
              <div class="text-gray-500 italic">No party selected</div>
            {/if}
          </div>

          <!-- Right: Invoice Details -->
          <div class="p-3">
            <div class="space-y-1">
              <div class="grid grid-cols-2">
                <span class="font-semibold">Invoice No:</span>
                <span>{voucher.series}/{voucher.vchNo}</span>
              </div>
              <div class="grid grid-cols-2">
                <span class="font-semibold">Date:</span>
                <span>{new Date(voucher.date).toLocaleDateString("en-IN")}</span
                >
              </div>
              {#if voucher.stockDate}
                <div class="grid grid-cols-2">
                  <span class="font-semibold">Stock Date:</span>
                  <span
                    >{new Date(voucher.stockDate).toLocaleDateString(
                      "en-IN"
                    )}</span
                  >
                </div>
              {/if}
              <div class="grid grid-cols-2">
                <span class="font-semibold">Place of Supply:</span>
                <span>{company.state}</span>
              </div>
              <div class="grid grid-cols-2">
                <span class="font-semibold">Reverse Charge:</span>
                <span>Not Applicable</span>
              </div>
              <div class="grid grid-cols-2">
                <span class="font-semibold">GR/LR No:</span>
                <span></span>
              </div>
              <div class="grid grid-cols-2">
                <span class="font-semibold">Transport:</span>
                <span></span>
              </div>
              <div class="grid grid-cols-2">
                <span class="font-semibold">Vehicle No:</span>
                <span></span>
              </div>
              <div class="grid grid-cols-2">
                <span class="font-semibold">E Way Bill No:</span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Item Lines -->
        {#if itemLines.length > 0}
          <table class="w-full mb-4 border border-black text-xs">
            <thead>
              <tr class="bg-gray-200 border-b border-black">
                <th class="text-left p-2 border-r border-black w-8">S.N</th>
                <th class="text-left p-2 border-r border-black"
                  >Description of Goods</th
                >
                <th class="text-center p-2 border-r border-black w-20"
                  >HSN/SAC Code</th
                >
                <th class="text-center p-2 border-r border-black w-16">QTY</th>
                <th class="text-center p-2 border-r border-black w-16">UNIT</th>
                <th class="text-right p-2 border-r border-black w-20"
                  >RATE<br />(₹)</th
                >
                <th class="text-right p-2 border-r border-black w-16">Disc %</th
                >
                <th class="text-right p-2 border-r border-black w-20"
                  >PRICE<br />(₹)</th
                >
                <th class="text-center p-2 border-r border-black w-16">GST %</th
                >
                <th class="text-right p-2 w-24">TAXABLE<br />AMOUNT<br />(₹)</th
                >
              </tr>
            </thead>
            <tbody>
              {#each itemLines as line, i}
                <tr class="border-b border-gray-300">
                  <td class="p-2 border-r border-gray-300 text-center"
                    >{i + 1}</td
                  >
                  <td class="p-2 border-r border-gray-300">{line.itemName}</td>
                  <td class="p-2 border-r border-gray-300 text-center"
                    >{line.hsnCode}</td
                  >
                  <td class="text-center p-2 border-r border-gray-300"
                    >{line.qty.toFixed(2)}</td
                  >
                  <td class="text-center p-2 border-r border-gray-300"
                    >{line.unitName}</td
                  >
                  <td class="text-right p-2 border-r border-gray-300"
                    >{formatCurrency(line.rate)}</td
                  >
                  <td class="text-right p-2 border-r border-gray-300"
                    >{line.discountPercent?.toFixed(2)} %</td
                  >
                  <td class="text-right p-2 border-r border-gray-300"
                    >{formatCurrency(line.rate * line.qty - line.discount)}</td
                  >
                  <td class="text-center p-2 border-r border-gray-300"
                    >{line.gstRate}%</td
                  >
                  <td class="text-right p-2"
                    >{formatCurrency(line.taxableAmount || 0)}</td
                  >
                </tr>
              {/each}
            </tbody>
            <tfoot>
              <tr class="bg-gray-200 font-semibold border-t-2 border-black">
                <td colspan="3" class="p-2 border-r border-black text-right">
                  Total
                </td>
                <td class="text-center p-2 border-r border-black">
                  {itemLines
                    .reduce((sum, line) => sum + line.qty, 0)
                    .toFixed(2)}
                </td>
                <td class="p-2 border-r border-black text-center">Units</td>
                <td class="p-2 border-r border-black"></td>
                <td class="p-2 border-r border-black"></td>
                <td class="p-2 border-r border-black"></td>
                <td class="p-2 border-r border-black"></td>
                <td class="text-right p-2"
                  >{formatCurrency(getTotalTaxableAmount())}</td
                >
              </tr>
            </tfoot>
          </table>

          <!-- GST Breakdown Table -->
          <table class="w-full mb-4 border border-black text-xs">
            <thead>
              <tr class="bg-gray-200">
                <th class="text-center p-2 border-r border-black" rowspan="2"
                  >GST %</th
                >
                <th class="text-center p-2 border-r border-black" rowspan="2"
                  >Taxable Amt</th
                >
                <th class="text-center p-2 border-r border-black" colspan="2"
                  >CGST/IGST</th
                >
                <th class="text-center p-2 border-r border-black" colspan="2"
                  >SGST</th
                >
                <th class="text-center p-2" rowspan="2">Total</th>
              </tr>
              <tr class="bg-gray-200 border-t border-black">
                <th class="text-center p-1 border-r border-black text-xs">%</th>
                <th class="text-center p-1 border-r border-black text-xs"
                  >Amt</th
                >
                <th class="text-center p-1 border-r border-black text-xs">%</th>
                <th class="text-center p-1 border-r border-black text-xs"
                  >Amt</th
                >
              </tr>
            </thead>
            <tbody>
              {#each calculateGSTBreakdown() as gst}
                <tr class="border-t border-gray-300">
                  <td class="text-center p-2 border-r border-gray-300"
                    >{gst.gstRate.toFixed(2)}</td
                  >
                  <td class="text-right p-2 border-r border-gray-300"
                    >{formatCurrency(gst.taxableAmount)}</td
                  >
                  <td class="text-center p-2 border-r border-gray-300"
                    >{(gst.gstRate / 2).toFixed(2)}</td
                  >
                  <td class="text-right p-2 border-r border-gray-300"
                    >{formatCurrency(gst.cgstAmount)}</td
                  >
                  <td class="text-center p-2 border-r border-gray-300"
                    >{(gst.gstRate / 2).toFixed(2)}</td
                  >
                  <td class="text-right p-2 border-r border-gray-300"
                    >{formatCurrency(gst.sgstAmount)}</td
                  >
                  <td class="text-right p-2"
                    >{formatCurrency(gst.totalAmount)}</td
                  >
                </tr>
              {/each}
              <tr class="bg-gray-200 font-semibold border-t-2 border-black">
                <td class="text-center p-2 border-r border-black">Total</td>
                <td class="text-right p-2 border-r border-black"
                  >{formatCurrency(getTotalTaxableAmount())}</td
                >
                <td class="p-2 border-r border-black"></td>
                <td class="text-right p-2 border-r border-black"
                  >{formatCurrency(getTotalCGST())}</td
                >
                <td class="p-2 border-r border-black"></td>
                <td class="text-right p-2 border-r border-black"
                  >{formatCurrency(getTotalSGST())}</td
                >
                <td class="text-right p-2"
                  >{formatCurrency(
                    getTotalTaxableAmount() + getTotalGSTAmount()
                  )}</td
                >
              </tr>
            </tbody>
          </table>

          <!-- Total Amount -->
          <div
            class="grid grid-cols-2 gap-4 mb-4 text-sm border-t-2 border-black pt-2"
          >
            <div>
              <div class="mb-1">
                Total Amount Before Tax: <span class="float-right"
                  >₹ {formatCurrency(getTotalTaxableAmount())}</span
                >
              </div>
              <div class="mb-1">
                Less: Discount Amount (-):<span class="float-right">₹ 0.00</span
                >
              </div>
              <div class="mb-1 font-semibold">
                Total Tax Amount:<span class="float-right"></span>
              </div>
              <div class="ml-4 mb-1">
                CGST:<span class="float-right"
                  >₹ {formatCurrency(getTotalCGST())}</span
                >
              </div>
              <div class="ml-4 mb-1">
                SGST:<span class="float-right"
                  >₹ {formatCurrency(getTotalSGST())}</span
                >
              </div>
              <div class="mb-1">
                Rounded Off (-):<span class="float-right">₹ 0.00</span>
              </div>
            </div>
            <div class="text-right">
              <div class="border-2 border-black p-3 inline-block">
                <div class="text-2xl font-bold">AMOUNT PAYABLE</div>
                <div class="text-3xl font-bold mt-2">
                  {company.currencySymbol}
                  {formatCurrency(voucher.totalAmount)}
                </div>
              </div>
            </div>
          </div>

          <div class="text-xs mb-4 font-semibold">
            Rupees {company.currencyString}
            {Math.floor(voucher.totalAmount)} and {(
              (voucher.totalAmount % 1) *
              100
            ).toFixed(0)}
            {company.currencySubString} Only
          </div>
        {/if}

        <!-- Account Lines (for non-inventory vouchers) -->
        {#if accountLines.length > 0 && itemLines.length === 0}
          <table class="w-full mb-6 border border-black text-sm">
            <thead>
              <tr class="bg-gray-100 border-b border-black">
                <th class="text-left p-2 border-r border-black">S.No</th>
                <th class="text-left p-2 border-r border-black">Account</th>
                <th class="text-center p-2 border-r border-black">Dr/Cr</th>
                <th class="text-right p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {#each accountLines as line, i}
                <tr class="border-b border-gray-300">
                  <td class="p-2 border-r border-gray-300">{i + 1}</td>
                  <td class="p-2 border-r border-gray-300">
                    Account {line.accountId}
                    {#if line.shortNarration}
                      <div class="text-xs text-gray-600">
                        {line.shortNarration}
                      </div>
                    {/if}
                  </td>
                  <td class="text-center p-2 border-r border-gray-300"
                    >{line.dc}</td
                  >
                  <td class="text-right p-2">{formatCurrency(line.amount)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}

        <!-- Narration -->
        {#if config?.printNarration !== false && voucher.narration}
          <div class="narration mb-4 text-sm">
            <div class="font-semibold mb-1">Narration:</div>
            <div class="italic">{voucher.narration}</div>
          </div>
        {/if}

        <!-- Terms and Conditions & Balance Section -->
        <div class="grid grid-cols-2 gap-6 mb-4 border-t border-black pt-4">
          <!-- Left: Terms & Conditions -->
          <div class="text-xs">
            {#if config?.termsAndConditions}
              <div class="font-semibold mb-2">Terms & Conditions:</div>
              <div class="whitespace-pre-line">
                {config?.termsAndConditions}
              </div>
            {/if}

            {#if config?.declaration}
              <div class="font-semibold mt-3 mb-1">Declaration:</div>
              <div>{config?.declaration}</div>
            {/if}

            <div class="mt-3">
              <div class="font-semibold mb-1">E.B.O.E.</div>
              <div>Previous Balance: <span class="float-right">0.00</span></div>
              <div>
                Last Receipt Amount: <span class="float-right">0.00</span>
              </div>
              <div>
                Current Balance: <span class="float-right text-red-600"
                  >{formatCurrency(voucher.totalAmount)} Dr</span
                >
              </div>
            </div>
          </div>

          <!-- Right: Signature Section -->
          <div class="text-sm">
            <div class="mb-8">
              <div class="text-center mb-1">
                for {config?.signatoryLine1 || company.name}
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mt-16">
              <div class="text-left">
                <div class="border-t border-black pt-1">
                  Receiver's Signature
                </div>
              </div>
              <div class="text-right">
                <div class="border-t border-black pt-1">
                  {config?.signatoryLine2 || "Authorized Signatory"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="text-center py-8 text-neutral-400">
      Unable to load invoice details
    </div>
  {/if}
</div>

<style>
  .invoice-container {
    --print-scale: 1;
  }

  @media print {
    @page {
      size: A4 portrait;
      margin: 0;
    }

    :global(html),
    :global(body) {
      width: 210mm;
      height: 297mm;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden;
      background: white !important;
    }

    :global(body *) {
      visibility: hidden;
    }

    .invoice-print-frame,
    .invoice-print-frame * {
      visibility: visible;
    }

    .invoice-container,
    .invoice-container * {
      visibility: visible;
    }

    .invoice-print-frame {
      position: absolute;
      left: 50%;
      top: 5mm;
      width: 200mm;
      height: 287mm;
      margin: 0;
      transform: translateX(-50%);
      overflow: hidden;
      background: white;
      page-break-inside: avoid;
      break-inside: avoid-page;
    }

    .invoice-container {
      position: relative;
      left: 0;
      top: 0;
      width: calc(200mm / var(--print-scale, 1));
      max-width: none;
      margin: 0;
      padding: 4mm;
      box-sizing: border-box;
      background: white;
      zoom: var(--print-scale, 1);
      transform: scale(var(--print-scale, 1));
      transform-origin: top left;
      break-inside: avoid-page;
      page-break-inside: avoid;
      line-height: 1.15;
    }

    .invoice-container table {
      margin-bottom: 2.5mm !important;
    }

    .invoice-container th,
    .invoice-container td {
      padding-top: 1.5mm !important;
      padding-bottom: 1.5mm !important;
    }

    .invoice-container .top-header,
    .invoice-container .company-header,
    .invoice-container .details-section,
    .invoice-container .narration {
      margin-bottom: 2.5mm !important;
    }

    .invoice-container h1 {
      margin-bottom: 1.5mm !important;
      font-size: 22px !important;
    }

    .invoice-container .grid {
      column-gap: 3mm !important;
    }

    .no-print {
      display: none !important;
      visibility: hidden !important;
    }
  }
</style>
