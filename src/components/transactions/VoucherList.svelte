<script lang="ts">
  import { session } from "../../lib/stores/session";
  import { voucherService } from "../../lib/services/voucherService";
  import { companyService } from "../../lib/services/companyService";
  import InvoicePreview from "../printing/InvoicePreview.svelte";
  import type { Voucher, VoucherType } from "../../types";
  import { onMount } from "svelte";

  let {
    voucherType,
    onAddNew,
    onEdit,
  }: {
    voucherType: VoucherType;
    onAddNew?: () => void;
    onEdit?: (voucher: Voucher) => void;
  } = $props();
  let companyId = $state(0);
  let vouchers: Voucher[] = $state([]);
  let loading = $state(false);
  let error = $state("");
  let fromDate = $state("");
  let toDate = $state("");
  let selectedVoucherForPrint = $state<Voucher | null>(null);

  $effect(() => {
    const unsub = session.subscribe((s) => {
      if (s.companyId) companyId = s.companyId;
    });
    return unsub;
  });

  onMount(load);

  async function load() {
    if (!companyId) return;
    loading = true;
    error = "";
    try {
      await companyService.initialize();
      vouchers = await voucherService.getVouchers(
        companyId,
        voucherType,
        fromDate || undefined,
        toDate || undefined,
      );
    } catch (e) {
      error = e instanceof Error ? e.message : "Error";
    } finally {
      loading = false;
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this voucher? This cannot be undone.")) return;
    await voucherService.deleteVoucher(id);
    await load();
  };

  const handlePrint = (voucher: Voucher) => {
    selectedVoucherForPrint = voucher;
  };

  const handleDirectPrint = (voucher: Voucher) => {
    selectedVoucherForPrint = voucher;
    // Delay to ensure modal is rendered before printing
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const closePrintModal = () => {
    selectedVoucherForPrint = null;
  };
</script>

<div class="p-4">
  <div class="flex justify-between items-start mb-6">
    <h1 class="text-xl font-bold text-white">{voucherType} – List</h1>
    {#if onAddNew}
      <button
        onclick={onAddNew}
        class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <span class="text-lg">+</span>
        <span>Add {voucherType}</span>
      </button>
    {/if}
  </div>

  <div class="flex gap-3 mb-4 items-end">
    <div>
      <label class="text-xs text-gray-400 block mb-1">From Date</label>
      <input
        type="date"
        bind:value={fromDate}
        class="p-1.5 bg-neutral-800 border border-gray-600 rounded text-sm"
      />
    </div>
    <div>
      <label class="text-xs text-gray-400 block mb-1">To Date</label>
      <input
        type="date"
        bind:value={toDate}
        class="p-1.5 bg-neutral-800 border border-gray-600 rounded text-sm"
      />
    </div>
    <button
      onclick={load}
      class="px-3 py-1.5 bg-neutral-600 hover:bg-neutral-500 rounded text-sm"
      >Filter</button
    >
    <button
      onclick={() => {
        fromDate = "";
        toDate = "";
        load();
      }}
      class="px-3 py-1.5 text-gray-400 hover:text-white text-sm">Clear</button
    >
  </div>
  {#if error}<div class="bg-red-900 text-red-100 p-3 rounded mb-4 text-sm">
      {error}
    </div>{/if}
  {#if loading}
    <p class="text-gray-400 text-sm">Loading...</p>
  {:else if vouchers.length === 0}
    <p class="text-gray-400 text-sm">No {voucherType} vouchers found.</p>
  {:else}
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-gray-600 text-gray-400">
          <th class="text-left p-2">Date</th>
          <th class="text-left p-2">Vch No</th>
          <th class="text-left p-2">Series</th>
          <th class="text-right p-2">Amount</th>
          <th class="text-left p-2">Narration</th>
          <th class="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each vouchers as v (v.id)}
          <tr class="border-b border-gray-700 hover:bg-neutral-800">
            <td class="p-2">{v.date}</td>
            <td class="p-2 font-medium">{v.vchNo}</td>
            <td class="p-2 text-gray-400">{v.series}</td>
            <td class="p-2 text-right font-medium"
              >{v.totalAmount.toFixed(2)}</td
            >
            <td class="p-2 text-gray-400 truncate max-w-xs"
              >{v.narration || "-"}</td
            >
            <td class="p-2 text-center">
              <div class="flex gap-2 justify-center">
                {#if onEdit}
                  <button
                    onclick={() => onEdit(v)}
                    class="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded"
                    title="Edit"
                  >
                    Edit
                  </button>
                {/if}
                <button
                  onclick={() => handlePrint(v)}
                  class="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                  title="Preview & Print"
                >
                  Print
                </button>
                <button
                  onclick={() => handleDelete(v.id)}
                  class="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                  title="Delete"
                >
                  Del
                </button>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <p class="text-xs text-gray-400 mt-2">{vouchers.length} entries</p>
  {/if}
</div>

<!-- Print Modal -->
{#if selectedVoucherForPrint}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
    onclick={closePrintModal}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="bg-neutral-900 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Modal Header -->
      <div
        class="flex justify-between items-center p-4 border-b border-gray-700"
      >
        <h2 class="text-xl font-semibold">Print Preview</h2>
        <button
          onclick={closePrintModal}
          class="text-gray-400 hover:text-white text-2xl">&times;</button
        >
      </div>

      <!-- Modal Body with scrolling -->
      <div class="flex-1 overflow-y-auto p-4">
        <InvoicePreview
          voucher={selectedVoucherForPrint}
          showExportButton={true}
        />
      </div>

      <!-- Modal Footer -->
      <div class="flex justify-end gap-3 p-4 border-t border-gray-700">
        <button
          onclick={closePrintModal}
          class="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg"
        >
          Close
        </button>
        <button
          onclick={() => window.print()}
          class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
        >
          Print
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  @media print {
    /* Hide the modal background and wrapper when printing */
    :global(.fixed.inset-0) {
      position: static !important;
      background: white !important;
    }

    :global(.bg-neutral-900) {
      background: white !important;
      box-shadow: none !important;
    }
  }
</style>
