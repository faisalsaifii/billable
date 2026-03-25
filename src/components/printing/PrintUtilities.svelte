<script lang="ts">
  import { session } from "../../lib/stores/session";
  import { voucherService } from "../../lib/services/voucherService";
  import { companyService } from "../../lib/services/companyService";
  import Button from "../Button.svelte";
  import type { VoucherType, Voucher } from "../../types";
  import InvoicePreview from "./InvoicePreview.svelte";

  let companyId = $state(0);
  let loading = $state(false);
  let error = $state("");
  let vouchers = $state<Voucher[]>([]);
  let showPreview = $state(false);
  let selectedVoucher = $state<Voucher | null>(null);

  const inventoryVoucherTypes: VoucherType[] = [
    "Sales",
    "Sales Return",
    "Purchase",
    "Purchase Return",
  ];

  const accountVoucherTypes: VoucherType[] = [
    "Payment",
    "Receipt",
    "Journal",
    "Contra",
    "Debit Note",
    "Credit Note",
  ];

  let filters = $state({
    voucherType: "Sales" as VoucherType,
    printBasis: "Date-Wise" as "Date-Wise" | "Voucher No.-Wise",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    startVchNo: "",
    endVchNo: "",
    copies: 1,
  });

  $effect(() => {
    const unsub = session.subscribe((s) => {
      if (s.companyId) {
        companyId = s.companyId;
      }
    });
    return unsub;
  });

  async function searchVouchers() {
    if (!companyId) return;

    try {
      loading = true;
      error = "";
      vouchers = [];

      if (filters.printBasis === "Date-Wise") {
        const allVouchers = await voucherService.getVouchers(
          companyId,
          filters.voucherType,
          filters.startDate,
          filters.endDate
        );
        vouchers = allVouchers;
      } else {
        // Voucher No.-Wise would need a different query
        // For now, we'll get all vouchers and filter client-side
        const allVouchers = await voucherService.getVouchers(
          companyId,
          filters.voucherType,
          filters.startDate,
          filters.endDate
        );
        vouchers = allVouchers.filter(
          (v) => v.vchNo >= filters.startVchNo && v.vchNo <= filters.endVchNo
        );
      }
    } catch (err) {
      console.error("Error searching vouchers:", err);
      error = err instanceof Error ? err.message : "Failed to search vouchers";
    } finally {
      loading = false;
    }
  }

  function previewVoucher(voucher: Voucher) {
    selectedVoucher = voucher;
    showPreview = true;
  }

  function closePreview() {
    showPreview = false;
    selectedVoucher = null;
  }

  function printAll() {
    if (vouchers.length === 0) return;
    // For now, open print dialog
    window.print();
  }
</script>

<div class="p-8 max-w-6xl mx-auto">
  <h1 class="text-2xl font-bold text-white mb-2">Print Utilities</h1>
  <p class="text-neutral-400 text-sm mb-6">
    Bulk print formatted invoices by date range or voucher number range
  </p>

  {#if error}
    <div
      class="bg-red-900/30 text-red-300 p-4 rounded-lg mb-6 border border-red-800/50"
    >
      {error}
    </div>
  {/if}

  <!-- Filters -->
  <div class="card-elevated mb-6">
    <h2 class="section-title">Print Filters</h2>
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            for="voucherType"
            class="block text-sm font-medium text-neutral-300 mb-2"
          >
            Voucher Type
          </label>
          <select
            id="voucherType"
            bind:value={filters.voucherType}
            class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500"
          >
            <optgroup label="Inventory Vouchers">
              {#each inventoryVoucherTypes as vt}
                <option value={vt}>{vt}</option>
              {/each}
            </optgroup>
            <optgroup label="Account Vouchers">
              {#each accountVoucherTypes as vt}
                <option value={vt}>{vt}</option>
              {/each}
            </optgroup>
          </select>
        </div>

        <div>
          <label
            for="printBasis"
            class="block text-sm font-medium text-neutral-300 mb-2"
          >
            Print Basis
          </label>
          <select
            id="printBasis"
            bind:value={filters.printBasis}
            class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500"
          >
            <option value="Date-Wise">Date-Wise</option>
            <option value="Voucher No.-Wise">Voucher No.-Wise</option>
          </select>
        </div>
      </div>

      {#if filters.printBasis === "Date-Wise"}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              for="startDate"
              class="block text-sm font-medium text-neutral-300 mb-2"
            >
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              bind:value={filters.startDate}
              class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500"
            />
          </div>

          <div>
            <label
              for="endDate"
              class="block text-sm font-medium text-neutral-300 mb-2"
            >
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              bind:value={filters.endDate}
              class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500"
            />
          </div>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              for="startVchNo"
              class="block text-sm font-medium text-neutral-300 mb-2"
            >
              Start Voucher No.
            </label>
            <input
              id="startVchNo"
              type="text"
              bind:value={filters.startVchNo}
              placeholder="e.g., 001"
              class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500"
            />
          </div>

          <div>
            <label
              for="endVchNo"
              class="block text-sm font-medium text-neutral-300 mb-2"
            >
              End Voucher No.
            </label>
            <input
              id="endVchNo"
              type="text"
              bind:value={filters.endVchNo}
              placeholder="e.g., 100"
              class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500"
            />
          </div>
        </div>
      {/if}

      <div class="max-w-xs">
        <label
          for="copies"
          class="block text-sm font-medium text-neutral-300 mb-2"
        >
          Number of Copies
        </label>
        <input
          id="copies"
          type="number"
          step="1"
          min="1"
          max="10"
          bind:value={filters.copies}
          class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500"
        />
      </div>

      <div class="flex gap-3">
        <Button variant="primary" onclick={searchVouchers} disabled={loading}>
          {loading ? "Searching..." : "Search Vouchers"}
        </Button>
      </div>
    </div>
  </div>

  <!-- Results -->
  {#if vouchers.length > 0}
    <div class="card-elevated">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-white">
          Found {vouchers.length} voucher{vouchers.length !== 1 ? "s" : ""}
        </h2>
        <Button variant="primary" onclick={printAll}>
          Print All ({filters.copies}
          {filters.copies === 1 ? "copy" : "copies"})
        </Button>
      </div>

      <div class="overflow-x-auto rounded-lg border border-neutral-800">
        <table class="w-full">
          <thead>
            <tr class="bg-neutral-900">
              <th>Date</th>
              <th>Voucher No.</th>
              <th>Type</th>
              <th>Series</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each vouchers as voucher (voucher.id)}
              <tr>
                <td>{new Date(voucher.date).toLocaleDateString()}</td>
                <td class="font-medium">{voucher.vchNo}</td>
                <td>{voucher.voucherType}</td>
                <td>{voucher.series}</td>
                <td class="text-right font-mono">
                  {voucher.totalAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td>
                  <Button
                    variant="ghost"
                    onclick={() => previewVoucher(voucher)}
                  >
                    Preview
                  </Button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {:else if !loading}
    <div class="card-elevated text-center py-12">
      <p class="text-neutral-500">
        No vouchers found. Use filters above to search.
      </p>
    </div>
  {/if}
</div>

<!-- Print Preview Modal -->
{#if showPreview && selectedVoucher}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    onclick={(e) => {
      if (e.target === e.currentTarget) closePreview();
    }}
  >
    <div
      class="bg-neutral-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
    >
      <div
        class="sticky top-0 bg-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between"
      >
        <h2 class="text-xl font-bold text-white">Print Preview</h2>
        <div class="flex gap-2">
          <Button variant="primary" onclick={() => window.print()}>
            Print
          </Button>
          <Button variant="ghost" onclick={closePreview}>Close</Button>
        </div>
      </div>
      <div class="p-4">
        <InvoicePreview voucher={selectedVoucher} showExportButton={true} />
      </div>
    </div>
  </div>
{/if}
