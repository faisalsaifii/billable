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
        voucher.voucherType,
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
        "Invoice not ready for export. Please wait a moment and try again.",
      );
      return;
    }

    try {
      exporting = true;
      console.log("Starting PDF export...");

      // Add class to force standard colors (html2canvas doesn't support oklch)
      invoiceRef.classList.add("pdf-export-mode");

      // Small delay to ensure DOM is fully rendered with new styles
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Capture the invoice as canvas
      const canvas = await html2canvas(invoiceRef, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        onclone: (clonedDoc) => {
          // Inject a style tag that overrides all oklch colors with standard hex
          const styleOverride = clonedDoc.createElement("style");
          styleOverride.textContent = `
            * {
              color: inherit !important;
              border-color: currentColor !important;
            }
            .invoice-container, .invoice-container * {
              color: #000000 !important;
              background-color: transparent !important;
            }
            .bg-white, .invoice-container {
              background-color: #ffffff !important;
            }
            .bg-gray-100 {
              background-color: #f3f4f6 !important;
            }
            .bg-gray-200 {
              background-color: #e5e7eb !important;
            }
            .text-gray-500 {
              color: #6b7280 !important;
            }
            .text-gray-600 {
              color: #4b5563 !important;
            }
            .text-red-600 {
              color: #dc2626 !important;
            }
            .border-black {
              border-color: #000000 !important;
            }
            .border-gray-300 {
              border-color: #d1d5db !important;
            }
            table {
              border-color: #000000 !important;
            }
            th, td {
              border-color: inherit !important;
            }
          `;
          clonedDoc.head.appendChild(styleOverride);
        },
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
        `Failed to export PDF: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      // Remove the export mode class
      if (invoiceRef) {
        invoiceRef.classList.remove("pdf-export-mode");
      }
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
        class="invoice-container bg-white text-black p-4 font-sans print:p-4 text-xs"
      >
        <!-- Top Header Row: GSTIN | Title | Original/Copy -->
        <div
          class="top-header bg-white flex justify-between items-start mb-2 text-xs"
        >
          <div class="text-left">
            <span class="font-semibold">GSTIN : {company.gstNo || "N/A"}</span>
          </div>
          <div class="text-right italic">Original/Copy</div>
        </div>

        <!-- Company Header -->
        {#if !config?.prePrintedHeader}
          <div class="company-header bg-white mb-3 pb-3 border-b border-black">
            <div class="text-center">
              {#if config?.printCompanyName !== false}
                <h1 class="text-2xl font-bold mb-1">{getInvoiceTitle()}</h1>
                <h2 class="text-xl font-bold mb-2">{company.name}</h2>
              {/if}

              {#if config?.printCompanyAddress !== false}
                <div class="text-xs">
                  <div>
                    {#if company.address1}{company.address1}{/if}
                  </div>
                  <div>
                    {#if company.address2}{company.address2},
                    {/if}
                    {#if company.address3}{company.address3},
                    {/if}
                    {#if company.address4}{company.address4}{/if}
                  </div>
                </div>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Invoice & Transport Details: Two Column Layout -->
        <div
          class="details-section bg-white grid grid-cols-2 gap-0 mb-3 text-xs border border-black"
        >
          <!-- Left: Invoice Details -->
          <div class="bg-white p-2 border-r border-black">
            <div class="space-y-0.5">
              <div class="flex">
                <span class="w-32">Invoice No.</span>
                <span class="mr-2">:</span>
                <span>{voucher.series}/{voucher.vchNo}</span>
              </div>
              <div class="flex">
                <span class="w-32">Dated</span>
                <span class="mr-2">:</span>
                <span>{new Date(voucher.date).toLocaleDateString("en-IN")}</span
                >
              </div>
              <div class="flex">
                <span class="w-32">Place of Supply</span>
                <span class="mr-2">:</span>
                <span>{company.state}</span>
              </div>
              <div class="flex">
                <span class="w-32">Reverse Charge</span>
                <span class="mr-2">:</span>
                <span>N</span>
              </div>
            </div>
          </div>

          <!-- Right: Transport Details -->
          <div class="bg-white p-2">
            <div class="space-y-0.5">
              <div class="flex">
                <span class="w-28">GR/RR No.</span>
                <span class="mr-2">:</span>
                <span></span>
              </div>
              <div class="flex">
                <span class="w-28">Transport</span>
                <span class="mr-2">:</span>
                <span>Self</span>
              </div>
              <div class="flex">
                <span class="w-28">Vehicle No.</span>
                <span class="mr-2">:</span>
                <span></span>
              </div>
              <div class="flex">
                <span class="w-28">Station</span>
                <span class="mr-2">:</span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Billed To & Shipped To: Two Column Layout -->
        <div
          class="details-section bg-white grid grid-cols-2 gap-0 mb-3 text-xs border border-black"
        >
          <!-- Left: Billed To -->
          <div class="bg-white p-2 border-r border-black">
            <div class="font-bold mb-1 underline">Billed to :</div>
            {#if partyAccount}
              <div class="font-semibold mb-0.5">
                {partyAccount.name}
              </div>
              {#if partyAccount.description}
                <div class="mb-1">{partyAccount.description}</div>
              {/if}
              <div>GSTIN / UIN :</div>
            {:else}
              <div class="text-gray-500 italic">No party selected</div>
            {/if}
          </div>

          <!-- Right: Shipped To -->
          <div class="bg-white p-2">
            <div class="font-bold mb-1 underline">Shipped to :</div>
            {#if partyAccount}
              <div class="font-semibold mb-0.5">
                {partyAccount.name}
              </div>
              {#if partyAccount.description}
                <div class="mb-1">{partyAccount.description}</div>
              {/if}
              <div>GSTIN / UIN :</div>
            {:else}
              <div class="text-gray-500 italic">No party selected</div>
            {/if}
          </div>
        </div>

        <!-- Item Lines -->
        {#if itemLines.length > 0}
          <table class="w-full mb-2 border border-black text-xs bg-white">
            <thead>
              <tr class="bg-white border-b border-black">
                <th class="text-center p-1.5 border-r border-black w-10"
                  >S.N.</th
                >
                <th class="text-left p-1.5 border-r border-black"
                  >Description of Goods</th
                >
                <th class="text-center p-1.5 border-r border-black w-20"
                  >HSN/SAC<br />Code</th
                >
                <th class="text-center p-1.5 border-r border-black w-16"
                  >Qty.</th
                >
                <th class="text-center p-1.5 border-r border-black w-14"
                  >Unit</th
                >
                <th class="text-right p-1.5 border-r border-black w-20"
                  >Price</th
                >
                <th class="text-right p-1.5 w-24">Amount( ₹ )</th>
              </tr>
            </thead>
            <tbody class="bg-white">
              {#each itemLines as line, i}
                <tr class="bg-white border-b border-black">
                  <td class="bg-white p-1.5 border-r border-black text-center"
                    >{i + 1}.</td
                  >
                  <td class="bg-white p-1.5 border-r border-black"
                    >{line.itemName}</td
                  >
                  <td class="bg-white p-1.5 border-r border-black text-center"
                    >{line.hsnCode}</td
                  >
                  <td class="bg-white text-right p-1.5 border-r border-black"
                    >{line.qty.toFixed(2)}</td
                  >
                  <td class="bg-white text-center p-1.5 border-r border-black"
                    >{line.unitName}</td
                  >
                  <td class="bg-white text-right p-1.5 border-r border-black"
                    >{formatCurrency(line.rate)}</td
                  >
                  <td class="bg-white text-right p-1.5"
                    >{formatCurrency(line.taxableAmount || 0)}</td
                  >
                </tr>
              {/each}
            </tbody>
          </table>

          <!-- Tax Summary -->
          <div class="bg-white text-xs border-t border-black">
            <table class="w-full">
              <tbody>
                <tr>
                  <td class="text-right p-1.5 pr-4" colspan="6"></td>
                  <td class="text-right p-1.5 font-semibold w-24">
                    {formatCurrency(getTotalTaxableAmount())}
                  </td>
                </tr>
                {#if voucher.taxAmount > 0}
                  <tr>
                    <td class="text-right p-1 pr-2" colspan="6">
                      Add : Tax Amount
                    </td>
                    <td class="text-right p-1 w-24">
                      {formatCurrency(voucher.taxAmount)}
                    </td>
                  </tr>
                {/if}
                {#if voucher.transportCharges > 0}
                  <tr>
                    <td class="text-right p-1 pr-2" colspan="6">
                      Add : Transport Charges
                    </td>
                    <td class="text-right p-1 w-24">
                      {formatCurrency(voucher.transportCharges)}
                    </td>
                  </tr>
                {/if}
                {#if voucher.otherCharges !== 0}
                  <tr>
                    <td class="text-right p-1 pr-2" colspan="6">
                      {voucher.otherCharges > 0 ? "Add" : "Less"} : Other Charges
                    </td>
                    <td class="text-right p-1 w-24">
                      {formatCurrency(Math.abs(voucher.otherCharges))}
                    </td>
                  </tr>
                {/if}
                {#if voucher.roundedOff !== 0}
                  <tr>
                    <td class="text-right p-1 pr-2" colspan="6">
                      {voucher.roundedOff > 0 ? "Add" : "Less"} : Rounded Off
                    </td>
                    <td class="text-right p-1 w-24">
                      {formatCurrency(Math.abs(voucher.roundedOff))}
                    </td>
                  </tr>
                {/if}
              </tbody>
            </table>
          </div>

          <!-- Grand Total -->
          <div class="bg-white border-t-2 border-black">
            <table class="w-full text-xs">
              <tbody>
                <tr>
                  <td class="text-center p-1.5 font-bold" colspan="5">
                    Grand Total
                  </td>
                  <td class="text-right p-1.5 font-bold">
                    {itemLines
                      .reduce((sum, line) => sum + line.qty, 0)
                      .toFixed(2)} Pcs.
                  </td>
                  <td class="text-center p-1.5 font-bold w-24">-</td>
                  <td class="text-right p-1.5 font-bold w-24">
                    {formatCurrency(voucher.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Tax Rate Table -->
          <div class="bg-white mt-2 mb-2">
            <table class="w-full border border-black text-xs">
              <thead>
                <tr class="bg-white border-b border-black">
                  <th class="text-center p-1 border-r border-black" rowspan="2"
                    >Tax Rate</th
                  >
                  <th class="text-center p-1 border-r border-black" rowspan="2"
                    >Taxable Amt.</th
                  >
                  <th class="text-center p-1 border-r border-black" rowspan="2"
                    >IGST Amt.</th
                  >
                  <th class="text-center p-1 border-r border-black" rowspan="2"
                    >Total Tax</th
                  >
                </tr>
              </thead>
              <tbody class="bg-white">
                {#each calculateGSTBreakdown() as gst}
                  <tr class="bg-white border-t border-black">
                    <td class="bg-white text-center p-1 border-r border-black"
                      >{gst.gstRate.toFixed(0)} %</td
                    >
                    <td class="bg-white text-right p-1 border-r border-black"
                      >{formatCurrency(gst.taxableAmount)}</td
                    >
                    <td class="bg-white text-right p-1 border-r border-black"
                      >{formatCurrency(gst.cgstAmount + gst.sgstAmount)}</td
                    >
                    <td class="bg-white text-right p-1"
                      >{formatCurrency(gst.cgstAmount + gst.sgstAmount)}</td
                    >
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          <!-- Amount in Words -->
          <div
            class="bg-white text-xs mb-2 border-t border-black pt-2 font-semibold"
          >
            Rupees {company.currencyString}
            {Math.floor(voucher.totalAmount)} and {(
              (voucher.totalAmount % 1) *
              100
            ).toFixed(0)}
            {company.currencySubString} Only
          </div>

          <!-- Bank Details -->
          {#if company.bankName || company.bankAccountNo}
            <div class="bg-white mb-2 text-xs border border-black p-2">
              <div class="font-semibold mb-1">Bank Details :</div>
              <div class="grid grid-cols-2 gap-x-4">
                <div>
                  {#if company.bankName}{company.bankName}{/if}
                  {#if company.bankBranch}
                    Branch {company.bankBranch}
                  {/if}
                </div>
                <div>
                  {#if company.bankAccountNo}A/C No. : {company.bankAccountNo}{/if}
                  {#if company.bankIFSC}
                    IFSC Code: {company.bankIFSC}
                  {/if}
                </div>
              </div>
            </div>
          {/if}
        {/if}

        <!-- Account Lines (for non-inventory vouchers) -->
        {#if accountLines.length > 0 && itemLines.length === 0}
          <table class="w-full mb-6 border border-black text-sm bg-white">
            <thead>
              <tr class="bg-gray-100 border-b border-black">
                <th class="text-left p-2 border-r border-black">S.No</th>
                <th class="text-left p-2 border-r border-black">Account</th>
                <th class="text-center p-2 border-r border-black">Dr/Cr</th>
                <th class="text-right p-2">Amount</th>
              </tr>
            </thead>
            <tbody class="bg-white">
              {#each accountLines as line, i}
                <tr class="bg-white border-b border-gray-300">
                  <td class="bg-white p-2 border-r border-gray-300">{i + 1}</td>
                  <td class="bg-white p-2 border-r border-gray-300">
                    Account {line.accountId}
                    {#if line.shortNarration}
                      <div class="text-xs text-gray-600">
                        {line.shortNarration}
                      </div>
                    {/if}
                  </td>
                  <td class="bg-white text-center p-2 border-r border-gray-300">
                    {line.dc}</td
                  >
                  <td class="bg-white text-right p-2"
                    >{formatCurrency(line.amount)}</td
                  >
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}

        <!-- Narration -->
        {#if config?.printNarration !== false && voucher.narration}
          <div
            class="narration bg-white mb-2 text-xs border-b border-black pb-2"
          >
            <div class="font-semibold mb-0.5">Narration:</div>
            <div class="italic">{voucher.narration}</div>
          </div>
        {/if}

        <!-- Terms and Conditions & Signature Section -->
        <div class="bg-white grid grid-cols-2 gap-4 border-t border-black pt-2">
          <!-- Left: Terms & Conditions -->
          <div class="text-xs">
            <div class="font-semibold mb-1">Terms & Conditions</div>
            {#if config?.termsAndConditions}
              <div class="whitespace-pre-line text-xs leading-tight">
                {config?.termsAndConditions}
              </div>
            {:else}
              <div class="text-xs leading-tight">
                E.& O.E.<br />
                1. Goods once sold will not be taken back.<br />
                2. Interest @ 18% p.a. will be charged if the payment<br />
                is not made in the stipulated time.<br />
                3. Subject to 'Uttar Pradesh' Jurisdiction only.
              </div>
            {/if}
          </div>

          <!-- Right: Receiver's Signature & Company Signature -->
          <div class="text-xs">
            <div class="text-center mb-1">
              <div class="font-semibold">Receiver's Signature :</div>
            </div>
            <div class="mt-16 text-right">
              <div class="font-semibold">For {company.name}</div>
              <div class="mt-12 border-t border-black inline-block px-8 pt-1">
                Authorised Signatory
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
    background-color: #ffffff !important;
    color: #000000 !important;
  }

  /* Force white backgrounds for all invoice elements */
  .invoice-container * {
    background-color: transparent;
    color: #000000 !important;
  }

  .invoice-container .bg-white,
  .invoice-print-frame {
    background-color: #ffffff !important;
  }

  .invoice-container table {
    background-color: #ffffff !important;
    color: #000000 !important;
    border-color: #000000 !important;
  }

  .invoice-container tbody {
    background-color: #ffffff !important;
  }

  .invoice-container tbody tr {
    background-color: #ffffff !important;
  }

  .invoice-container tbody td {
    background-color: #ffffff !important;
    color: #000000 !important;
    border-color: #000000 !important;
  }

  :global(.invoice-container thead th) {
    color: #000000 !important;
    border-color: #000000 !important;
  }

  :global(.invoice-container tfoot td) {
    color: #000000 !important;
    border-color: #000000 !important;
  }

  /* Force all borders to be black */
  :global(.invoice-container .border),
  :global(.invoice-container .border-black),
  :global(.invoice-container .border-gray-300),
  :global(.invoice-container .border-t),
  :global(.invoice-container .border-b),
  :global(.invoice-container .border-r),
  :global(.invoice-container .border-l),
  :global(.invoice-container .border-t-2),
  :global(.invoice-container .border-b-2) {
    border-color: #000000 !important;
  }

  /* Gray backgrounds for headers/footers */
  :global(.invoice-container .bg-gray-100) {
    background-color: #f3f4f6 !important;
  }

  :global(.invoice-container .bg-gray-200) {
    background-color: #e5e7eb !important;
  }

  :global(.invoice-container thead tr) {
    background-color: #e5e7eb !important;
  }

  :global(.invoice-container tfoot tr) {
    background-color: #e5e7eb !important;
  }

  /* Text colors */
  :global(.invoice-container .text-gray-500) {
    color: #6b7280 !important;
  }

  :global(.invoice-container .text-gray-600) {
    color: #4b5563 !important;
  }

  :global(.invoice-container .text-red-600) {
    color: #dc2626 !important;
  }

  :global(.invoice-container .text-black) {
    color: #000000 !important;
  }

  /* Force standard colors for PDF export (html2canvas doesn't support oklch) */
  :global(.pdf-export-mode) {
    color: #000000 !important;
    background-color: #ffffff !important;
  }

  :global(.pdf-export-mode *) {
    /* Reset any oklch colors to standard equivalents */
    border-color: inherit !important;
  }

  /* Override Tailwind colors with standard hex values during export */
  :global(.pdf-export-mode .text-neutral-400) {
    color: #a3a3a3 !important;
  }

  :global(.pdf-export-mode .bg-green-600) {
    background-color: #16a34a !important;
  }

  :global(.pdf-export-mode .bg-green-500) {
    background-color: #22c55e !important;
  }

  :global(.pdf-export-mode .text-white) {
    color: #ffffff !important;
  }

  :global(.pdf-export-mode .bg-white) {
    background-color: #ffffff !important;
  }

  :global(.pdf-export-mode .text-black) {
    color: #000000 !important;
  }

  :global(.pdf-export-mode .bg-gray-200) {
    background-color: #e5e7eb !important;
  }

  :global(.pdf-export-mode .bg-gray-100) {
    background-color: #f3f4f6 !important;
  }

  :global(.pdf-export-mode .text-gray-500) {
    color: #6b7280 !important;
  }

  :global(.pdf-export-mode .text-gray-600) {
    color: #4b5563 !important;
  }

  :global(.pdf-export-mode .border-gray-300) {
    border-color: #d1d5db !important;
  }

  :global(.pdf-export-mode .text-red-600) {
    color: #dc2626 !important;
  }

  :global(.pdf-export-mode .border-black) {
    border-color: #000000 !important;
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
