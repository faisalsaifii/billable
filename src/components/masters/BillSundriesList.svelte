<script lang="ts">
  import { mastersService } from "../../lib/services/mastersService";
  import { companyService } from "../../lib/services/companyService";
  import type { BillSundry } from "../../types";
  import { onMount } from "svelte";
  import Input from "../Input.svelte";

  let { companyId }: { companyId: number } = $props();

  let sundries: BillSundry[] = $state([]);
  let loading = $state(false);
  let error = $state("");
  let showForm = $state(false);

  const APPLICABLE_ON_OPTIONS: BillSundry["applicableOn"][] = [
    "Item Basic Amount",
    "Item MRP",
    "Per Unit",
    "Fixed Amount",
    "Previous Bill Sundry Amount",
  ];

  let formData = $state({
    name: "",
    type: "Additive" as "Additive" | "Subtractive",
    applicableOn: "Item Basic Amount" as BillSundry["applicableOn"],
    rate: 0,
    isPercentage: true,
  });

  const loadSundries = async () => {
    loading = true;
    error = "";
    try {
      await companyService.initialize();
      sundries = await mastersService.getBillSundries(companyId);
    } catch (err) {
      error =
        err instanceof Error ? err.message : "Failed to load bill sundries";
    } finally {
      loading = false;
    }
  };

  const handleSubmit = async () => {
    loading = true;
    error = "";
    try {
      await companyService.initialize();
      await mastersService.createBillSundry({
        companyId,
        name: formData.name,
        alias: null,
        printName: null,
        type: formData.type,
        applicableOn: formData.applicableOn,
        rate: formData.rate,
        isPercentage: formData.isPercentage,
        accountId: null,
        description: null,
        active: true,
      });
      formData = {
        name: "",
        type: "Additive",
        applicableOn: "Item Basic Amount",
        rate: 0,
        isPercentage: true,
      };
      showForm = false;
      await loadSundries();
    } catch (err) {
      error =
        err instanceof Error ? err.message : "Failed to create bill sundry";
    } finally {
      loading = false;
    }
  };

  onMount(loadSundries);
</script>

<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Bill Sundries</h1>
    <button
      onclick={() => (showForm = !showForm)}
      class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
    >
      {showForm ? "Cancel" : "New Sundry"}
    </button>
  </div>
  {#if error}<div class="bg-red-900 text-red-100 p-4 rounded mb-4">
      {error}
    </div>{/if}

  {#if showForm}
    <div
      class="bg-neutral-800 border border-gray-600 rounded p-4 mb-6 max-w-md"
    >
      <h3 class="font-bold mb-4">Create Bill Sundry</h3>
      <div class="space-y-4">
        <Input
          name="name"
          label="Name"
          type="text"
          bind:value={formData.name}
          required
        />
        <div>
          <label for="bs-type" class="block text-sm font-medium mb-1"
            >Type</label
          >
          <select
            id="bs-type"
            bind:value={formData.type}
            class="w-full border border-gray-400 rounded p-2 bg-neutral-800"
          >
            <option value="Additive">Additive (+)</option>
            <option value="Subtractive">Subtractive (-)</option>
          </select>
        </div>
        <div>
          <label for="bs-on" class="block text-sm font-medium mb-1"
            >Applicable On</label
          >
          <select
            id="bs-on"
            bind:value={formData.applicableOn}
            class="w-full border border-gray-400 rounded p-2 bg-neutral-800"
          >
            {#each APPLICABLE_ON_OPTIONS as o}<option value={o}>{o}</option
              >{/each}
          </select>
        </div>
        <Input
          name="rate"
          label="Default Rate"
          type="number"
          step="0.01"
          bind:value={formData.rate}
        />
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" bind:checked={formData.isPercentage} />
          <span class="text-sm">Is Percentage?</span>
        </label>
        <button
          onclick={handleSubmit}
          disabled={!formData.name || loading}
          class="w-full p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded"
        >
          {loading ? "Creating..." : "Create Sundry"}
        </button>
      </div>
    </div>
  {/if}

  {#if loading && !showForm}
    <p class="text-gray-400">Loading...</p>
  {:else if sundries.length === 0}
    <p class="text-gray-400">No bill sundries found.</p>
  {:else}
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-gray-600">
            <th class="text-left p-3">Name</th>
            <th class="text-left p-3">Type</th>
            <th class="text-left p-3">Rate</th>
            <th class="text-left p-3">Applicable On</th>
          </tr>
        </thead>
        <tbody>
          {#each sundries as sundry (sundry.id)}
            <tr class="border-b border-gray-700 hover:bg-neutral-800">
              <td class="p-3">{sundry.name}</td>
              <td class="p-3 text-sm">{sundry.type}</td>
              <td class="p-3 text-sm"
                >{sundry.rate}{sundry.isPercentage ? "%" : ""}</td
              >
              <td class="p-3 text-sm text-gray-400">{sundry.applicableOn}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
