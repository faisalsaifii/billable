<script lang="ts">
  import { session } from "../../lib/stores/session";
  import { documentConfigService } from "../../lib/services/documentConfigService";
  import Input from "../Input.svelte";
  import Button from "../Button.svelte";
  import type { DocumentConfiguration, VoucherType } from "../../types";

  let companyId = $state(0);
  let loading = $state(false);
  let error = $state("");
  let success = $state("");

  const voucherTypes: VoucherType[] = [
    "Sales",
    "Sales Return",
    "Purchase",
    "Purchase Return",
    "Payment",
    "Receipt",
    "Journal",
    "Contra",
    "Debit Note",
    "Credit Note",
  ];

  let selectedVoucherType: VoucherType = $state("Sales");
  let config = $state<Partial<DocumentConfiguration>>({
    printCompanyName: true,
    printCompanyAddress: true,
    printCompanyPhone: false,
    printCompanyTIN: false,
    prePrintedHeader: false,
    headerText: null,
    invoiceWidth: "80",
    printItemCode: true,
    printItemDescription: true,
    printItemRate: true,
    printVATWithItems: false,
    printVATSeparatelyWithItems: false,
    printNarration: true,
    printQtyTotals: true,
    printDailyMessage: false,
    useFullPageForDocument: false,
    ejectPageAfterPrinting: false,
    printZeroAmountBillSundries: false,
    printLogo: false,
    logoPath: null,
    logoPosition: null,
    logoHeight: 0,
    logoWidth: 0,
    declaration: null,
    termsAndConditions:
      "1. Goods once sold will not be taken back.\n2. Interest @18% p.a. will be charged if the payment is not made within the stipulated time.\n3. All disputes are subject to [CITY] jurisdiction only.",
    signatoryLine1: null,
    signatoryLine2: "Authorized Signatory",
  });

  $effect(() => {
    const unsub = session.subscribe((s) => {
      if (s.companyId) {
        companyId = s.companyId;
        loadConfig();
      }
    });
    return unsub;
  });

  async function loadConfig() {
    if (!companyId) return;
    try {
      loading = true;
      const existing = await documentConfigService.getDocConfig(
        companyId,
        selectedVoucherType
      );
      if (existing) {
        config = { ...existing };
      } else {
        // Reset to defaults when switching voucher types if no config exists
        config = {
          printCompanyName: true,
          printCompanyAddress: true,
          printCompanyPhone: false,
          printCompanyTIN: false,
          prePrintedHeader: false,
          headerText: null,
          invoiceWidth: "80",
          printItemCode: true,
          printItemDescription: true,
          printItemRate: true,
          printVATWithItems: false,
          printVATSeparatelyWithItems: false,
          printNarration: true,
          printQtyTotals: true,
          printDailyMessage: false,
          useFullPageForDocument: false,
          ejectPageAfterPrinting: false,
          printZeroAmountBillSundries: false,
          printLogo: false,
          logoPath: null,
          logoPosition: null,
          logoHeight: 0,
          logoWidth: 0,
          declaration: null,
          termsAndConditions:
            "1. Goods once sold will not be taken back.\n2. Interest @18% p.a. will be charged if the payment is not made within the stipulated time.\n3. All disputes are subject to [CITY] jurisdiction only.",
          signatoryLine1: null,
          signatoryLine2: "Authorized Signatory",
        };
      }
    } catch (err) {
      console.error("Error loading config:", err);
      error =
        err instanceof Error ? err.message : "Failed to load configuration";
    } finally {
      loading = false;
    }
  }

  async function handleVoucherTypeChange() {
    await loadConfig();
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!companyId) return;

    try {
      loading = true;
      error = "";
      success = "";

      const existing = await documentConfigService.getDocConfig(
        companyId,
        selectedVoucherType
      );

      if (existing) {
        await documentConfigService.updateDocConfig(existing.id, config);
        success = "Configuration updated successfully";
      } else {
        await documentConfigService.createDocConfig({
          companyId,
          voucherType: selectedVoucherType,
          ...config,
        } as Omit<DocumentConfiguration, "id" | "createdAt" | "updatedAt">);
        success = "Configuration created successfully";
      }

      setTimeout(() => (success = ""), 3000);
    } catch (err) {
      console.error("Error saving config:", err);
      error =
        err instanceof Error ? err.message : "Failed to save configuration";
    } finally {
      loading = false;
    }
  }
</script>

<div class="p-8 max-w-5xl mx-auto">
  <h1 class="text-2xl font-bold text-white mb-2">Document Configuration</h1>
  <p class="text-neutral-400 text-sm mb-6">
    Configure printing layout and content for invoices and vouchers
  </p>

  {#if error}
    <div
      class="bg-red-900/30 text-red-300 p-4 rounded-lg mb-6 border border-red-800/50"
    >
      {error}
    </div>
  {/if}

  {#if success}
    <div
      class="bg-green-900/30 text-green-300 p-4 rounded-lg mb-6 border border-green-800/50"
    >
      {success}
    </div>
  {/if}

  <form onsubmit={handleSubmit} class="space-y-6">
    <!-- Voucher Type Selection -->
    <div class="card-elevated">
      <h2 class="section-title">Voucher Type</h2>
      <div>
        <label
          for="voucherType"
          class="block text-sm font-medium text-neutral-300 mb-2"
        >
          Select Voucher Type
        </label>
        <select
          id="voucherType"
          bind:value={selectedVoucherType}
          onchange={handleVoucherTypeChange}
          class="w-full max-w-md border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500"
        >
          {#each voucherTypes as vt}
            <option value={vt}>{vt}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Header Section -->
    <div class="card-elevated">
      <h2 class="section-title">Header Configuration</h2>
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={config.printCompanyName}
              class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
            />
            <span class="text-neutral-300">Print Company Name</span>
          </label>

          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={config.printCompanyAddress}
              class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
            />
            <span class="text-neutral-300">Print Company Address</span>
          </label>

          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={config.printCompanyPhone}
              class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
            />
            <span class="text-neutral-300">Print Company Phone</span>
          </label>

          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={config.printCompanyTIN}
              class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
            />
            <span class="text-neutral-300">Print Company TIN</span>
          </label>

          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={config.prePrintedHeader}
              class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
            />
            <span class="text-neutral-300">Pre-printed Header</span>
          </label>
        </div>

        <div>
          <label
            for="headerText"
            class="block text-sm font-medium text-neutral-300 mb-2"
          >
            Header Text (Optional)
          </label>
          <input
            id="headerText"
            type="text"
            bind:value={config.headerText}
            placeholder="Custom header text"
            class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500"
          />
        </div>

        <div>
          <label
            for="invoiceWidth"
            class="block text-sm font-medium text-neutral-300 mb-2"
          >
            Invoice Width (characters)
          </label>
          <select
            id="invoiceWidth"
            bind:value={config.invoiceWidth}
            class="w-full max-w-xs border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500"
          >
            <option value="80">80</option>
            <option value="94/96">94/96</option>
            <option value="132/136">132/136</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Item Details Section -->
    <div class="card-elevated">
      <h2 class="section-title">Item Details Configuration</h2>
      <div class="grid grid-cols-2 gap-4">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={config.printItemCode}
            class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
          />
          <span class="text-neutral-300">Print Item Code</span>
        </label>

        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={config.printItemDescription}
            class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
          />
          <span class="text-neutral-300">Print Item Description</span>
        </label>

        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={config.printItemRate}
            class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
          />
          <span class="text-neutral-300">Print Item Rate</span>
        </label>

        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={config.printVATWithItems}
            class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
          />
          <span class="text-neutral-300">Print VAT with Items</span>
        </label>

        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={config.printVATSeparatelyWithItems}
            class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
          />
          <span class="text-neutral-300">Print VAT Separately</span>
        </label>

        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={config.printNarration}
            class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
          />
          <span class="text-neutral-300">Print Narration</span>
        </label>

        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={config.printQtyTotals}
            class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
          />
          <span class="text-neutral-300">Print Quantity Totals</span>
        </label>

        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={config.printDailyMessage}
            class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
          />
          <span class="text-neutral-300">Print Daily Message</span>
        </label>

        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={config.useFullPageForDocument}
            class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
          />
          <span class="text-neutral-300">Use Full Page</span>
        </label>

        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={config.ejectPageAfterPrinting}
            class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
          />
          <span class="text-neutral-300">Eject Page After Printing</span>
        </label>

        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={config.printZeroAmountBillSundries}
            class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
          />
          <span class="text-neutral-300">Print Zero Amount Bill Sundries</span>
        </label>
      </div>
    </div>

    <!-- Logo Section -->
    <div class="card-elevated">
      <h2 class="section-title">Logo Configuration</h2>
      <div class="space-y-4">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={config.printLogo}
            class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
          />
          <span class="text-neutral-300">Print Logo</span>
        </label>

        {#if config.printLogo}
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                for="logoPath"
                class="block text-sm font-medium text-neutral-300 mb-2"
              >
                Logo Path
              </label>
              <input
                id="logoPath"
                type="text"
                bind:value={config.logoPath}
                placeholder="/path/to/logo.png"
                class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label
                for="logoPosition"
                class="block text-sm font-medium text-neutral-300 mb-2"
              >
                Logo Position
              </label>
              <select
                id="logoPosition"
                bind:value={config.logoPosition}
                class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500"
              >
                <option value={null}>Select Position</option>
                <option value="Top Left">Top Left</option>
                <option value="Top Right">Top Right</option>
                <option value="Center">Center</option>
              </select>
            </div>

            <div>
              <label
                for="logoHeight"
                class="block text-sm font-medium text-neutral-300 mb-2"
              >
                Logo Height (0 = default)
              </label>
              <input
                id="logoHeight"
                type="number"
                step="1"
                bind:value={config.logoHeight}
                class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label
                for="logoWidth"
                class="block text-sm font-medium text-neutral-300 mb-2"
              >
                Logo Width (0 = default)
              </label>
              <input
                id="logoWidth"
                type="number"
                step="1"
                bind:value={config.logoWidth}
                class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500"
              />
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Footer Section -->
    <div class="card-elevated">
      <h2 class="section-title">Footer Configuration</h2>
      <div class="space-y-4">
        <div>
          <label
            for="declaration"
            class="block text-sm font-medium text-neutral-300 mb-2"
          >
            Declaration (Optional)
          </label>
          <textarea
            id="declaration"
            bind:value={config.declaration}
            rows="2"
            placeholder="Printed above footer"
            class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500"
          ></textarea>
        </div>

        <div>
          <label
            for="termsAndConditions"
            class="block text-sm font-medium text-neutral-300 mb-2"
          >
            Terms and Conditions
          </label>
          <textarea
            id="termsAndConditions"
            bind:value={config.termsAndConditions}
            rows="4"
            class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label
              for="signatoryLine1"
              class="block text-sm font-medium text-neutral-300 mb-2"
            >
              Signatory Line 1 (e.g., Company Name)
            </label>
            <input
              id="signatoryLine1"
              type="text"
              bind:value={config.signatoryLine1}
              placeholder="Company Name"
              class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500"
            />
          </div>

          <div>
            <label
              for="signatoryLine2"
              class="block text-sm font-medium text-neutral-300 mb-2"
            >
              Signatory Line 2
            </label>
            <input
              id="signatoryLine2"
              type="text"
              bind:value={config.signatoryLine2}
              placeholder="Authorized Signatory"
              class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="flex gap-3">
      <button
        type="submit"
        disabled={loading}
        class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Saving..." : "Save Configuration"}
      </button>
    </div>
  </form>
</div>
