<script lang="ts">
  import { session } from "../lib/stores/session";
  import { onMount } from "svelte";
  import DocumentConfig from "./printing/DocumentConfig.svelte";
  import PrintUtilities from "./printing/PrintUtilities.svelte";

  type PrintingView = "DOCUMENT_CONFIG" | "PRINT_UTILITIES";
  let currentView: PrintingView = $state("DOCUMENT_CONFIG");
  let companyId = $state(0);

  $effect(() => {
    const unsub = session.subscribe((s) => {
      if (s.companyId) companyId = s.companyId;
    });
    return unsub;
  });
</script>

<div class="flex h-full">
  <div
    class="w-48 bg-neutral-900 border-r border-neutral-800 p-4 overflow-y-auto"
  >
    <h2
      class="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4"
    >
      Printing
    </h2>
    <div class="space-y-0.5">
      <button
        onclick={() => (currentView = "DOCUMENT_CONFIG")}
        class="sidebar-item {currentView === 'DOCUMENT_CONFIG' ? 'active' : ''}"
      >
        Document Configuration
      </button>
      <button
        onclick={() => (currentView = "PRINT_UTILITIES")}
        class="sidebar-item {currentView === 'PRINT_UTILITIES' ? 'active' : ''}"
      >
        Print Utilities
      </button>
    </div>
  </div>

  <div class="flex-1 overflow-auto">
    {#if currentView === "DOCUMENT_CONFIG"}
      <DocumentConfig />
    {/if}

    {#if currentView === "PRINT_UTILITIES"}
      <PrintUtilities />
    {/if}
  </div>
</div>
