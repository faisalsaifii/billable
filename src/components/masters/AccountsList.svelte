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
  let showForm = $state(false);

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

  const handleSubmit = async () => {
    loading = true;
    error = "";
    try {
      if (formData.groupId === 0) {
        throw new Error("Please select an account group");
      }

      await companyService.initialize();
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
      showForm = false;
      await loadData();
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to create account";
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
      onclick={() => (showForm = !showForm)}
      class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
    >
      {showForm ? "Cancel" : "New Account"}
    </button>
  </div>

  {#if error}
    <div class="bg-red-900 text-red-100 p-4 rounded mb-4">{error}</div>
  {/if}

  {#if showForm}
    <div
      class="bg-neutral-800 border border-gray-600 rounded p-4 mb-6 max-w-4xl"
    >
      <h3 class="font-bold mb-4 text-xl">Create Account</h3>
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
                <label for="balanceType" class="block text-sm font-medium mb-1">
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
                <label for="prevBalanceType" class="block text-sm font-medium mb-1">
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

        <button
          onclick={handleSubmit}
          disabled={!formData.name || formData.groupId === 0 || loading}
          class="w-full p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-semibold"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </div>
    </div>
  {/if}

  {#if loading && !showForm}
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
              <td class="p-3">{account.name}</td>
              <td class="p-3 text-sm">{group?.name || "Unknown"}</td>
              <td class="p-3 text-sm text-right"
                >{account.openingBalance.toFixed(2)}</td
              >
              <td class="p-3 text-sm">{account.openingBalanceType}</td>
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
