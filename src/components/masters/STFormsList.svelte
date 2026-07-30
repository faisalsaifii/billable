<script lang="ts">
  import { mastersService } from "../../lib/services/mastersService";
  import { companyService } from "../../lib/services/companyService";
  import type { STForm } from "../../types";
  import { onMount } from "svelte";
  import Input from "../Input.svelte";

  let { companyId }: { companyId: number } = $props();
  let stForms: STForm[] = $state([]);
  let loading = $state(false);
  let error = $state("");
  let showForm = $state(false);
  let formData = $state({
    name: "",
    registrationType: "Local" as "Local" | "Central",
  });

  const load = async () => {
    loading = true;
    error = "";
    try {
      await companyService.initialize();
      stForms = await mastersService.getSTForms(companyId);
    } catch (e) {
      error = e instanceof Error ? e.message : "Error";
    } finally {
      loading = false;
    }
  };

  const handleSubmit = async () => {
    loading = true;
    error = "";
    try {
      await mastersService.createSTForm({
        companyId,
        name: formData.name,
        registrationType: formData.registrationType,
        description: null,
      });
      formData = { name: "", registrationType: "Local" };
      showForm = false;
      await load();
    } catch (e) {
      error = e instanceof Error ? e.message : "Error";
    } finally {
      loading = false;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this ST Form?")) return;
    await mastersService.deleteSTForm(id);
    await load();
  };

  onMount(load);
</script>

<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">ST Forms (Sales Tax Declaration)</h1>
    <button
      onclick={() => (showForm = !showForm)}
      class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
    >
      {showForm ? "Cancel" : "New ST Form"}
    </button>
  </div>
  {#if error}<div class="bg-red-900 text-red-100 p-3 rounded mb-4">
      {error}
    </div>{/if}
  {#if showForm}
    <div
      class="bg-neutral-800 border border-gray-600 rounded p-4 mb-6 max-w-lg"
    >
      <div class="space-y-3">
        <Input
          name="name"
          label="Form Name (e.g. Form C, Form H)"
          type="text"
          bind:value={formData.name}
          required
        />
        <div>
          <label for="registration-type" class="text-sm font-medium block mb-1"
            >Registration Type</label
          >
          <select
            id="registration-type"
            bind:value={formData.registrationType}
            class="w-full p-2 bg-neutral-700 border border-gray-500 rounded"
          >
            <option value="Local">Local</option>
            <option value="Central">Central</option>
          </select>
        </div>
        <button
          onclick={handleSubmit}
          disabled={!formData.name || loading}
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded w-full"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  {/if}
  {#if stForms.length === 0 && !loading}
    <p class="text-gray-400 text-sm">No ST Forms defined.</p>
  {:else}
    <table class="w-full text-sm">
      <thead
        ><tr class="border-b border-gray-600">
          <th class="text-left p-3">Form Name</th>
          <th class="text-left p-3">Type</th>
          <th class="p-3">Actions</th>
        </tr></thead
      >
      <tbody>
        {#each stForms as f (f.id)}
          <tr class="border-b border-gray-700 hover:bg-neutral-800">
            <td class="p-3">{f.name}</td>
            <td class="p-3 text-sm">{f.registrationType}</td>
            <td class="p-3"
              ><button
                onclick={() => handleDelete(f.id)}
                class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                >Delete</button
              ></td
            >
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
