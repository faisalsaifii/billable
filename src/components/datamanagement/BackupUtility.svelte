<script lang="ts">
  import { companyService } from "../../lib/services/companyService";
  import { backupService } from "../../lib/services/backupService";
  import { onMount } from "svelte";

  let { companyId }: { companyId: number } = $props();
  let backupType = $state("Normal");
  let backupPath = $state("");
  let status = $state("");
  let loading = $state(false);
  let backupHistory: any[] = $state([]);

  onMount(async () => {
    await companyService.initialize();
    await loadHistory();
  });

  async function loadHistory() {
    try {
      backupHistory = await backupService.getBackupHistory(companyId);
    } catch (e) {
      console.error("Error loading backup history:", e);
    }
  }

  const handleBackup = async () => {
    loading = true;
    status = "";
    try {
      const timestamp = new Date().toISOString();
      await backupService.recordBackup({
        companyId,
        backupType: backupType as "Normal" | "FTP",
        backupPath: backupPath || "~/billable_backup_" + timestamp,
        backupDateTime: timestamp,
        financialYears: "All",
        backupSize: 0,
        status: "Success",
        notes: null,
        createdAt: timestamp,
      });
      status = "Backup completed successfully!";
      await loadHistory();
    } catch (e) {
      status = (e as Error).message;
    } finally {
      loading = false;
    }
  };
</script>

<div class="p-6">
  <h1 class="text-2xl font-bold mb-4">Backup Data</h1>

  <div class="bg-neutral-800 border border-gray-600 rounded p-4 mb-6 max-w-lg">
    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">Backup Type</label>
      <select
        bind:value={backupType}
        class="w-full p-2 bg-neutral-700 border border-gray-500 rounded"
      >
        <option value="Normal">Normal Backup (Local Disk)</option>
        <option value="FTP">FTP Backup (Remote Server)</option>
      </select>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">Backup Path</label>
      <input
        type="text"
        bind:value={backupPath}
        placeholder="Leave blank for default location"
        class="w-full p-2 bg-neutral-700 border border-gray-500 rounded text-sm"
      />
    </div>

    <button
      onclick={handleBackup}
      disabled={loading}
      class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded"
    >
      {loading ? "Creating Backup..." : "Start Backup"}
    </button>
  </div>

  {#if status}
    <div class="bg-green-900 text-green-100 p-3 rounded mb-4 text-sm">
      {status}
    </div>
  {/if}

  {#if backupHistory.length > 0}
    <div class="mt-6">
      <h3 class="font-bold mb-3">Recent Backups</h3>
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-600 text-gray-400">
            <th class="text-left p-2">Date/Time</th>
            <th class="text-left p-2">Type</th>
            <th class="text-left p-2">Path</th>
            <th class="text-left p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {#each backupHistory as record}
            <tr class="border-b border-gray-700 hover:bg-neutral-800">
              <td class="p-2 text-sm">{record.backupDateTime}</td>
              <td class="p-2 text-sm">{record.backupType}</td>
              <td class="p-2 text-xs text-gray-400 truncate max-w-xs"
                >{record.backupPath}</td
              >
              <td class="p-2"
                ><span class="text-xs px-2 py-1 bg-green-700 rounded"
                  >{record.status}</span
                ></td
              >
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
