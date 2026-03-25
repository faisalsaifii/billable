<script lang="ts">
  import { session } from "../lib/stores/session";

  let { onClose }: { onClose?: () => void } = $props();

  let currentCompany = $derived($session?.company);
  let currentUsername = $derived($session?.username);
</script>

{#if currentCompany}
  <div class="p-8 max-w-2xl mx-auto">
    <div
      class="bg-gradient-to-br from-emerald-900/30 to-emerald-900/10 border border-emerald-700/50 rounded-xl p-6 mb-8"
    >
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">
            {currentCompany.name}
          </h1>
          <p class="text-neutral-400 text-sm mt-1">
            {currentCompany.printName}
          </p>
        </div>
        <div class="badge-success badge">Active</div>
      </div>
      <div
        class="flex items-center gap-4 mt-4 pt-4 border-t border-emerald-700/30"
      >
        <div class="text-sm">
          <span class="text-neutral-500">FY:</span>
          <span class="text-white ml-1 font-medium"
            >{new Date(
              currentCompany.fyBeginningFrom
            ).toLocaleDateString()}</span
          >
        </div>
        <div class="text-sm">
          <span class="text-neutral-500">User:</span>
          <span class="text-white ml-1 font-medium">{currentUsername}</span>
        </div>
      </div>
    </div>

    <div class="card-elevated">
      <h2 class="section-title">Company Information</h2>
      <div class="grid grid-cols-2 gap-6">
        <div>
          <p class="text-neutral-500 text-xs uppercase tracking-wide mb-1">
            Country
          </p>
          <p class="font-medium text-white">{currentCompany.country}</p>
        </div>
        <div>
          <p class="text-neutral-500 text-xs uppercase tracking-wide mb-1">
            Currency
          </p>
          <p class="font-medium text-white">
            {currentCompany.currencySymbol}
            {currentCompany.currencyString}
          </p>
        </div>
        <div>
          <p class="text-neutral-500 text-xs uppercase tracking-wide mb-1">
            Books Commencing
          </p>
          <p class="font-medium text-white">
            {new Date(currentCompany.booksCommencingFrom).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p class="text-neutral-500 text-xs uppercase tracking-wide mb-1">
            Tax Status
          </p>
          <p class="font-medium text-white">
            {currentCompany.enableTax
              ? currentCompany.taxType || "Enabled"
              : "Disabled"}
          </p>
        </div>
      </div>
    </div>

    <button
      onclick={onClose}
      class="mt-8 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 rounded-lg font-medium transition-colors duration-150"
    >
      Close Company
    </button>
  </div>
{:else}
  <div class="p-6">
    <p class="text-neutral-500">No company open</p>
  </div>
{/if}
