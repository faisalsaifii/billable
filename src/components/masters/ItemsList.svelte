<script lang="ts">
  import { mastersService } from "../../lib/services/mastersService";
  import { companyService } from "../../lib/services/companyService";
  import type { Item, ItemGroup, Unit } from "../../types";
  import { onMount } from "svelte";
  import Input from "../Input.svelte";

  let { companyId }: { companyId: number } = $props();

  let items: Item[] = $state([]);
  let groups: ItemGroup[] = $state([]);
  let units: Unit[] = $state([]);
  let loading = $state(false);
  let error = $state("");
  let showForm = $state(false);

  let formData = $state({
    groupId: 0,
    name: "",
    hsn: "",
    gstRate: 0,
    mainUnitId: 0,
  });

  const loadData = async () => {
    loading = true;
    error = "";
    try {
      await companyService.initialize();
      [items, groups, units] = await Promise.all([
        mastersService.getItems(companyId),
        mastersService.getItemGroups(companyId),
        mastersService.getUnits(companyId),
      ]);
      if (groups.length > 0 && formData.groupId === 0) {
        formData.groupId = groups[0].id;
      }
      if (units.length > 0 && formData.mainUnitId === 0) {
        formData.mainUnitId = units[0].id;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load items";
      console.error("Error:", err);
    } finally {
      loading = false;
    }
  };

  const handleSubmit = async () => {
    loading = true;
    error = "";
    try {
      if (formData.groupId === 0) {
        throw new Error("Please select an item group");
      }

      await companyService.initialize();
      await mastersService.createItem({
        companyId,
        groupId: formData.groupId,
        name: formData.name,
        alias: null,
        printName: null,
        description: null,
        mainUnitId: formData.mainUnitId,
        subUnitId: null,
        conversionFactor: 1,
        openingStock: 0,
        openingStockRate: 0,
        mrp: 0,
        salePrice: 0,
        purchasePrice: 0,
        minSalePrice: 0,
        reorderLevel: 0,
        hsn: formData.hsn,
        gstRate: formData.gstRate,
        active: true,
      });
      formData = {
        groupId: groups[0]?.id || 0,
        name: "",
        hsn: "",
        gstRate: 0,
        mainUnitId: units[0]?.id || 0,
      };
      showForm = false;
      await loadData();
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to create item";
    } finally {
      loading = false;
    }
  };

  onMount(loadData);
</script>

<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Items</h1>
    <button
      onclick={() => (showForm = !showForm)}
      class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
    >
      {showForm ? "Cancel" : "New Item"}
    </button>
  </div>

  {#if error}
    <div class="bg-red-900 text-red-100 p-4 rounded mb-4">{error}</div>
  {/if}

  {#if showForm}
    <div
      class="bg-neutral-800 border border-gray-600 rounded p-4 mb-6 max-w-md"
    >
      <h3 class="font-bold mb-4">Create Item</h3>
      <div class="space-y-4">
        <div>
          <label for="groupId" class="block text-sm font-medium mb-1">
            Item Group
          </label>
          <select
            id="groupId"
            bind:value={formData.groupId}
            class="w-full border border-gray-400 rounded p-2 bg-neutral-800"
          >
            {#each groups as group}
              <option value={group.id}>{group.name}</option>
            {/each}
          </select>
        </div>

        <Input
          name="name"
          label="Item Name"
          type="text"
          bind:value={formData.name}
          required
        />

        <div>
          <label for="mainUnitId" class="block text-sm font-medium mb-1">
            Unit
          </label>
          <select
            id="mainUnitId"
            bind:value={formData.mainUnitId}
            class="w-full border border-gray-400 rounded p-2 bg-neutral-800"
          >
            {#each units as unit}
              <option value={unit.id}>{unit.name}</option>
            {/each}
          </select>
        </div>

        <Input
          name="hsn"
          label="HSN Code"
          type="text"
          bind:value={formData.hsn}
          placeholder="Optional"
        />

        <Input
          name="gstRate"
          label="GST Rate (%)"
          type="number"
          step="0.01"
          bind:value={formData.gstRate}
        />

        <button
          onclick={handleSubmit}
          disabled={!formData.name ||
            formData.groupId === 0 ||
            formData.mainUnitId === 0 ||
            loading}
          class="w-full p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded"
        >
          {loading ? "Creating..." : "Create Item"}
        </button>
      </div>
    </div>
  {/if}

  {#if loading && !showForm}
    <p class="text-gray-400">Loading items...</p>
  {:else if items.length === 0}
    <p class="text-gray-400">No items found.</p>
  {:else}
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-gray-600">
            <th class="text-left p-3">Name</th>
            <th class="text-left p-3">Group</th>
            <th class="text-left p-3">Unit</th>
            <th class="text-left p-3">HSN Code</th>
            <th class="text-left p-3">GST Rate</th>
            <th class="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each items as item (item.id)}
            {@const group = groups.find((g) => g.id === item.groupId)}
            {@const unit = units.find((u) => u.id === item.mainUnitId)}
            <tr class="border-b border-gray-700 hover:bg-neutral-800">
              <td class="p-3">{item.name}</td>
              <td class="p-3 text-sm">{group?.name || "Unknown"}</td>
              <td class="p-3 text-sm">{unit?.name || "-"}</td>
              <td class="p-3 text-sm">{item.hsn || "-"}</td>
              <td class="p-3 text-sm">{item.gstRate}%</td>
              <td class="p-3">
                <button
                  class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
