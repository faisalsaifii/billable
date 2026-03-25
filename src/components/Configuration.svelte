<script lang="ts">
  import { session } from "../lib/stores/session";
  import { configurationService } from "../lib/services/configurationService";
  import { companyService } from "../lib/services/companyService";
  import type { Configuration } from "../types";
  import { onMount } from "svelte";

  type Tab =
    | "General"
    | "Accounts"
    | "Inventory"
    | "Tax"
    | "Hardware"
    | "Warnings";
  let activeTab: Tab = $state("General");
  let config: Configuration | null = $state(null);
  let companyId = $state(0);
  let loading = $state(false);
  let saved = $state(false);

  $effect(() => {
    const unsub = session.subscribe((s) => {
      if (s.companyId) companyId = s.companyId;
    });
    return unsub;
  });

  onMount(async () => {
    if (!companyId) return;
    loading = true;
    await companyService.initialize();
    config = await configurationService.getConfiguration(companyId);
    loading = false;
  });

  const save = async () => {
    if (!config || !companyId) return;
    loading = true;
    await configurationService.updateConfiguration(companyId, config);
    saved = true;
    setTimeout(() => (saved = false), 2000);
    loading = false;
  };

  const tabs: Tab[] = [
    "General",
    "Accounts",
    "Inventory",
    "Tax",
    "Hardware",
    "Warnings",
  ];
</script>

<div class="flex h-full">
  <div
    class="w-48 bg-neutral-900 border-r border-neutral-800 p-4 overflow-y-auto"
  >
    <h2
      class="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4"
    >
      Configuration
    </h2>
    <div class="space-y-0.5">
      {#each tabs as tab}
        <button
          onclick={() => (activeTab = tab)}
          class="sidebar-item {activeTab === tab ? 'active' : ''}"
        >
          {tab}
        </button>
      {/each}
    </div>
  </div>

  <div class="flex-1 p-8 overflow-auto">
    {#if loading}
      <div class="text-neutral-500">Loading configuration...</div>
    {:else if !config}
      <div class="text-red-400">Configuration not found.</div>
    {:else}
      <div class="max-w-3xl">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-2xl font-bold text-white">
              Features & Options – {activeTab}
            </h1>
            <p class="text-neutral-500 text-sm mt-1">
              Configure application settings and behavior
            </p>
          </div>
          <button
            onclick={save}
            disabled={loading}
            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-semibold text-white transition-colors duration-150"
          >
            {saved ? "✓ Saved!" : "Save"}
          </button>
        </div>

        {#if activeTab === "General"}
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium block mb-1">Number Format</label
              >
              <select
                bind:value={config.numberFormat}
                class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors duration-150"
              >
                <option value="Indian">Indian (9,99,99,999.99)</option>
                <option value="International"
                  >International (999,999,999.99)</option
                >
              </select>
            </div>
            <div>
              <label class="text-sm font-medium block mb-1">Date Format</label>
              <select
                bind:value={config.dateFormat}
                class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors duration-150"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-medium block mb-1"
                >Currency Decimal Places</label
              >
              <input
                type="number"
                bind:value={config.currencyDecimalPlaces}
                min="0"
                max="4"
                class="w-32 border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors duration-150"
              />
            </div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={config.skipCurrencySeparator}
                class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
              />
              <span class="text-sm">Skip currency separator (commas)</span>
            </label>
            <div>
              <label class="text-sm font-medium block mb-1"
                >Delete Exported Files on Close</label
              >
              <select
                bind:value={config.deleteExportedFilesOnClose}
                class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors duration-150"
              >
                <option value="Never">Never</option>
                <option value="Ask before Deletion">Ask before Deletion</option>
                <option value="Delete Automatically"
                  >Delete Automatically</option
                >
              </select>
            </div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={config.displayThoughtOfTheDay}
                class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
              />
              <span class="text-sm">Display thought of the day on startup</span>
            </label>
          </div>
        {:else if activeTab === "Accounts"}
          <div class="space-y-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={config.billByBillDetails}
                class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
              />
              <span class="text-sm"
                >Bill-by-Bill Details (track individual bills per party)</span
              >
            </label>
            <label
              class="flex items-center gap-2 cursor-pointer {!config.billByBillDetails
                ? 'opacity-50'
                : ''}"
            >
              <input
                type="checkbox"
                bind:checked={config.billReferenceGrouping}
                disabled={!config.billByBillDetails}
                class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
              />
              <span class="text-sm">Bill Reference Grouping</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={config.postSaleReturnToPurchaseAccount}
                class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
              />
              <span class="text-sm"
                >Post Sale/Purchase Returns to Sale/Purchase Account</span
              >
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={config.doubleEntryPaymentReceipt}
                class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
              />
              <span class="text-sm"
                >Double Entry for Payment/Receipt Vouchers</span
              >
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={config.showAccountBalanceDuringEntry}
                class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
              />
              <span class="text-sm">Show Account Balance During Entry</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={config.bankReconciliation}
                class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
              />
              <span class="text-sm">Bank Reconciliation (track cheques)</span>
            </label>
          </div>
        {:else if activeTab === "Inventory"}
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium block mb-1"
                >Quantity Decimal Places</label
              >
              <input
                type="number"
                bind:value={config.qtyDecimalPlaces}
                min="0"
                max="4"
                class="w-32 border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors duration-150"
              />
            </div>
            <div>
              <label class="text-sm font-medium block mb-1"
                >Stock Valuation Method</label
              >
              <select
                bind:value={config.stockValuationMethod}
                class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors duration-150"
              >
                {#each ["FIFO", "LIFO", "Weighted Average", "Last Purchase", "Average Price", "Self Evaluation"] as m}
                  <option value={m}>{m}</option>
                {/each}
              </select>
            </div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={config.enableMultiGodown}
                class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
              />
              <span class="text-sm">Enable Multi-Godown (Material Centres)</span
              >
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={config.enableBillSundryNarration}
                class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
              />
              <span class="text-sm"
                >Enable Bill Sundry Narration in Vouchers</span
              >
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={config.showItemBalanceDuringEntry}
                class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
              />
              <span class="text-sm">Show Item Stock Balance During Entry</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={config.separateStockUpdationDate}
                class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
              />
              <span class="text-sm">Separate Stock Updation Date</span>
            </label>
          </div>
        {:else if activeTab === "Tax"}
          <div class="space-y-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={config.enableTaxReporting}
                class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
              />
              <span class="text-sm">Enable Tax Reporting</span>
            </label>
            <p class="text-neutral-400 text-sm">
              Tax type and registration numbers are configured at the company
              level (Company → Edit).
            </p>
          </div>
        {:else if activeTab === "Hardware"}
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium block mb-1"
                >Printing Style</label
              >
              <select
                bind:value={config.printingStyle}
                class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors duration-150"
              >
                <option value="Windows">Windows (Graphics)</option>
                <option value="DOS">DOS (Draft)</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium block mb-1"
                  >Page Length (inches)</label
                >
                <input
                  type="number"
                  bind:value={config.pageLength}
                  step="0.5"
                  min="5"
                  max="20"
                  class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors duration-150"
                />
              </div>
              <div>
                <label class="text-sm font-medium block mb-1"
                  >Lines/Page (Normal)</label
                >
                <input
                  type="number"
                  bind:value={config.linesPerPageNormal}
                  min="20"
                  max="100"
                  class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors duration-150"
                />
              </div>
              <div>
                <label class="text-sm font-medium block mb-1"
                  >Lines/Page (Landscape)</label
                >
                <input
                  type="number"
                  bind:value={config.linesPerPageLandscape}
                  min="20"
                  max="100"
                  class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors duration-150"
                />
              </div>
            </div>
            {#if config.printingStyle === "Windows"}
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium block mb-1"
                    >Top Margin (inches)</label
                  >
                  <input
                    type="number"
                    bind:value={config.paperTopMargin}
                    step="0.05"
                    min="0"
                    max="2"
                    class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors duration-150"
                  />
                </div>
                <div>
                  <label class="text-sm font-medium block mb-1"
                    >Left Margin (inches)</label
                  >
                  <input
                    type="number"
                    bind:value={config.paperLeftMargin}
                    step="0.05"
                    min="0"
                    max="2"
                    class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors duration-150"
                  />
                </div>
              </div>
            {/if}
          </div>
        {:else if activeTab === "Warnings"}
          <div class="space-y-6">
            <p class="text-sm text-gray-400">
              Configure what happens when these conditions occur:
            </p>
            {#each [{ label: "Negative Cash Balance", key: "negativeCashAction" }, { label: "Negative Stock", key: "negativeStockAction" }, { label: "Minimum Sale Price Violation", key: "minSalePriceAction" }] as { label, key }}
              <div>
                <p class="text-sm font-medium mb-1">{label}</p>
                <select
                  bind:value={(config as any)[key]}
                  class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors duration-150"
                >
                  <option value="No Action">No Action</option>
                  <option value="Warning Only">Warning Only</option>
                  <option value="Dont Allow">Don't Allow</option>
                </select>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
