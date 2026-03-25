<script lang="ts">
  let companyId = $props();
  let status = $state("");
  let loading = $state(false);

  const handleRebuild = async () => {
    loading = true; status = "";
    try {
      status = "Rebuilding database... (This may take a moment)";
      // Simulated rebuild
      await new Promise(r => setTimeout(r, 2000));
      status = "Database rebuild completed successfully!";
    } catch (e) { status = (e as Error).message; }
    finally { loading = false; }
  };

  const handleRewriteBooks = async () => {
    loading = true; status = "";
    try {
      status = "Rewriting books... (This may take a moment)";
      await new Promise(r => setTimeout(r, 2000));
      status = "Books rewritten successfully!";
    } catch (e) { status = (e as Error).message; }
    finally { loading = false; }
  };
</script>

<div class="p-6 max-w-lg">
  <h1 class="text-2xl font-bold mb-4">Housekeeping</h1>

  <div class="space-y-4">
    <div class="bg-neutral-800 border border-gray-600 rounded p-4">
      <h3 class="font-bold mb-2">Rebuild Databases</h3>
      <p class="text-gray-400 text-sm mb-4">Re-index corrupted database files and compact unused space. Always take a backup first!</p>
      <button onclick={handleRebuild} disabled={loading}
        class="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded">
        {loading ? "Processing..." : "Rebuild Now"}
      </button>
    </div>

    <div class="bg-neutral-800 border border-gray-600 rounded p-4">
      <h3 class="font-bold mb-2">Rewrite Books</h3>
      <p class="text-gray-400 text-sm mb-4">Re-post all vouchers to books of account. Use after configuration changes.</p>
      <button onclick={handleRewriteBooks} disabled={loading}
        class="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded">
        {loading ? "Processing..." : "Rewrite Now"}
      </button>
    </div>
  </div>

  {#if status}
    <div class="mt-4 p-3 bg-green-900 text-green-100 rounded text-sm">{status}</div>
  {/if}
</div>
