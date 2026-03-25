<script lang="ts">
  import { mastersService } from "../../lib/services/mastersService";
  import { companyService } from "../../lib/services/companyService";
  import type { ItemGroup } from "../../types";
  import { onMount } from "svelte";
  import Input from "../Input.svelte";

  let { companyId }: { companyId: number } = $props();

  let groups: ItemGroup[] = $state([]);
  let loading = $state(false);
  let error = $state("");
  let showForm = $state(false);

  let formData = $state({
    name: "",
    parentGroupId: null as number | null,
  });

  const loadGroups = async () => {
    loading = true;
    error = "";
    try {
      await companyService.initialize();
      groups = await mastersService.getItemGroups(companyId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load groups";
      console.error("Error:", err);
    } finally {
      loading = false;
    }
  };

  const handleSubmit = async () => {
    loading = true;
    error = "";
    try {
      await companyService.initialize();
      await mastersService.createItemGroup({
        companyId,
        name: formData.name,
        alias: null,
        printName: null,
        description: null,
        parentGroupId: formData.parentGroupId,
        sequenceNo: groups.length + 1,
      });
      formData = { name: "", parentGroupId: null };
      showForm = false;
      await loadGroups();
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to create group";
    } finally {
      loading = false;
    }
  };

  onMount(loadGroups);
</script>

<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Item Groups</h1>
    <button
      onclick={() => (showForm = !showForm)}
      class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
    >
      {showForm ? "Cancel" : "New Group"}
    </button>
  </div>

  {#if error}
    <div class="bg-red-900 text-red-100 p-4 rounded mb-4">{error}</div>
  {/if}

  {#if showForm}
    <div
      class="bg-neutral-800 border border-gray-600 rounded p-4 mb-6 max-w-md"
    >
      <h3 class="font-bold mb-4">Create Item Group</h3>
      <div class="space-y-4">
        <Input
          name="name"
          label="Group Name"
          type="text"
          bind:value={formData.name}
          required
        />

        <div>
          <label for="parentId" class="block text-sm font-medium mb-1">
            Parent Group (Optional)
          </label>
          <select
            id="parentId"
            bind:value={formData.parentGroupId}
            class="w-full border border-gray-400 rounded p-2 bg-neutral-800"
          >
            <option value={null}>None</option>
            {#each groups as group}
              <option value={group.id}>{group.name}</option>
            {/each}
          </select>
        </div>

        <button
          onclick={handleSubmit}
          disabled={!formData.name || loading}
          class="w-full p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded"
        >
          {loading ? "Creating..." : "Create Group"}
        </button>
      </div>
    </div>
  {/if}

  {#if loading && !showForm}
    <p class="text-gray-400">Loading groups...</p>
  {:else if groups.length === 0}
    <p class="text-gray-400">No item groups found.</p>
  {:else}
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-gray-600">
            <th class="text-left p-3">Name</th>
            <th class="text-left p-3">Parent Group</th>
            <th class="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each groups as group (group.id)}
            {@const parentGroup = group.parentGroupId
              ? groups.find((g) => g.id === group.parentGroupId)
              : null}
            <tr class="border-b border-gray-700 hover:bg-neutral-800">
              <td class="p-3">{group.name}</td>
              <td class="p-3 text-sm">{parentGroup?.name || "-"}</td>
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
