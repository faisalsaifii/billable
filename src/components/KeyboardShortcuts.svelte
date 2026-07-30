<script lang="ts">
  interface ShortcutGroup {
    category: string;
    shortcuts: { key: string; action: string }[];
  }

  let { show = $bindable(false) } = $props<{ show?: boolean }>();

  const shortcutGroups: ShortcutGroup[] = [
    {
      category: "General",
      shortcuts: [
        { key: "F1", action: "Show Keyboard Shortcuts Help" },
        { key: "F2", action: "Save Master / Voucher" },
        { key: "F3", action: "Add New Master (in voucher field)" },
        { key: "F4", action: "Pick Standard Narration / BOM Help" },
        { key: "F5", action: "List of Records" },
        { key: "F6", action: "Change Voucher Type" },
        { key: "F7 / Alt+R", action: "Repeat last value" },
        { key: "F8", action: "Delete selected Master / Voucher" },
        { key: "F9", action: "Delete selected row in grid" },
        { key: "F10", action: "Calculator" },
        { key: "F11", action: "Pick data from Orders" },
      ],
    },
    {
      category: "Masters",
      shortcuts: [
        { key: "Alt/Ctrl+F1", action: "Add New Account" },
        { key: "Alt/Ctrl+F2", action: "Add Item" },
        { key: "Alt/Ctrl+M", action: "Modify Master" },
      ],
    },
    {
      category: "Vouchers",
      shortcuts: [
        { key: "Alt/Ctrl+F3", action: "Add Voucher" },
        { key: "Alt/Ctrl+F5", action: "Add Payment Voucher" },
        { key: "Alt/Ctrl+F6", action: "Add Receipt Voucher" },
        { key: "Alt/Ctrl+F7", action: "Add Journal Voucher" },
        { key: "Alt/Ctrl+F8", action: "Add Sales Voucher" },
        { key: "Alt/Ctrl+F9", action: "Add Purchase Voucher" },
      ],
    },
    {
      category: "Reports",
      shortcuts: [
        { key: "Alt/Ctrl+A", action: "Accounts Monthly Summary" },
        { key: "Alt/Ctrl+B", action: "Balance Sheet" },
        { key: "Alt/Ctrl+G", action: "Item Ledger" },
        { key: "Alt/Ctrl+I", action: "Item Monthly Summary" },
        { key: "Alt/Ctrl+L", action: "Account Ledger" },
        { key: "Alt/Ctrl+S", action: "Stock Status (Grouped)" },
        { key: "Alt/Ctrl+T", action: "Trial Balance (Grouped)" },
        { key: "Alt+V", action: "VAT Summary" },
      ],
    },
    {
      category: "Utilities",
      shortcuts: [
        { key: "Ctrl+D", action: "Batch Deletion" },
        { key: "Alt/Ctrl+E", action: "Data Export / Import" },
        { key: "Alt/Ctrl+F", action: "Configuration" },
        { key: "Alt/Ctrl+N", action: "Notes Manager" },
        { key: "Alt/Ctrl+Q", action: "Query on Transactions" },
        { key: "Alt/Ctrl+U", action: "Utilities" },
        { key: "Alt+P", action: "Show Pending Batches" },
      ],
    },
  ];

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      show = false;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if show}
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onclick={() => (show = false)}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === "Enter" && (show = false)}
  >
    <div
      class="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <!-- Header -->
      <div
        class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center"
          >
            <span class="text-xl">⌨️</span>
          </div>
          <h2 id="shortcuts-title" class="text-xl font-semibold text-white">
            Keyboard Shortcuts
          </h2>
        </div>
        <button
          onclick={() => (show = false)}
          class="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
          aria-label="Close"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {#each shortcutGroups as group}
            <div class="space-y-3">
              <h3
                class="text-lg font-semibold text-blue-400 border-b border-neutral-800 pb-2"
              >
                {group.category}
              </h3>
              <div class="space-y-2">
                {#each group.shortcuts as shortcut}
                  <div
                    class="flex items-start justify-between gap-4 py-2 px-3 rounded-lg hover:bg-neutral-800/50 transition-colors"
                  >
                    <div class="flex flex-wrap gap-1.5">
                      {#each shortcut.key.split("/") as keyPart}
                        <kbd
                          class="px-2 py-1 text-xs font-mono rounded bg-neutral-800 border border-neutral-700 text-neutral-300 shadow-sm"
                        >
                          {keyPart.trim()}
                        </kbd>
                      {/each}
                    </div>
                    <span class="text-sm text-neutral-400 text-right flex-1">
                      {shortcut.action}
                    </span>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>

        <!-- Footer note -->
        <div
          class="mt-6 pt-4 border-t border-neutral-800 text-center text-sm text-neutral-500"
        >
          <p>
            Press <kbd
              class="px-2 py-1 text-xs font-mono rounded bg-neutral-800 border border-neutral-700 mx-1"
              >F1</kbd
            >
            anytime to view this help, or
            <kbd
              class="px-2 py-1 text-xs font-mono rounded bg-neutral-800 border border-neutral-700 mx-1"
              >Esc</kbd
            > to close
          </p>
        </div>
      </div>
    </div>
  </div>
{/if}
