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

      header.partyAccountId = accounts[0]?.id || 0;
      header.saleTypeId = saleTypes[0]?.id || 0;
      header.purchaseTypeId = purchaseTypes[0]?.id || 0;

      itemLines = [
        {
          itemId: items[0]?.id || 0,
          qty: 1,
          unitId: units[0]?.id || 0,
          rate: items[0]?.salePrice || items[0]?.purchasePrice || 0,
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
    const line = itemLines[i];
    const gross = line.qty * line.rate;
    const disc = line.discount > 0 ? (gross * line.discount) / 100 : 0;
    itemLines[i].amount = gross - disc;
    itemLines = [...itemLines];
  };

  const addItemLine = () => {
    itemLines = [
      ...itemLines,
      {
        itemId: items[0]?.id || 0,
        qty: 1,
        unitId: units[0]?.id || 0,
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
  const grandTotal = $derived(itemTotal + bsTotal);

  const handleSubmit = async () => {
    error = "";
    successMsg = "";

    if (!companyId) {
      error = "No active company selected. Re-open the company and try again.";
      return;
    }
    if (loadingMasters || mastersLoadedForCompanyId !== companyId) {
      error = "Loading latest masters for this company. Please try again.";
      return;
    }
    if (!header.partyAccountId) {
      error = "Select a party account";
      return;
    }
    if (!items.length) {
      error =
        "No items found. Create at least one item in Masters before saving this voucher.";
      return;
    }
    if (!itemLines.length) {
      error = "Add at least one item line";
      return;
    }

    const validItemIds = new Set(items.map((it) => it.id));
    if (
      itemLines.some(
        (l) =>
          !l.itemId ||
          !validItemIds.has(l.itemId) ||
          l.qty <= 0 ||
          l.amount < 0,
      )
    ) {
      error =
        "One or more item rows are invalid. Select valid items and keep quantity greater than zero.";
      return;
    }

    if (bsLines.length) {
      const validBillSundryIds = new Set(billSundries.map((b) => b.id));
      if (
        bsLines.some(
          (b) => !b.billSundryId || !validBillSundryIds.has(b.billSundryId),
        )
      ) {
        error =
          "One or more bill sundry rows are invalid. Re-select the bill sundry and try again.";
        return;
      }
    }

    if (isSales && saleTypes.length && !header.saleTypeId) {
      error = "Select a valid sale type.";
      return;
    }

    if (isPurchase && purchaseTypes.length && !header.purchaseTypeId) {
      error = "Select a valid purchase type.";
      return;
    }

    loading = true;
    try {
      await voucherService.createVoucher({
        companyId,
        voucherType,
        series: header.series,
        vchNo: nextVchNo,
        date: header.date,
        partyAccountId: header.partyAccountId,
        saleTypeId: isSales ? header.saleTypeId || undefined : undefined,
        purchaseTypeId: isPurchase
          ? header.purchaseTypeId || undefined
          : undefined,
        narration: header.narration,
        totalAmount: grandTotal,
        accountLines: [],
        itemLines: itemLines.map((l) => ({
          itemId: l.itemId,
          qty: l.qty,
          unitId: l.unitId || null,
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
      itemLines = [
        {
          itemId: items[0]?.id || 0,
          qty: 1,
          unitId: units[0]?.id || 0,
          rate: 0,
          discount: 0,
          amount: 0,
        },
      ];
      bsLines = [];
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
    disabled={loading || loadingMasters || !header.partyAccountId}
    class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded"
  >
    {loading ? "Saving..." : `Save ${voucherType}`}
  </button>
</div>
