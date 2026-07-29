<script lang="ts">
  import { mastersService } from "../../lib/services/mastersService";
  import { companyService } from "../../lib/services/companyService";
  import type { Account, AccountGroup } from "../../types";
  import { onMount } from "svelte";
  import Input from "../Input.svelte";

  let { companyId }: { companyId: number } = $props();

  let accounts: Account[] = $state([]);
  let groups: AccountGroup[] = $state([]);
  let loading = $state(false);
  let error = $state("");
  let showEditModal = $state(false);
  let editMode = $state(false);
  let editingAccountId = $state<number | null>(null);
  let showViewModal = $state(false);
  let viewingAccount = $state<Account | null>(null);

  let formData = $state({
    groupId: 0,
    name: "",
    alias: "",
    printName: "",
    openingBalance: 0,
    openingBalanceType: "Debit" as "Debit" | "Credit",
    prevYearBalance: 0,
    prevYearBalanceType: "Debit" as "Debit" | "Credit",
    address: "",
    country: "",
    typeOfDealer: "",
    gst: "",
    cnic: "",
    itPan: "",
    email: "",
    mobileNo: "",
    telNo: "",
    contactPerson: "",
    station: "",
    tin: "",
    ward: "",
    whatsappNo: "",
    fax: "",
    transport: "",
  });

  const loadData = async () => {
    loading = true;
    error = "";
    try {
      await companyService.initialize();
      accounts = await mastersService.getAccounts(companyId);
      groups = await mastersService.getAccountGroups(companyId);
      if (groups.length > 0 && formData.groupId === 0) {
        formData.groupId = groups[0].id;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load accounts";
      console.error("Error:", err);
    } finally {
      loading = false;
    }
  };

  const handleView = (account: Account) => {
    viewingAccount = account;
    showViewModal = true;
  };

  const closeViewModal = () => {
    showViewModal = false;
    viewingAccount = null;
  };

  const handleEdit = (account: Account) => {
    editMode = true;
    editingAccountId = account.id;
    formData = {
      groupId: account.groupId,
      name: account.name,
      alias: account.alias || "",
      printName: account.printName || "",
      openingBalance: account.openingBalance,
      openingBalanceType: account.openingBalanceType,
      prevYearBalance: account.prevYearBalance || 0,
      prevYearBalanceType: account.prevYearBalanceType || "Debit",
      address: account.address || "",
      country: account.country || "",
      typeOfDealer: account.typeOfDealer || "",
      gst: account.gst || "",
      cnic: account.cnic || "",
      itPan: account.itPan || "",
      email: account.email || "",
      mobileNo: account.mobileNo || "",
      telNo: account.telNo || "",
      contactPerson: account.contactPerson || "",
      station: account.station || "",
      tin: account.tin || "",
      ward: account.ward || "",
      whatsappNo: account.whatsappNo || "",
      fax: account.fax || "",
      transport: account.transport || "",
    };
    showEditModal = true;
    showViewModal = false;
  };

  const handleCancel = () => {
    showEditModal = false;
    editMode = false;
    editingAccountId = null;
    error = "";
    formData = {
      groupId: groups[0]?.id || 0,
      name: "",
      alias: "",
      printName: "",
      openingBalance: 0,
      openingBalanceType: "Debit",
      prevYearBalance: 0,
      prevYearBalanceType: "Debit",
      address: "",
      country: "",
      typeOfDealer: "",
      gst: "",
      cnic: "",
      itPan: "",
      email: "",
      mobileNo: "",
      telNo: "",
      contactPerson: "",
      station: "",
      tin: "",
      ward: "",
      whatsappNo: "",
      fax: "",
      transport: "",
    };
  };

  const handleSubmit = async () => {
    loading = true;
    error = "";
    try {
      if (formData.groupId === 0) {
        throw new Error("Please select an account group");
      }

      await companyService.initialize();

      if (editMode && editingAccountId) {
        // Update existing account
        await mastersService.updateAccount(editingAccountId, {
          groupId: formData.groupId,
          name: formData.name,
          alias: formData.alias || null,
          printName: formData.printName || null,
          openingBalance: formData.openingBalance,
          openingBalanceType: formData.openingBalanceType,
          prevYearBalance: formData.prevYearBalance,
          prevYearBalanceType: formData.prevYearBalanceType,
          address: formData.address || null,
          country: formData.country || null,
          typeOfDealer: formData.typeOfDealer || null,
          gst: formData.gst || null,
          cnic: formData.cnic || null,
          itPan: formData.itPan || null,
          email: formData.email || null,
          mobileNo: formData.mobileNo || null,
          telNo: formData.telNo || null,
          contactPerson: formData.contactPerson || null,
          station: formData.station || null,
          tin: formData.tin || null,
          ward: formData.ward || null,
          whatsappNo: formData.whatsappNo || null,
          fax: formData.fax || null,
          transport: formData.transport || null,
        });
      } else {
        // Create new account
        await mastersService.createAccount({
          companyId,
          groupId: formData.groupId,
          name: formData.name,
          alias: formData.alias || null,
          printName: formData.printName || null,
          openingBalance: formData.openingBalance,
          openingBalanceType: formData.openingBalanceType,
          prevYearBalance: formData.prevYearBalance,
          prevYearBalanceType: formData.prevYearBalanceType,
          address: formData.address || null,
          country: formData.country || null,
          typeOfDealer: formData.typeOfDealer || null,
          gst: formData.gst || null,
          cnic: formData.cnic || null,
          itPan: formData.itPan || null,
          email: formData.email || null,
          mobileNo: formData.mobileNo || null,
          telNo: formData.telNo || null,
          contactPerson: formData.contactPerson || null,
          station: formData.station || null,
          tin: formData.tin || null,
          ward: formData.ward || null,
          whatsappNo: formData.whatsappNo || null,
          fax: formData.fax || null,
          transport: formData.transport || null,
          maintainBillByBill: false,
          creditDaysForSale: 0,
          creditDaysForPurchase: 0,
          bankAccountNo: null,
          ifscCode: null,
          description: null,
          isPredefined: false,
          active: true,
        });
      }

      handleCancel();
      await loadData();
    } catch (err) {
      error =
        err instanceof Error
          ? err.message
          : `Failed to ${editMode ? "update" : "create"} account`;
    } finally {
      loading = false;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this account?")) return;

    loading = true;
    error = "";
    try {
      await companyService.initialize();
      await mastersService.deleteAccount(id);
      await loadData();
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to delete account";
    } finally {
      loading = false;
    }
  };

  onMount(loadData);
</script>

<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Accounts (Ledgers)</h1>
    <button
      onclick={() => {
        editMode = false;
        editingAccountId = null;
        formData.groupId = groups[0]?.id || 0;
        showEditModal = true;
      }}
      class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
    >
      New Account
    </button>
  </div>

  {#if loading && !showEditModal && !showViewModal}
    <p class="text-gray-400">Loading accounts...</p>
  {:else if accounts.length === 0}
    <p class="text-gray-400">No accounts found.</p>
  {:else}
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-gray-600">
            <th class="text-left p-3">Name</th>
            <th class="text-left p-3">Group</th>
            <th class="text-left p-3">Opening Balance</th>
            <th class="text-left p-3">Type</th>
            <th class="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each accounts as account (account.id)}
            {@const group = groups.find((g) => g.id === account.groupId)}
            <tr class="border-b border-gray-700 hover:bg-neutral-800">
              <td
                class="p-3 cursor-pointer hover:text-blue-400"
                onclick={() => handleView(account)}
              >
                {account.name}
              </td>
              <td class="p-3 text-sm">{group?.name || "Unknown"}</td>
              <td class="p-3 text-sm text-right"
                >{account.openingBalance.toFixed(2)}</td
              >
              <td class="p-3 text-sm">{account.openingBalanceType}</td>
              <td class="p-3">
                <div class="flex gap-2">
                  <button
                    onclick={() => handleEdit(account)}
                    class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    onclick={() => handleDelete(account.id)}
                    class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                    disabled={loading || account.isPredefined}
                    title={account.isPredefined
                      ? "Cannot delete predefined account"
                      : "Delete account"}
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

  <!-- Edit/Create Account Modal -->
  {#if showEditModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onclick={handleCancel}
    >
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="bg-neutral-800 border border-gray-600 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onclick={(e: MouseEvent) => e.stopPropagation()}
      >
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-xl">
            {editMode ? "Edit Account" : "Create Account"}
          </h3>
          <button
            onclick={handleCancel}
            class="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {#if error}
          <div class="bg-red-900 text-red-100 p-4 rounded mb-4">{error}</div>
        {/if}

        <div class="space-y-4">
          <!-- General Info Section -->
          <div class="bg-neutral-700 p-4 rounded">
            <h4 class="font-semibold mb-3">General Info.</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="groupId" class="block text-sm font-medium mb-1">
                  Group
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
                label="Name (Alias)"
                type="text"
                bind:value={formData.name}
                required
              />

              <Input
                name="printName"
                label="Print Name"
                type="text"
                bind:value={formData.printName}
              />

              <Input
                name="alias"
                label="Alias"
                type="text"
                bind:value={formData.alias}
              />
            </div>
          </div>

          <!-- Balance Section -->
          <div class="bg-neutral-700 p-4 rounded">
            <h4 class="font-semibold mb-3">Opening Balances</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex gap-2">
                <div class="flex-1">
                  <Input
                    name="openingBalance"
                    label="Op. Bal."
                    type="number"
                    step="0.01"
                    bind:value={formData.openingBalance}
                  />
                </div>
                <div class="w-32">
                  <label
                    for="balanceType"
                    class="block text-sm font-medium mb-1"
                  >
                    Dr/Cr
                  </label>
                  <select
                    id="balanceType"
                    bind:value={formData.openingBalanceType}
                    class="w-full border border-gray-400 rounded p-2 bg-neutral-800"
                  >
                    <option value="Debit">D</option>
                    <option value="Credit">C</option>
                  </select>
                </div>
              </div>

              <div class="flex gap-2">
                <div class="flex-1">
                  <Input
                    name="prevYearBalance"
                    label="Prev. Year Bal."
                    type="number"
                    step="0.01"
                    bind:value={formData.prevYearBalance}
                  />
                </div>
                <div class="w-32">
                  <label
                    for="prevBalanceType"
                    class="block text-sm font-medium mb-1"
                  >
                    Dr/Cr
                  </label>
                  <select
                    id="prevBalanceType"
                    bind:value={formData.prevYearBalanceType}
                    class="w-full border border-gray-400 rounded p-2 bg-neutral-800"
                  >
                    <option value="Debit">D</option>
                    <option value="Credit">C</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Address Section -->
          <div class="bg-neutral-700 p-4 rounded">
            <h4 class="font-semibold mb-3">Address</h4>
            <div class="grid grid-cols-1 gap-4">
              <div>
                <Input
                  name="address"
                  label="Address"
                  type="text"
                  bind:value={formData.address}
                />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="country"
                  label="Country"
                  type="text"
                  bind:value={formData.country}
                />
                <Input
                  name="typeOfDealer"
                  label="Type of Dealer"
                  type="text"
                  bind:value={formData.typeOfDealer}
                />
              </div>
            </div>
          </div>

          <!-- Tax & Registration Section -->
          <div class="bg-neutral-700 p-4 rounded">
            <h4 class="font-semibold mb-3">Tax & Registration</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                name="gst"
                label="GST"
                type="text"
                bind:value={formData.gst}
              />
              <Input
                name="cnic"
                label="CNIC"
                type="text"
                bind:value={formData.cnic}
              />
              <Input
                name="itPan"
                label="IT PAN"
                type="text"
                bind:value={formData.itPan}
              />
              <Input
                name="tin"
                label="TIN"
                type="text"
                bind:value={formData.tin}
              />
              <Input
                name="ward"
                label="Ward"
                type="text"
                bind:value={formData.ward}
              />
            </div>
          </div>

          <!-- Contact Section -->
          <div class="bg-neutral-700 p-4 rounded">
            <h4 class="font-semibold mb-3">Contact Information</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="email"
                label="E-Mail"
                type="email"
                bind:value={formData.email}
              />
              <Input
                name="mobileNo"
                label="Mobile No."
                type="text"
                bind:value={formData.mobileNo}
              />
              <Input
                name="whatsappNo"
                label="WhatsApp No. (Country code w/o '+' , 0' e.g. 9199XXXXXXXX)"
                type="text"
                bind:value={formData.whatsappNo}
              />
              <Input
                name="telNo"
                label="Tel. No."
                type="text"
                bind:value={formData.telNo}
              />
              <Input
                name="fax"
                label="Fax"
                type="text"
                bind:value={formData.fax}
              />
              <Input
                name="contactPerson"
                label="Contact Person"
                type="text"
                bind:value={formData.contactPerson}
              />
            </div>
          </div>

          <!-- Other Details Section -->
          <div class="bg-neutral-700 p-4 rounded">
            <h4 class="font-semibold mb-3">Other Details</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="station"
                label="Station"
                type="text"
                bind:value={formData.station}
              />
              <Input
                name="transport"
                label="Transport"
                type="text"
                bind:value={formData.transport}
              />
            </div>
          </div>

          <div class="flex gap-4">
            <button
              onclick={handleSubmit}
              disabled={!formData.name || formData.groupId === 0 || loading}
              class="flex-1 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-semibold"
            >
              {loading
                ? editMode
                  ? "Updating..."
                  : "Creating..."
                : editMode
                  ? "Update Account"
                  : "Create Account"}
            </button>
            <button
              onclick={handleCancel}
              type="button"
              disabled={loading}
              class="px-6 p-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white rounded font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- View Account Modal -->
  {#if showViewModal && viewingAccount}
    {@const group = groups.find((g) => g.id === viewingAccount!.groupId)}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onclick={closeViewModal}
    >
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="bg-neutral-800 border border-gray-600 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onclick={(e: MouseEvent) => e.stopPropagation()}
      >
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">Account Details</h2>
          <button
            onclick={closeViewModal}
            class="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div class="space-y-6">
          <!-- General Info Section -->
          <div class="bg-neutral-700 p-4 rounded">
            <h3 class="font-semibold mb-4 text-lg">General Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-400">Name</p>
                <p class="font-medium">{viewingAccount.name}</p>
              </div>
              <div>
                <p class="text-sm text-gray-400">Group</p>
                <p class="font-medium">{group?.name || "Unknown"}</p>
              </div>
              {#if viewingAccount.alias}
                <div>
                  <p class="text-sm text-gray-400">Alias</p>
                  <p class="font-medium">{viewingAccount.alias}</p>
                </div>
              {/if}
              {#if viewingAccount.printName}
                <div>
                  <p class="text-sm text-gray-400">Print Name</p>
                  <p class="font-medium">{viewingAccount.printName}</p>
                </div>
              {/if}
            </div>
          </div>

          <!-- Balance Section -->
          <div class="bg-neutral-700 p-4 rounded">
            <h3 class="font-semibold mb-4 text-lg">Balance Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-400">Opening Balance</p>
                <p class="font-medium">
                  {viewingAccount.openingBalance.toFixed(2)}
                  <span class="text-sm text-gray-400 ml-1"
                    >({viewingAccount.openingBalanceType})</span
                  >
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-400">Previous Year Balance</p>
                <p class="font-medium">
                  {(viewingAccount.prevYearBalance || 0).toFixed(2)}
                  <span class="text-sm text-gray-400 ml-1"
                    >({viewingAccount.prevYearBalanceType || "Debit"})</span
                  >
                </p>
              </div>
            </div>
          </div>

          <!-- Address Section -->
          {#if viewingAccount.address || viewingAccount.country || viewingAccount.typeOfDealer}
            <div class="bg-neutral-700 p-4 rounded">
              <h3 class="font-semibold mb-4 text-lg">Address</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#if viewingAccount.address}
                  <div class="md:col-span-2">
                    <p class="text-sm text-gray-400">Address</p>
                    <p class="font-medium">{viewingAccount.address}</p>
                  </div>
                {/if}
                {#if viewingAccount.country}
                  <div>
                    <p class="text-sm text-gray-400">Country</p>
                    <p class="font-medium">{viewingAccount.country}</p>
                  </div>
                {/if}
                {#if viewingAccount.typeOfDealer}
                  <div>
                    <p class="text-sm text-gray-400">Type of Dealer</p>
                    <p class="font-medium">{viewingAccount.typeOfDealer}</p>
                  </div>
                {/if}
              </div>
            </div>
          {/if}

          <!-- Tax & Registration Section -->
          {#if viewingAccount.gst || viewingAccount.cnic || viewingAccount.itPan || viewingAccount.tin || viewingAccount.ward}
            <div class="bg-neutral-700 p-4 rounded">
              <h3 class="font-semibold mb-4 text-lg">Tax & Registration</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                {#if viewingAccount.gst}
                  <div>
                    <p class="text-sm text-gray-400">GST</p>
                    <p class="font-medium">{viewingAccount.gst}</p>
                  </div>
                {/if}
                {#if viewingAccount.cnic}
                  <div>
                    <p class="text-sm text-gray-400">CNIC</p>
                    <p class="font-medium">{viewingAccount.cnic}</p>
                  </div>
                {/if}
                {#if viewingAccount.itPan}
                  <div>
                    <p class="text-sm text-gray-400">IT PAN</p>
                    <p class="font-medium">{viewingAccount.itPan}</p>
                  </div>
                {/if}
                {#if viewingAccount.tin}
                  <div>
                    <p class="text-sm text-gray-400">TIN</p>
                    <p class="font-medium">{viewingAccount.tin}</p>
                  </div>
                {/if}
                {#if viewingAccount.ward}
                  <div>
                    <p class="text-sm text-gray-400">Ward</p>
                    <p class="font-medium">{viewingAccount.ward}</p>
                  </div>
                {/if}
              </div>
            </div>
          {/if}

          <!-- Contact Section -->
          {#if viewingAccount.email || viewingAccount.mobileNo || viewingAccount.telNo || viewingAccount.whatsappNo || viewingAccount.fax || viewingAccount.contactPerson}
            <div class="bg-neutral-700 p-4 rounded">
              <h3 class="font-semibold mb-4 text-lg">Contact Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#if viewingAccount.email}
                  <div>
                    <p class="text-sm text-gray-400">Email</p>
                    <p class="font-medium">{viewingAccount.email}</p>
                  </div>
                {/if}
                {#if viewingAccount.mobileNo}
                  <div>
                    <p class="text-sm text-gray-400">Mobile No.</p>
                    <p class="font-medium">{viewingAccount.mobileNo}</p>
                  </div>
                {/if}
                {#if viewingAccount.whatsappNo}
                  <div>
                    <p class="text-sm text-gray-400">WhatsApp No.</p>
                    <p class="font-medium">{viewingAccount.whatsappNo}</p>
                  </div>
                {/if}
                {#if viewingAccount.telNo}
                  <div>
                    <p class="text-sm text-gray-400">Telephone</p>
                    <p class="font-medium">{viewingAccount.telNo}</p>
                  </div>
                {/if}
                {#if viewingAccount.fax}
                  <div>
                    <p class="text-sm text-gray-400">Fax</p>
                    <p class="font-medium">{viewingAccount.fax}</p>
                  </div>
                {/if}
                {#if viewingAccount.contactPerson}
                  <div>
                    <p class="text-sm text-gray-400">Contact Person</p>
                    <p class="font-medium">{viewingAccount.contactPerson}</p>
                  </div>
                {/if}
              </div>
            </div>
          {/if}

          <!-- Other Details Section -->
          {#if viewingAccount.station || viewingAccount.transport}
            <div class="bg-neutral-700 p-4 rounded">
              <h3 class="font-semibold mb-4 text-lg">Other Details</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#if viewingAccount.station}
                  <div>
                    <p class="text-sm text-gray-400">Station</p>
                    <p class="font-medium">{viewingAccount.station}</p>
                  </div>
                {/if}
                {#if viewingAccount.transport}
                  <div>
                    <p class="text-sm text-gray-400">Transport</p>
                    <p class="font-medium">{viewingAccount.transport}</p>
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>

        <div class="flex gap-4 mt-6">
          <button
            onclick={() => {
              if (viewingAccount) {
                handleEdit(viewingAccount);
              }
            }}
            class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
          >
            Edit Account
          </button>
          <button
            onclick={closeViewModal}
            class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
