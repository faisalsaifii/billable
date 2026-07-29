<script lang="ts">
  import { companyService } from "../lib/services/companyService";
  import { session } from "../lib/stores/session";
  import type { Company } from "../types";
  import LoginModal from "./LoginModal.svelte";
  import EditCompany from "./EditCompany.svelte";
  import DeleteCompanyModal from "./DeleteCompanyModal.svelte";
  import { onMount } from "svelte";

  let companies: Company[] = $state([]);
  let loading = $state(false);
  let error = $state("");
  let selectedCompany: Company | null = $state(null);
  let showLoginModal = $state(false);
  let showEditModal = $state(false);
  let showDeleteModal = $state(false);

  const loadCompanies = async () => {
    loading = true;
    error = "";
    try {
      await companyService.initialize();
      companies = await companyService.getCompanies();
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load companies";
      console.error("Error:", err);
    } finally {
      loading = false;
    }
  };

  onMount(loadCompanies);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleOpenCompany = (company: Company) => {
    selectedCompany = company;
    showLoginModal = true;
  };

  const handleEditCompany = (company: Company) => {
    selectedCompany = company;
    showEditModal = true;
  };

  const handleDeleteCompany = (company: Company) => {
    selectedCompany = company;
    showDeleteModal = true;
  };

  const handleLoginSuccess = (event: CustomEvent<{ username: string }>) => {
    if (selectedCompany) {
      session.openCompany(selectedCompany, event.detail.username);
      showLoginModal = false;
      selectedCompany = null;
    }
  };

  const handleLoginCancel = () => {
    showLoginModal = false;
    selectedCompany = null;
  };

  const handleEditSuccess = (event: Event) => {
    showEditModal = false;
    loadCompanies();
  };

  const handleEditCancel = () => {
    showEditModal = false;
    selectedCompany = null;
  };

  const handleDeleteSuccess = (event: Event) => {
    showDeleteModal = false;
    loadCompanies();
  };

  const handleDeleteCancel = () => {
    showDeleteModal = false;
    selectedCompany = null;
  };
</script>

<div class="p-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="font-bold text-2xl text-white">Companies</h1>
    <button
      onclick={loadCompanies}
      class="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-lg text-sm text-neutral-300 transition-colors duration-150"
    >
      Refresh
    </button>
  </div>

  {#if error}
    <div
      class="bg-red-900/30 text-red-300 p-4 rounded-lg mb-4 border border-red-800/50"
    >
      {error}
    </div>
  {/if}

  {#if loading}
    <p class="text-neutral-500">Loading companies...</p>
  {:else if companies.length === 0}
    <div class="text-center py-12">
      <p class="text-neutral-500 mb-2">No companies found</p>
      <p class="text-neutral-600 text-sm">Create one to get started</p>
    </div>
  {:else}
    <div class="overflow-x-auto rounded-lg border border-neutral-800">
      <table class="w-full" role="table" aria-label="Companies list">
        <thead>
          <tr class="bg-neutral-900" role="row">
            <th role="columnheader">Name</th>
            <th role="columnheader">Print Name</th>
            <th role="columnheader">Country</th>
            <th role="columnheader">Currency</th>
            <th role="columnheader">FY Start</th>
            <th role="columnheader">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each companies as company, index (company.id)}
            <tr data-keyboard-nav-item tabindex="0" role="row">
              <td class="font-medium" role="cell">{company.name}</td>
              <td class="text-neutral-400" role="cell">{company.printName}</td>
              <td role="cell">{company.country}</td>
              <td role="cell"
                >{company.currencySymbol} {company.currencyString}</td
              >
              <td role="cell">{formatDate(company.fyBeginningFrom)}</td>
              <td role="cell">
                <div class="flex gap-2">
                  <button
                    onclick={() => handleOpenCompany(company)}
                    class="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-md font-medium cursor-pointer transition-colors duration-150"
                    aria-label="Open {company.name}"
                  >
                    Open
                  </button>
                  <button
                    onclick={() => handleEditCompany(company)}
                    class="px-2.5 py-1 bg-neutral-700 hover:bg-neutral-600 text-white text-xs rounded-md font-medium cursor-pointer transition-colors duration-150"
                    aria-label="Edit {company.name}"
                  >
                    Edit
                  </button>
                  <button
                    onclick={() => handleDeleteCompany(company)}
                    class="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 text-xs rounded-md font-medium cursor-pointer transition-colors duration-150"
                    aria-label="Delete {company.name}"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

{#if showLoginModal && selectedCompany}
  <LoginModal
    company={selectedCompany}
    on:loggedin={handleLoginSuccess}
    on:cancel={handleLoginCancel}
  />
{/if}

{#if showEditModal && selectedCompany}
  <EditCompany
    company={selectedCompany}
    on:updated={handleEditSuccess}
    on:cancel={handleEditCancel}
  />
{/if}

{#if showDeleteModal && selectedCompany}
  <DeleteCompanyModal
    company={selectedCompany}
    on:deleted={handleDeleteSuccess}
    on:cancel={handleDeleteCancel}
  />
{/if}
