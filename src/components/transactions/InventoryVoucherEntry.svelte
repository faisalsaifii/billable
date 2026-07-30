<script lang="ts">
  import { session } from "../../lib/stores/session";
  import { voucherService } from "../../lib/services/voucherService";
  import { mastersService } from "../../lib/services/mastersService";
  import { companyService } from "../../lib/services/companyService";
  import type {
    Account,
    Item,
    Unit,
    BillSundry,
    SaleType,
    PurchaseType,
    VoucherType,
  } from "../../types";
  import { onMount } from "svelte";
  import Input from "../Input.svelte";

  let {
    voucherType,
    onSaved,
  }: {
    voucherType: VoucherType;
    onSaved?: () => void;
  } = $props();

  let companyId = $state(0);
  let accounts: Account[] = $state([]);
  let items: Item[] = $state([]);
  let units: Unit[] = $state([]);
  let billSundries: BillSundry[] = $state([]);
  let saleTypes: SaleType[] = $state([]);
  let purchaseTypes: PurchaseType[] = $state([]);
  let loading = $state(false);
  let loadingMasters = $state(false);
  let error = $state("");
  let successMsg = $state("");
  let nextVchNo = $state("");
  let mastersLoadedForCompanyId = $state<number | null>(null);

  interface ItemLine {
    itemId: number;
    qty: number;
    unitId: number;
    rate: number;
    discount: number;
    amount: number;
  }
  interface BSLine {
    billSundryId: number;
    rate: number;
    amount: number;
  }

  let header = $state({
    date: new Date().toISOString().split("T")[0],
    series: "Main",
    partyAccountId: 0,
    saleTypeId: 0,
    purchaseTypeId: 0,
    narration: "",
  });

  let itemLines: ItemLine[] = $state([
    { itemId: 0, qty: 1, unitId: 0, rate: 0, discount: 0, amount: 0 },
  ]);
  let bsLines: BSLine[] = $state([]);

  // Additional Charges state
  let additionalCharges = $state({
    taxAmount: 0,
    transportCharges: 0,
    otherCharges: 0,
    roundedOff: 0,
  });

  const isSales = $derived(
    voucherType === "Sales" || voucherType === "Sales Return",
  );
  const isPurchase = $derived(
    voucherType === "Purchase" || voucherType === "Purchase Return",
  );

  $effect(() => {
    const unsub = session.subscribe((s) => {
      if (s.companyId) companyId = s.companyId;
    });
    return unsub;
  });

  const loadMastersForCompany = async (id: number) => {
    if (!id || mastersLoadedForCompanyId === id) return;
    loadingMasters = true;
    error = "";
    try {
      [accounts, items, units, billSundries, saleTypes, purchaseTypes] =
        await Promise.all([
          mastersService.getAccounts(id),
          mastersService.getItems(id),
          mastersService.getUnits(id),
          mastersService.getBillSundries(id),
          mastersService.getSaleTypes(id),
          mastersService.getPurchaseTypes(id),
        ]);

      // Validate essential masters exist
      if (accounts.length === 0) {
        error =
          "No accounts found. Please create at least one account in Masters → Accounts before creating vouchers.";
        return;
      }
      if (items.length === 0) {
        error =
          "No items found. Please create at least one item in Masters → Items before creating vouchers.";
        return;
      }
      if (units.length === 0) {
        error =
          "No units found. Please create at least one unit in Masters → Units before creating vouchers.";
        return;
      }
      if (isPurchase && purchaseTypes.length === 0) {
        error =
          "No purchase types found. Please create at least one purchase type in Masters → Purchase Types before creating purchase vouchers.";
        return;
      }
      if (isSales && saleTypes.length === 0) {
        error =
          "No sale types found. Please create at least one sale type in Masters → Sale Types before creating sales vouchers.";
        return;
      }

      header.partyAccountId = accounts[0]?.id || 0;
      header.saleTypeId = saleTypes[0]?.id || 0;
      header.purchaseTypeId = purchaseTypes[0]?.id || 0;

      const firstItem = items[0];
      const defaultUnitId = firstItem?.mainUnitId || units[0]?.id || 0;

      // Ensure unit ID is valid or null, never 0
      const validUnitId = defaultUnitId > 0 ? defaultUnitId : units[0]?.id || 0;

      itemLines = [
        {
          itemId: firstItem?.id || 0,
          qty: 1,
          unitId: validUnitId,
          rate: firstItem?.salePrice || firstItem?.purchasePrice || 0,
          discount: 0,
          amount: 0,
        },
      ];
      updateItemLine(0, "qty", 1);

      nextVchNo = await voucherService.getNextVoucherNo(
        id,
        voucherType,
        header.series,
      );
      mastersLoadedForCompanyId = id;
    } finally {
      loadingMasters = false;
    }
  };

  onMount(async () => {
    await companyService.initialize();
    if (companyId) await loadMastersForCompany(companyId);
  });

  $effect(() => {
    if (!companyId) return;
    if (mastersLoadedForCompanyId !== companyId) {
      void loadMastersForCompany(companyId);
    }
  });

  const updateItemLine = (i: number, field: keyof ItemLine, val: number) => {
    itemLines[i] = { ...itemLines[i], [field]: val };

    // Auto-fill unit when item is selected
    if (field === "itemId") {
      const selectedItem = items.find((item) => item.id === val);
      if (selectedItem?.mainUnitId) {
        itemLines[i].unitId = selectedItem.mainUnitId;
      }
    }

    const line = itemLines[i];
    const gross = line.qty * line.rate;
    const disc = line.discount > 0 ? (gross * line.discount) / 100 : 0;
    itemLines[i].amount = gross - disc;
    itemLines = [...itemLines];
  };

  const addItemLine = () => {
    const firstItem = items[0];
    const defaultUnitId = firstItem?.mainUnitId || units[0]?.id || 0;
    itemLines = [
      ...itemLines,
      {
        itemId: firstItem?.id || 0,
        qty: 1,
        unitId: defaultUnitId,
        rate: 0,
        discount: 0,
        amount: 0,
      },
    ];
  };

  const removeItemLine = (i: number) => {
    itemLines = itemLines.filter((_, idx) => idx !== i);
  };

  const itemTotal = $derived(
    itemLines.reduce((s, l) => s + (l.amount || 0), 0),
  );
  const bsTotal = $derived(bsLines.reduce((s, l) => s + (l.amount || 0), 0));
  const additionalChargesTotal = $derived(
    additionalCharges.taxAmount +
      additionalCharges.transportCharges +
      additionalCharges.otherCharges +
      additionalCharges.roundedOff,
  );
  const grandTotal = $derived(itemTotal + bsTotal + additionalChargesTotal);

  // Comprehensive validation state
  const validationErrors = $derived.by(() => {
    const errors: string[] = [];

    if (!companyId) {
      errors.push("No active company selected");
      return errors;
    }

    if (loadingMasters || mastersLoadedForCompanyId !== companyId) {
      errors.push("Loading masters...");
      return errors;
    }

    if (accounts.length === 0) {
      errors.push("No accounts available - create accounts first");
      return errors;
    }

    if (items.length === 0) {
      errors.push("No items available - create items first");
      return errors;
    }

    if (!header.partyAccountId) {
      errors.push("Party account is required");
    } else {
      const validAccountIds = new Set(accounts.map((a) => a.id));
      if (!validAccountIds.has(header.partyAccountId)) {
        errors.push("Selected party account is invalid - reopen form");
      }
    }

    if (isPurchase && purchaseTypes.length === 0) {
      errors.push("No purchase types available - create purchase types first");
      return errors;
    }

    if (isSales && saleTypes.length === 0) {
      errors.push("No sale types available - create sale types first");
      return errors;
    }

    if (isPurchase && purchaseTypes.length > 0 && !header.purchaseTypeId) {
      errors.push("Purchase type is required");
    } else if (isPurchase && header.purchaseTypeId) {
      const validPurchaseTypeIds = new Set(purchaseTypes.map((p) => p.id));
      if (!validPurchaseTypeIds.has(header.purchaseTypeId)) {
        errors.push("Selected purchase type is invalid - reopen form");
      }
    }

    if (isSales && saleTypes.length > 0 && !header.saleTypeId) {
      errors.push("Sale type is required");
    } else if (isSales && header.saleTypeId) {
      const validSaleTypeIds = new Set(saleTypes.map((s) => s.id));
      if (!validSaleTypeIds.has(header.saleTypeId)) {
        errors.push("Selected sale type is invalid - reopen form");
      }
    }

    if (itemLines.length === 0) {
      errors.push("At least one item line is required");
    } else {
      const validItemIds = new Set(items.map((it) => it.id));
      const validUnitIds = new Set(units.map((u) => u.id));
      for (let i = 0; i < itemLines.length; i++) {
        const line = itemLines[i];
        if (!line.itemId || line.itemId === 0) {
          errors.push(`Item line ${i + 1}: Select an item`);
        } else if (!validItemIds.has(line.itemId)) {
          errors.push(`Item line ${i + 1}: Invalid item - reopen form`);
        }
        if (!line.unitId || line.unitId === 0) {
          errors.push(`Item line ${i + 1}: Unit is required`);
        } else if (!validUnitIds.has(line.unitId)) {
          errors.push(`Item line ${i + 1}: Invalid unit - reopen form`);
        }
        if (line.qty <= 0) {
          errors.push(`Item line ${i + 1}: Quantity must be greater than 0`);
        }
        if (line.amount < 0) {
          errors.push(`Item line ${i + 1}: Amount cannot be negative`);
        }
      }
    }

    if (bsLines.length > 0 && billSundries.length > 0) {
      const validBillSundryIds = new Set(billSundries.map((b) => b.id));
      for (let i = 0; i < bsLines.length; i++) {
        const line = bsLines[i];
        if (!line.billSundryId || line.billSundryId === 0) {
          errors.push(`Bill sundry line ${i + 1}: Select a bill sundry`);
        } else if (!validBillSundryIds.has(line.billSundryId)) {
          errors.push(
            `Bill sundry line ${i + 1}: Invalid bill sundry - reopen form`,
          );
        }
      }
    }

    return errors;
  });

  const isFormValid = $derived(validationErrors.length === 0);

  const handleSubmit = async () => {
    error = "";
    successMsg = "";

    // All validations are now in the derived state
    // This should never happen if the button is properly disabled
    if (!isFormValid) {
      error = validationErrors.join("; ");
      return;
    }

    loading = true;
    try {
      // Debug logging to help diagnose issues
      console.log("Saving voucher with data:", {
        companyId,
        partyAccountId: header.partyAccountId,
        saleTypeId: header.saleTypeId,
        purchaseTypeId: header.purchaseTypeId,
        itemLines: itemLines.map((l) => ({
          itemId: l.itemId,
          unitId: l.unitId,
        })),
        mastersLoadedForCompanyId,
      });

      await voucherService.createVoucher({
        companyId,
        voucherType,
        series: header.series,
        vchNo: nextVchNo,
        date: header.date,
        partyAccountId: header.partyAccountId || undefined,
        saleTypeId: isSales ? header.saleTypeId || undefined : undefined,
        purchaseTypeId: isPurchase
          ? header.purchaseTypeId || undefined
          : undefined,
        narration: header.narration,
        totalAmount: grandTotal,
        taxAmount: additionalCharges.taxAmount,
        transportCharges: additionalCharges.transportCharges,
        otherCharges: additionalCharges.otherCharges,
        roundedOff: additionalCharges.roundedOff,
        accountLines: [],
        itemLines: itemLines.map((l) => ({
          itemId: l.itemId,
          qty: l.qty,
          unitId: l.unitId > 0 ? l.unitId : null,
          rate: l.rate,
          discount: l.discount,
          amount: l.amount,
          materialCentreId: null,
        })),
        billSundryLines: bsLines.map((b) => ({
          billSundryId: b.billSundryId,
          rate: b.rate,
          amount: b.amount,
        })),
      });

      // Only proceed with success actions if voucher creation succeeded
      const savedVchNo = nextVchNo;
      const savedTotal = grandTotal;

      nextVchNo = await voucherService.getNextVoucherNo(
        companyId,
        voucherType,
        header.series,
      );

      // Reset form
      const defaultUnitId = items[0]?.mainUnitId || units[0]?.id || 0;
      itemLines = [
        {
          itemId: items[0]?.id || 0,
          qty: 1,
          unitId: defaultUnitId,
          rate: 0,
          discount: 0,
          amount: 0,
        },
      ];
      bsLines = [];
      additionalCharges = {
        taxAmount: 0,
        transportCharges: 0,
        otherCharges: 0,
        roundedOff: 0,
      };
      header.narration = "";

      // Set success message only after everything else succeeds
      successMsg = `${voucherType} #${savedVchNo} saved! Total: ${savedTotal.toFixed(2)}`;
      onSaved?.();
    } catch (e) {
      console.error("Error creating voucher:", e);
      error = e instanceof Error ? e.message : "Error saving voucher";
    } finally {
      loading = false;
    }
  };
</script>

<div class="p-6 max-w-5xl">
  <h1 class="text-2xl font-bold mb-4">{voucherType}</h1>
  {#if error}<div class="bg-red-900 text-red-100 p-3 rounded mb-4 text-sm">
      {error}
    </div>{/if}
  {#if successMsg}<div
      class="bg-green-900 text-green-100 p-3 rounded mb-4 text-sm"
    >
      {successMsg}
    </div>{/if}
  {#if !isFormValid && !error && !loadingMasters}<div
      class="bg-yellow-900 text-yellow-100 p-3 rounded mb-4 text-sm"
    >
      <p class="font-semibold mb-1">Form is incomplete:</p>
      <ul class="list-disc list-inside space-y-1">
        {#each validationErrors as validationError}
          <li>{validationError}</li>
        {/each}
      </ul>
    </div>{/if}

  <!-- Header -->
  <div class="bg-neutral-800 border border-gray-600 rounded p-4 mb-4 space-y-3">
    <div class="grid grid-cols-3 gap-4">
      <Input
        name="vchNo"
        label="Voucher No"
        type="text"
        value={nextVchNo}
        disabled
      />
      <Input
        name="date"
        label="Date"
        type="date"
        bind:value={header.date}
        required
      />
      <Input
        name="series"
        label="Series"
        type="text"
        bind:value={header.series}
      />
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="partyAccountId" class="text-sm font-medium block mb-1"
          >Party Account</label
        >
        <select
          id="partyAccountId"
          value={header.partyAccountId}
          onchange={(e) =>
            (header.partyAccountId = Number(
              (e.target as HTMLSelectElement).value,
            ))}
          class="w-full p-2 bg-neutral-700 border border-gray-500 rounded"
        >
          {#each accounts as a}<option value={a.id}>{a.name}</option>{/each}
        </select>
      </div>
      {#if isSales && saleTypes.length}
        <div>
          <label for="saleTypeId" class="text-sm font-medium block mb-1"
            >Sale Type</label
          >
          <select
            id="saleTypeId"
            value={header.saleTypeId}
            onchange={(e) =>
              (header.saleTypeId = Number(
                (e.target as HTMLSelectElement).value,
              ))}
            class="w-full p-2 bg-neutral-700 border border-gray-500 rounded"
          >
            {#each saleTypes as st}<option value={st.id}>{st.name}</option
              >{/each}
          </select>
        </div>
      {:else if isPurchase && purchaseTypes.length}
        <div>
          <label for="purchaseTypeId" class="text-sm font-medium block mb-1"
            >Purchase Type</label
          >
          <select
            id="purchaseTypeId"
            value={header.purchaseTypeId}
            onchange={(e) =>
              (header.purchaseTypeId = Number(
                (e.target as HTMLSelectElement).value,
              ))}
            class="w-full p-2 bg-neutral-700 border border-gray-500 rounded"
          >
            {#each purchaseTypes as pt}<option value={pt.id}>{pt.name}</option
              >{/each}
          </select>
        </div>
      {/if}
    </div>
  </div>

  <!-- Item Lines -->
  <div
    class="bg-neutral-800 border border-gray-600 rounded overflow-hidden mb-4"
  >
    <div class="p-3 bg-neutral-700 flex justify-between items-center">
      <span class="font-semibold text-sm">Item Details</span>
    </div>
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-gray-600">
          <th class="text-left p-2">Item</th>
          <th class="text-right p-2 w-20">Qty</th>
          <th class="text-left p-2 w-24">Unit</th>
          <th class="text-right p-2 w-28">Rate</th>
          <th class="text-right p-2 w-20">Disc%</th>
          <th class="text-right p-2 w-28">Amount</th>
          <th class="p-2 w-10"></th>
        </tr>
      </thead>
      <tbody>
        {#each itemLines as line, i (i)}
          <tr class="border-b border-gray-700">
            <td class="p-1">
              <select
                value={line.itemId}
                onchange={(e) =>
                  updateItemLine(
                    i,
                    "itemId",
                    Number((e.target as HTMLSelectElement).value),
                  )}
                class="w-full p-1 bg-neutral-700 border border-gray-600 rounded text-sm"
              >
                {#each items as it}<option value={it.id}>{it.name}</option
                  >{/each}
              </select>
            </td>
            <td class="p-1">
              <input
                type="number"
                value={line.qty}
                min="0"
                step="0.01"
                oninput={(e) =>
                  updateItemLine(
                    i,
                    "qty",
                    Number((e.target as HTMLInputElement).value),
                  )}
                class="w-full p-1 bg-neutral-700 border border-gray-600 rounded text-sm text-right"
              />
            </td>
            <td class="p-1">
              <select
                value={line.unitId}
                onchange={(e) =>
                  updateItemLine(
                    i,
                    "unitId",
                    Number((e.target as HTMLSelectElement).value),
                  )}
                class="w-full p-1 bg-neutral-700 border border-gray-600 rounded text-sm"
              >
                {#each units as u}<option value={u.id}>{u.name}</option>{/each}
              </select>
            </td>
            <td class="p-1">
              <input
                type="number"
                value={line.rate}
                min="0"
                step="0.01"
                oninput={(e) =>
                  updateItemLine(
                    i,
                    "rate",
                    Number((e.target as HTMLInputElement).value),
                  )}
                class="w-full p-1 bg-neutral-700 border border-gray-600 rounded text-sm text-right"
              />
            </td>
            <td class="p-1">
              <input
                type="number"
                value={line.discount}
                min="0"
                max="100"
                step="0.01"
                oninput={(e) =>
                  updateItemLine(
                    i,
                    "discount",
                    Number((e.target as HTMLInputElement).value),
                  )}
                class="w-full p-1 bg-neutral-700 border border-gray-600 rounded text-sm text-right"
              />
            </td>
            <td class="p-2 text-right font-medium"
              >{(line.amount || 0).toFixed(2)}</td
            >
            <td class="p-1 text-center">
              <button
                onclick={() => removeItemLine(i)}
                class="text-red-400 text-xs">✕</button
              >
            </td>
          </tr>
        {/each}
      </tbody>
      <tfoot>
        <tr class="bg-neutral-700 border-t border-gray-600">
          <td colspan="5" class="p-2">
            <button
              onclick={addItemLine}
              class="text-blue-400 text-sm hover:text-blue-300"
              >+ Add Item</button
            >
          </td>
          <td class="p-2 text-right font-bold">{itemTotal.toFixed(2)}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- Additional Charges Section -->
  <div
    class="bg-neutral-800 border border-gray-600 rounded overflow-hidden mb-4"
  >
    <div class="p-3 bg-neutral-700">
      <span class="font-semibold text-sm">Additional Charges</span>
    </div>
    <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="taxAmount" class="text-sm font-medium block mb-1"
          >Tax Amount</label
        >
        <input
          id="taxAmount"
          type="number"
          bind:value={additionalCharges.taxAmount}
          min="0"
          step="0.01"
          class="w-full p-2 bg-neutral-700 border border-gray-600 rounded text-sm text-right"
          placeholder="0.00"
        />
      </div>
      <div>
        <label for="transportCharges" class="text-sm font-medium block mb-1"
          >Transport Charges</label
        >
        <input
          id="transportCharges"
          type="number"
          bind:value={additionalCharges.transportCharges}
          min="0"
          step="0.01"
          class="w-full p-2 bg-neutral-700 border border-gray-600 rounded text-sm text-right"
          placeholder="0.00"
        />
      </div>
      <div>
        <label for="otherCharges" class="text-sm font-medium block mb-1"
          >Other Charges</label
        >
        <input
          id="otherCharges"
          type="number"
          bind:value={additionalCharges.otherCharges}
          step="0.01"
          class="w-full p-2 bg-neutral-700 border border-gray-600 rounded text-sm text-right"
          placeholder="0.00"
        />
      </div>
      <div>
        <label for="roundedOff" class="text-sm font-medium block mb-1"
          >Rounded Off (+/-)</label
        >
        <input
          id="roundedOff"
          type="number"
          bind:value={additionalCharges.roundedOff}
          step="0.01"
          class="w-full p-2 bg-neutral-700 border border-gray-600 rounded text-sm text-right"
          placeholder="0.00"
        />
      </div>
    </div>
    {#if additionalChargesTotal !== 0}
      <div class="px-4 pb-3 text-right">
        <span class="text-sm text-gray-400">Additional Charges Total: </span>
        <span class="font-semibold text-green-400"
          >{additionalChargesTotal.toFixed(2)}</span
        >
      </div>
    {/if}
  </div>

  <!-- Bill Sundries -->
  {#if billSundries.length}
    <div
      class="bg-neutral-800 border border-gray-600 rounded overflow-hidden mb-4"
    >
      <div class="p-3 bg-neutral-700 flex justify-between items-center">
        <span class="font-semibold text-sm">Bill Sundries (Taxes/Charges)</span>
        <button
          onclick={() => {
            bsLines = [
              ...bsLines,
              { billSundryId: billSundries[0]?.id || 0, rate: 0, amount: 0 },
            ];
          }}
          class="text-blue-400 text-sm hover:text-blue-300">+ Add</button
        >
      </div>
      {#if bsLines.length}
        <table class="w-full text-sm">
          <tbody>
            {#each bsLines as bs, i (i)}
              <tr class="border-b border-gray-700">
                <td class="p-2">
                  <select
                    value={bs.billSundryId}
                    onchange={(e) => {
                      bs.billSundryId = Number(
                        (e.target as HTMLSelectElement).value,
                      );
                      bsLines = [...bsLines];
                    }}
                    class="w-full p-1 bg-neutral-700 border border-gray-600 rounded text-sm"
                  >
                    {#each billSundries as b}<option value={b.id}
                        >{b.name}</option
                      >{/each}
                  </select>
                </td>
                <td class="p-2 w-32">
                  <input
                    type="number"
                    bind:value={bs.rate}
                    min="0"
                    step="0.01"
                    class="w-full p-1 bg-neutral-700 border border-gray-600 rounded text-sm text-right"
                    placeholder="Rate"
                  />
                </td>
                <td class="p-2 w-32">
                  <input
                    type="number"
                    bind:value={bs.amount}
                    min="0"
                    step="0.01"
                    class="w-full p-1 bg-neutral-700 border border-gray-600 rounded text-sm text-right"
                    placeholder="Amount"
                  />
                </td>
                <td class="p-2 w-8">
                  <button
                    onclick={() => {
                      bsLines = bsLines.filter((_, idx) => idx !== i);
                    }}
                    class="text-red-400 text-xs">✕</button
                  >
                </td>
              </tr>
            {/each}
            <tr class="bg-neutral-700 font-semibold">
              <td colspan="2" class="p-2 text-sm">Bill Sundry Total</td>
              <td class="p-2 text-right">{bsTotal.toFixed(2)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      {/if}
    </div>
  {/if}

  <!-- Grand Total + Narration -->
  <div class="flex gap-6 items-start mb-4">
    <div class="flex-1">
      <label for="narration" class="text-sm font-medium block mb-1"
        >Narration</label
      >
      <textarea
        id="narration"
        bind:value={header.narration}
        rows="2"
        class="w-full p-2 bg-neutral-800 border border-gray-600 rounded text-sm resize-none"
      ></textarea>
    </div>
    <div class="text-right">
      <p class="text-sm text-gray-400">Grand Total</p>
      <p class="text-2xl font-bold text-green-400">{grandTotal.toFixed(2)}</p>
    </div>
  </div>

  <button
    onclick={handleSubmit}
    disabled={loading || loadingMasters || !isFormValid}
    class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors"
    title={isFormValid ? "" : "Fix form errors before saving"}
  >
    {loading
      ? "Saving..."
      : loadingMasters
        ? "Loading..."
        : `Save ${voucherType}`}
  </button>
  {#if !isFormValid && !loadingMasters}
    <p class="text-sm text-yellow-400 mt-2">
      Fix {validationErrors.length} error{validationErrors.length !== 1
        ? "s"
        : ""} to enable saving
    </p>
  {/if}
</div>
