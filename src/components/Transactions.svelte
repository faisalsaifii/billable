<script lang="ts">
  import { session } from "../lib/stores/session";
  import AccountingVoucherEntry from "./transactions/AccountingVoucherEntry.svelte";
  import InventoryVoucherEntry from "./transactions/InventoryVoucherEntry.svelte";
  import VoucherList from "./transactions/VoucherList.svelte";
  import type { VoucherType, Voucher } from "../types";

  let { transactionType }: { transactionType: VoucherType | null } = $props();

  type TxView = "MENU" | "ADD" | "LIST" | "EDIT";
  let view: TxView = $state("MENU");
  let selectedType: VoucherType | null = $state(null);
  let editingVoucher: Voucher | null = $state(null);

  // When transactionType prop is provided, go directly to list view
  $effect(() => {
    if (transactionType) {
      selectedType = transactionType;
      view = "LIST";
    } else {
      view = "MENU";
      selectedType = null;
    }
  });

  const INVENTORY_TYPES: VoucherType[] = [
    "Sales",
    "Sales Return",
    "Purchase",
    "Purchase Return",
    "Stock Transfer",
  ];
  const ACCOUNTING_TYPES: VoucherType[] = [
    "Payment",
    "Receipt",
    "Journal",
    "Contra",
    "Debit Note",
    "Credit Note",
  ];

  const open = (type: VoucherType, mode: "ADD" | "LIST") => {
    selectedType = type;
    view = mode;
  };

  const openList = (type: VoucherType) => {
    selectedType = type;
    view = "LIST";
  };

  const openAdd = () => {
    view = "ADD";
    editingVoucher = null;
  };

  const openEdit = (voucher: Voucher) => {
    editingVoucher = voucher;
    view = "EDIT";
  };

  const menuItems: { label: string; type: VoucherType }[] = [
    { label: "Sales", type: "Sales" },
    { label: "Sales Return", type: "Sales Return" },
    { label: "Purchase", type: "Purchase" },
    { label: "Purchase Return", type: "Purchase Return" },
    { label: "Payment", type: "Payment" },
    { label: "Receipt", type: "Receipt" },
    { label: "Journal", type: "Journal" },
    { label: "Contra", type: "Contra" },
    { label: "Debit Note", type: "Debit Note" },
    { label: "Credit Note", type: "Credit Note" },
    { label: "Stock Transfer", type: "Stock Transfer" },
    { label: "Forms Received", type: "Forms Received" },
    { label: "Forms Issued", type: "Forms Issued" },
    { label: "VAT Journal", type: "VAT Journal" },
  ];
</script>

<div class="flex h-full">
  <!-- Sidebar - Only show when no specific transaction type is selected from dropdown -->
  {#if !transactionType}
    <div
      class="w-48 bg-neutral-900 border-r border-neutral-800 p-4 overflow-y-auto"
    >
      <h2
        class="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4"
      >
        Transactions
      </h2>
      <button
        onclick={() => {
          view = "MENU";
          selectedType = null;
        }}
        class="w-full text-left px-3 py-2 rounded-lg text-sm mb-3 hover:bg-neutral-800 text-neutral-400 transition-colors duration-150"
        >← Back to Menu</button
      >
      <div class="space-y-2">
        {#each menuItems as item}
          <button
            onclick={() => openList(item.type)}
            class="w-full rounded-lg overflow-hidden border border-neutral-800 hover:border-neutral-700 transition-all {selectedType ===
            item.type
              ? 'border-blue-600/50 bg-neutral-800/50'
              : ''}"
          >
            <p
              class="text-sm font-medium px-3 py-2.5 text-left text-neutral-300 hover:text-white transition-colors"
            >
              {item.label}
            </p>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Main Content -->
  <div class="flex-1 overflow-auto">
    {#if view === "MENU" || !selectedType}
      <div class="p-8">
        <h1 class="text-2xl font-bold mb-2 text-white">Transactions</h1>
        <p class="text-neutral-500">
          Select a transaction type from the sidebar to Add or List vouchers.
        </p>
        <div class="mt-8 grid grid-cols-3 gap-3 max-w-2xl">
          {#each menuItems as item}
            <button
              onclick={() => open(item.type, "ADD")}
              class="text-sm p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-lg text-left transition-colors duration-150"
            >
              <p class="font-medium text-white">{item.label}</p>
              <p class="text-xs text-neutral-500 mt-1">Click to add</p>
            </button>
          {/each}
        </div>
      </div>
    {:else if view === "ADD" && selectedType}
      {#if INVENTORY_TYPES.includes(selectedType)}
        <InventoryVoucherEntry voucherType={selectedType} onSaved={() => {}} />
      {:else if ACCOUNTING_TYPES.includes(selectedType)}
        <AccountingVoucherEntry voucherType={selectedType} onSaved={() => {}} />
      {:else}
        <div class="p-8">
          <h1 class="text-2xl font-bold mb-3 text-white">{selectedType}</h1>
          <p class="text-neutral-500 text-sm">
            Entry form for {selectedType} coming soon.
          </p>
        </div>
      {/if}
    {:else if view === "LIST" && selectedType}
      <div class="p-6">
        <VoucherList
          voucherType={selectedType}
          onAddNew={openAdd}
          onEdit={openEdit}
        />
      </div>
    {:else if view === "EDIT" && selectedType && editingVoucher}
      <div class="p-8">
        <h1 class="text-2xl font-bold mb-3 text-white">Edit {selectedType}</h1>
        <p class="text-amber-400 text-sm mb-4">
          Edit functionality coming soon. Voucher #{editingVoucher.vchNo} ({editingVoucher.date})
        </p>
        <button
          onclick={() => {
            view = "LIST";
            editingVoucher = null;
          }}
          class="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg"
        >
          ← Back to List
        </button>
      </div>
    {/if}
  </div>
</div>
