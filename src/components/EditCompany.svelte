<script lang="ts">
  import { companyService } from "../lib/services/companyService";
  import type { Company, CreateCompanyDTO } from "../types";
  import Input from "./Input.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let company: Company;

  let loading = false;
  let error = "";

  let formData: Partial<CreateCompanyDTO> = {
    printName: company.printName,
    booksCommencingFrom: company.booksCommencingFrom,
    address1: company.address1,
    address2: company.address2,
    address3: company.address3,
    address4: company.address4,
    itPAN: company.itPAN,
    telNo: company.telNo,
    ward: company.ward,
    fax: company.fax,
    email: company.email,
    state: company.state,
    currencySymbol: company.currencySymbol,
    currencyString: company.currencyString,
    currencySubString: company.currencySubString,
    enableTax: company.enableTax,
    taxType: company.taxType,
    enableAddTax: company.enableAddTax,
    addTaxCaption: company.addTaxCaption,
    tin: company.tin,
    lstNo: company.lstNo,
    gstNo: company.gstNo,
    cstNo: company.cstNo,
    defaultTaxRate1: company.defaultTaxRate1,
    defaultTaxRate2: company.defaultTaxRate2,
  };

  let showTaxFields = company.enableTax;

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    loading = true;
    error = "";

    try {
      await companyService.initialize();
      await companyService.updateCompany(company.id, formData);
      dispatch("updated");
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to update company";
      console.error("Error:", err);
    } finally {
      loading = false;
    }
  };

  const handleCancel = () => {
    dispatch("cancel");
  };
</script>

<div class="p-8 max-w-4xl mx-auto">
  <h1 class="font-bold text-2xl mb-2 text-white">
    Edit Company: {company.name}
  </h1>
  <p class="text-neutral-500 mb-8">Update company information and settings</p>

  {#if error}
    <div
      class="bg-red-900/30 text-red-300 p-4 rounded-lg mb-6 border border-red-800/50"
    >
      {error}
    </div>
  {/if}

  <form onsubmit={handleSubmit} class="space-y-6">
    <!-- Basic Info Section -->
    <div class="card-elevated">
      <h2 class="section-title">Basic Information</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          name="name"
          label="Company Name"
          type="text"
          value={company.name}
          disabled
          placeholder="Cannot be changed"
        />
        <Input
          name="printName"
          label="Print Name"
          type="text"
          bind:value={formData.printName}
          required
        />

        <Input
          name="fyBeginningFrom"
          label="Financial Year Beginning From"
          type="date"
          value={company.fyBeginningFrom}
          disabled
          placeholder="Cannot be changed"
        />
        <Input
          name="booksCommencingFrom"
          label="Books Commencing From"
          type="date"
          bind:value={formData.booksCommencingFrom}
          required
        />
      </div>
    </div>

    <!-- Address Section -->
    <div class="card-elevated">
      <h2 class="section-title">Address</h2>

      <div class="grid grid-cols-1 gap-4">
        <Input
          name="address1"
          label="Address Line 1"
          type="text"
          bind:value={formData.address1}
        />
        <Input
          name="address2"
          label="Address Line 2"
          type="text"
          bind:value={formData.address2}
        />
        <Input
          name="address3"
          label="Address Line 3"
          type="text"
          bind:value={formData.address3}
        />
        <Input
          name="address4"
          label="Address Line 4"
          type="text"
          bind:value={formData.address4}
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="country"
            label="Country"
            type="text"
            value={company.country}
            disabled
          />
          <Input
            name="state"
            label="State"
            type="text"
            bind:value={formData.state}
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="ward"
            label="Ward"
            type="text"
            bind:value={formData.ward}
          />
          <Input
            name="itPAN"
            label="IT PAN"
            type="text"
            bind:value={formData.itPAN}
          />
        </div>
      </div>
    </div>

    <!-- Contact Section -->
    <div class="card-elevated">
      <h2 class="section-title">Contact Details</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          name="telNo"
          label="Telephone Number"
          type="text"
          bind:value={formData.telNo}
        />
        <Input name="fax" label="Fax" type="text" bind:value={formData.fax} />
        <Input
          name="email"
          label="Email"
          type="email"
          bind:value={formData.email}
        />
      </div>
    </div>

    <!-- Currency Section -->
    <div class="card-elevated">
      <h2 class="section-title">Currency</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          name="currencySymbol"
          label="Currency Symbol"
          type="text"
          bind:value={formData.currencySymbol}
        />
        <Input
          name="currencyString"
          label="Currency Name"
          type="text"
          bind:value={formData.currencyString}
        />
        <Input
          name="currencySubString"
          label="Currency Sub-unit"
          type="text"
          bind:value={formData.currencySubString}
        />
      </div>
    </div>

    <!-- Tax Section -->
    <div class="card-elevated">
      <h2 class="section-title">Tax Configuration</h2>

      <div class="space-y-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={formData.enableTax}
            onchange={() => (showTaxFields = formData.enableTax || false)}
          />
          <span>Enable Tax</span>
        </label>

        {#if showTaxFields}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label for="taxType" class="block text-sm font-medium mb-1"
                >Tax Type</label
              >
              <select
                id="taxType"
                bind:value={formData.taxType}
                class="w-full border border-gray-400 rounded p-2 bg-neutral-800"
              >
                <option value={null}>Select Tax Type</option>
                <option value="LST">LST</option>
                <option value="VAT">VAT</option>
                <option value="GST">GST</option>
              </select>
            </div>

            {#if formData.taxType === "VAT"}
              <Input
                name="tin"
                label="TIN"
                type="text"
                bind:value={formData.tin}
              />
            {/if}

            {#if formData.taxType === "LST"}
              <Input
                name="lstNo"
                label="LST Number"
                type="text"
                bind:value={formData.lstNo}
              />
            {/if}

            {#if formData.taxType === "GST"}
              <Input
                name="gstNo"
                label="GST Number"
                type="text"
                bind:value={formData.gstNo}
              />
            {/if}

            {#if formData.taxType === "LST" || formData.taxType === "VAT"}
              <Input
                name="cstNo"
                label="CST Number"
                type="text"
                bind:value={formData.cstNo}
              />
            {/if}
          </div>

          <div class="flex items-center gap-2 my-4">
            <input
              type="checkbox"
              bind:checked={formData.enableAddTax}
              id="enableAddTax"
            />
            <label for="enableAddTax" class="cursor-pointer">
              Enable Additional Tax / Surcharge
            </label>
          </div>

          {#if formData.enableAddTax}
            <Input
              name="addTaxCaption"
              label="Additional Tax Label"
              type="text"
              bind:value={formData.addTaxCaption}
              placeholder="e.g., Surcharge"
            />
          {/if}

          {#if formData.taxType && formData.taxType !== "GST"}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="defaultTaxRate1"
                label="Default Tax Rate 1 (%)"
                type="number"
                step="0.01"
                bind:value={formData.defaultTaxRate1}
              />
              <Input
                name="defaultTaxRate2"
                label="Default Tax Rate 2 (%)"
                type="number"
                step="0.01"
                bind:value={formData.defaultTaxRate2}
              />
            </div>
          {/if}
        {/if}
      </div>
    </div>

    <div class="flex gap-3 pt-2">
      <button
        type="button"
        onclick={handleCancel}
        disabled={loading}
        class="flex-1 p-2 border border-neutral-600 rounded-lg hover:bg-neutral-800 disabled:opacity-40 transition-colors duration-150 font-medium"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        class="flex-1 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors duration-150"
      >
        {loading ? "Saving Changes..." : "Save Changes"}
      </button>
    </div>
  </form>
</div>
