<script lang="ts">
  import { companyService } from "../lib/services/companyService";
  import type { CreateCompanyDTO } from "../types";
  import Input from "./Input.svelte";
  import SuperUserModal from "./SuperUserModal.svelte";
  import { toast } from "../lib/stores/toast";
  import { navigation } from "../lib/stores/navigation";

  let loading = false;
  let error = "";
  let showSuperUserModal = false;
  let newCompanyId = 0;

  let formData: CreateCompanyDTO = {
    name: "",
    printName: "",
    fyBeginningFrom: new Date().toISOString().split("T")[0],
    booksCommencingFrom: new Date().toISOString().split("T")[0],
    address1: "",
    address2: "",
    address3: "",
    address4: "",
    itPAN: "",
    telNo: "",
    ward: "",
    fax: "",
    email: "",
    country: "",
    state: "",
    currencySymbol: "Rs.",
    currencyString: "Rupees",
    currencySubString: "Paisa",
    enableTax: false,
    taxType: null,
    enableAddTax: false,
    addTaxCaption: "",
    tin: "",
    lstNo: "",
    gstNo: "",
    cstNo: "",
    defaultTaxRate1: 0,
    defaultTaxRate2: 0,
    bankName: "",
    bankBranch: "",
    bankAccountNo: "",
    bankIFSC: "",
  };

  let showTaxFields = false;

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    loading = true;
    error = "";

    try {
      // Validate required fields
      if (!formData.name || !formData.printName) {
        throw new Error("Company name and print name are required");
      }

      if (!formData.country) {
        throw new Error("Country is required");
      }

      // Initialize database
      await companyService.initialize();

      // Check for duplicate name
      const existing = await companyService.getCompanyByName(formData.name);
      if (existing) {
        throw new Error(`Company '${formData.name}' already exists`);
      }

      // Create company
      newCompanyId = await companyService.createCompany(formData);

      // Show SuperUser creation modal
      showSuperUserModal = true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create company";
      error = errorMessage;
      toast.show(errorMessage, "error", 5000);
      console.error("Error:", err);
    } finally {
      loading = false;
    }
  };

  const handleSuperUserCreated = () => {
    // Show success message
    toast.show("Company created successfully!", "success", 4000);

    // Navigate to list companies page
    navigation.navigateTo("COMPANY_DETAILS");

    // Reset form
    formData = {
      name: "",
      printName: "",
      fyBeginningFrom: new Date().toISOString().split("T")[0],
      booksCommencingFrom: new Date().toISOString().split("T")[0],
      address1: "",
      address2: "",
      address3: "",
      address4: "",
      itPAN: "",
      telNo: "",
      ward: "",
      fax: "",
      email: "",
      country: "",
      state: "",
      currencySymbol: "Rs.",
      currencyString: "Rupees",
      currencySubString: "Paisa",
      enableTax: false,
      taxType: null,
      enableAddTax: false,
      addTaxCaption: "",
      tin: "",
      lstNo: "",
      gstNo: "",
      cstNo: "",
      defaultTaxRate1: 0,
      defaultTaxRate2: 0,
      bankName: "",
      bankBranch: "",
      bankAccountNo: "",
      bankIFSC: "",
    };
    showSuperUserModal = false;
  };
</script>

<div class="p-8 max-w-4xl mx-auto">
  <h1 class="font-bold text-2xl mb-2 text-white">Create Company</h1>
  <p class="text-neutral-500 mb-8">
    Set up a new company for accounting and inventory management
  </p>

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
          bind:value={formData.name}
          required
          placeholder="e.g., ABC Pvt Ltd"
        />
        <Input
          name="printName"
          label="Print Name"
          type="text"
          bind:value={formData.printName}
          required
          placeholder="As it appears on reports"
        />

        <Input
          name="fyBeginningFrom"
          label="Financial Year Beginning From"
          type="date"
          bind:value={formData.fyBeginningFrom}
          required
          disabled
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
            bind:value={formData.country}
            required
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

    <!-- Bank Details Section -->
    <div class="card-elevated">
      <h2 class="section-title">Bank Details</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          name="bankName"
          label="Bank Name"
          type="text"
          bind:value={formData.bankName}
          placeholder="e.g., EXAMPLE BANK"
        />
        <Input
          name="bankBranch"
          label="Branch"
          type="text"
          bind:value={formData.bankBranch}
          placeholder="e.g., Example Branch"
        />
        <Input
          name="bankAccountNo"
          label="Account Number"
          type="text"
          bind:value={formData.bankAccountNo}
          placeholder="e.g., 211100000000000"
        />
        <Input
          name="bankIFSC"
          label="IFSC Code"
          type="text"
          bind:value={formData.bankIFSC}
          placeholder="e.g., EXAMPL0001234"
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
          placeholder="Rs."
        />
        <Input
          name="currencyString"
          label="Currency Name"
          type="text"
          bind:value={formData.currencyString}
          placeholder="Rupees"
        />
        <Input
          name="currencySubString"
          label="Currency Sub-unit"
          type="text"
          bind:value={formData.currencySubString}
          placeholder="Paisa"
        />
      </div>
    </div>

    <!-- Tax Configuration -->
    <div class="card-elevated">
      <h2 class="section-title">Tax Configuration</h2>

      <div class="space-y-4">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={formData.enableTax}
            onchange={() => (showTaxFields = formData.enableTax)}
            class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
          />
          <span class="text-neutral-300">Enable Tax</span>
        </label>

        {#if showTaxFields}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                for="taxType"
                class="block text-sm font-medium text-neutral-300 mb-1.5"
                >Tax Type</label
              >
              <select
                id="taxType"
                bind:value={formData.taxType}
                class="w-full border border-neutral-600 rounded-lg p-2 bg-neutral-800 text-white focus:border-blue-500"
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

          <div class="flex items-center gap-3 my-4">
            <input
              type="checkbox"
              bind:checked={formData.enableAddTax}
              id="enableAddTax"
              class="w-4 h-4 rounded bg-neutral-800 border-neutral-600 cursor-pointer"
            />
            <label for="enableAddTax" class="cursor-pointer text-neutral-300">
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
        type="submit"
        disabled={loading}
        class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors duration-150"
      >
        {loading ? "Creating Company..." : "Create Company"}
      </button>
    </div>
  </form>
</div>

{#if showSuperUserModal}
  <SuperUserModal
    companyId={newCompanyId}
    oncreated={handleSuperUserCreated}
    oncancel={() => (showSuperUserModal = false)}
  />
{/if}
