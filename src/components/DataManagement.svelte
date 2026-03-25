<script lang="ts">
  import { session } from "../lib/stores/session";
  import BackupUtility from "./datamanagement/BackupUtility.svelte";
  import DataFreezing from "./datamanagement/DataFreezing.svelte";
  import Housekeeping from "./datamanagement/Housekeeping.svelte";

  type DMView = "BACKUP" | "RESTORE" | "FREEZING" | "HOUSEKEEPING";
  let currentView: DMView = $state("BACKUP");
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
      Data Management
    </h2>
    <div class="space-y-0.5">
      <button
        onclick={() => (currentView = "BACKUP")}
        class="sidebar-item {currentView === 'BACKUP' ? 'active' : ''}"
      >
        Backup Data
      </button>
      <button
        onclick={() => (currentView = "RESTORE")}
        class="sidebar-item {currentView === 'RESTORE' ? 'active' : ''}"
      >
        Restore Data
      </button>
      <button
        onclick={() => (currentView = "FREEZING")}
        class="sidebar-item {currentView === 'FREEZING' ? 'active' : ''}"
      >
        Data Freezing
      </button>
      <button
        onclick={() => (currentView = "HOUSEKEEPING")}
        class="sidebar-item {currentView === 'HOUSEKEEPING' ? 'active' : ''}"
      >
        Housekeeping
      </button>
    </div>
  </div>

  <div class="flex-1 overflow-auto">
    {#if currentView === "BACKUP"}<BackupUtility {companyId} />{/if}
    {#if currentView === "RESTORE"}<div class="p-8">
        <h1 class="text-2xl font-bold text-white mb-2">Restore Data</h1>
        <p class="text-neutral-500">Restore functionality coming soon...</p>
      </div>{/if}
    {#if currentView === "FREEZING"}<DataFreezing {companyId} />{/if}
    {#if currentView === "HOUSEKEEPING"}<Housekeeping {companyId} />{/if}
  </div>
</div>
