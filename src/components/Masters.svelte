<script lang="ts">
  import { session } from "../lib/stores/session";
  import AccountGroupsList from "./masters/AccountGroupsList.svelte";
  import AccountsList from "./masters/AccountsList.svelte";
  import ItemGroupsList from "./masters/ItemGroupsList.svelte";
  import ItemsList from "./masters/ItemsList.svelte";
  import UnitsList from "./masters/UnitsList.svelte";
  import MaterialCentresList from "./masters/MaterialCentresList.svelte";
  import BillSundriesList from "./masters/BillSundriesList.svelte";
  import UnitConversionsList from "./masters/UnitConversionsList.svelte";
  import StandardNarrationsList from "./masters/StandardNarrationsList.svelte";
  import STFormsList from "./masters/STFormsList.svelte";
  import SaleTypesList from "./masters/SaleTypesList.svelte";
  import PurchaseTypesList from "./masters/PurchaseTypesList.svelte";

  type MasterView =
    | "ACCOUNT_GROUPS"
    | "ACCOUNTS"
    | "ITEM_GROUPS"
    | "ITEMS"
    | "UNITS"
    | "UNIT_CONVERSIONS"
    | "MATERIAL_CENTRES"
    | "BILL_SUNDRIES"
    | "SALE_TYPES"
    | "PURCHASE_TYPES"
    | "ST_FORMS"
    | "STANDARD_NARRATIONS";

  let currentView: MasterView = $state("ACCOUNT_GROUPS");
  let companyId = $state(0);

  $effect(() => {
    const unsub = session.subscribe((s) => {
      if (s.companyId) companyId = s.companyId;
    });
    return unsub;
  });

  const masterOptions: { label: string; view: MasterView }[] = [
    { label: "Account Groups", view: "ACCOUNT_GROUPS" },
    { label: "Accounts (Ledgers)", view: "ACCOUNTS" },
    { label: "Item Groups", view: "ITEM_GROUPS" },
    { label: "Items", view: "ITEMS" },
    { label: "Units", view: "UNITS" },
    { label: "Unit Conversions", view: "UNIT_CONVERSIONS" },
    { label: "Material Centres", view: "MATERIAL_CENTRES" },
    { label: "Bill Sundries", view: "BILL_SUNDRIES" },
    { label: "Sale Types", view: "SALE_TYPES" },
    { label: "Purchase Types", view: "PURCHASE_TYPES" },
    { label: "ST Forms", view: "ST_FORMS" },
    { label: "Standard Narrations", view: "STANDARD_NARRATIONS" },
  ];
</script>

<div class="flex h-full">
  <!-- Sidebar -->
  <div
    class="w-56 bg-neutral-900 border-r border-neutral-800 p-4 overflow-y-auto"
  >
    <h2
      class="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4"
    >
      Masters
    </h2>
    <div class="space-y-0.5">
      {#each masterOptions as { label, view }}
        <button
          onclick={() => (currentView = view)}
          class="sidebar-item {currentView === view ? 'active' : ''}"
        >
          {label}
        </button>
      {/each}
    </div>
  </div>

  <!-- Main Content -->
  <div class="flex-1 overflow-auto">
    {#if currentView === "ACCOUNT_GROUPS"}<AccountGroupsList {companyId} />{/if}
    {#if currentView === "ACCOUNTS"}<AccountsList {companyId} />{/if}
    {#if currentView === "ITEM_GROUPS"}<ItemGroupsList {companyId} />{/if}
    {#if currentView === "ITEMS"}<ItemsList {companyId} />{/if}
    {#if currentView === "UNITS"}<UnitsList {companyId} />{/if}
    {#if currentView === "UNIT_CONVERSIONS"}<UnitConversionsList
        {companyId}
      />{/if}
    {#if currentView === "MATERIAL_CENTRES"}<MaterialCentresList
        {companyId}
      />{/if}
    {#if currentView === "BILL_SUNDRIES"}<BillSundriesList {companyId} />{/if}
    {#if currentView === "SALE_TYPES"}<SaleTypesList {companyId} />{/if}
    {#if currentView === "PURCHASE_TYPES"}<PurchaseTypesList {companyId} />{/if}
    {#if currentView === "ST_FORMS"}<STFormsList {companyId} />{/if}
    {#if currentView === "STANDARD_NARRATIONS"}<StandardNarrationsList
        {companyId}
      />{/if}
  </div>
</div>
