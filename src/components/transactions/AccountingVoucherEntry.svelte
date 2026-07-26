<script lang="ts">
  import { session } from "../../lib/stores/session";
  import { voucherService } from "../../lib/services/voucherService";
  import { mastersService } from "../../lib/services/mastersService";
  import { companyService } from "../../lib/services/companyService";
  import type { Account, VoucherType } from "../../types";
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
  let loading = $state(false);
  let error = $state("");
  let successMsg = $state("");
  let nextVchNo = $state("");

  interface Line {
    accountId: number;
    dc: "D" | "C";
    amount: number;
    shortNarration: string;
  }
  let lines: Line[] = $state([
    { accountId: 0, dc: "D", amount: 0, shortNarration: "" },
    { accountId: 0, dc: "C", amount: 0, shortNarration: "" },
  ]);

  let formHeader = $state({
    date: new Date().toISOString().split("T")[0],
    series: "Main",
    narration: "",
  });

  $effect(() => {
    const unsub = session.subscribe((s) => {
      if (s.companyId) companyId = s.companyId;
    });
    return unsub;
  });

  onMount(async () => {
    await companyService.initialize();
    accounts = await mastersService.getAccounts(companyId);
    if (accounts.length) {
      lines[0].accountId = accounts[0].id;
      lines[1].accountId = accounts[0].id;
    }
    nextVchNo = await voucherService.getNextVoucherNo(
      companyId,
      voucherType,
      formHeader.series,
    );
  });

  const addLine = () => {
    lines = [
      ...lines,
      {
        accountId: accounts[0]?.id || 0,
        dc: "D",
        amount: 0,
        shortNarration: "",
      },
    ];
  };

  const removeLine = (i: number) => {
    if (lines.length <= 2) return;
    lines = lines.filter((_, idx) => idx !== i);
  };

  const totalDebit = $derived(
    lines.reduce((s, l) => (l.dc === "D" ? s + (l.amount || 0) : s), 0),
  );
  const totalCredit = $derived(
    lines.reduce((s, l) => (l.dc === "C" ? s + (l.amount || 0) : s), 0),
  );
  const isBalanced = $derived(Math.abs(totalDebit - totalCredit) < 0.005);

  const handleSubmit = async () => {
    error = "";
    successMsg = "";

    if (!isBalanced) {
      error = "Debit and Credit totals must match";
      return;
    }
    if (lines.some((l) => !l.accountId || !l.amount)) {
      error = "All lines must have an account and amount";
      return;
    }

    loading = true;
    try {
      await voucherService.createVoucher({
        companyId,
        voucherType,
        series: formHeader.series,
        vchNo: nextVchNo,
        date: formHeader.date,
        narration: formHeader.narration,
        totalAmount: totalDebit,
        accountLines: lines.map((l) => ({
          accountId: l.accountId,
          dc: l.dc,
          amount: l.amount,
          shortNarration: l.shortNarration || null,
        })),
        itemLines: [],
        billSundryLines: [],
      });

      // Only proceed with success actions if voucher creation succeeded
      const savedVchNo = nextVchNo;

      nextVchNo = await voucherService.getNextVoucherNo(
        companyId,
        voucherType,
        formHeader.series,
      );

      // Reset form
      lines = [
        {
          accountId: accounts[0]?.id || 0,
          dc: "D",
          amount: 0,
          shortNarration: "",
        },
        {
          accountId: accounts[0]?.id || 0,
          dc: "C",
          amount: 0,
          shortNarration: "",
        },
      ];
      formHeader.narration = "";

      // Set success message only after everything else succeeds
      successMsg = `${voucherType} #${savedVchNo} saved!`;
      onSaved?.();
    } catch (e) {
      console.error("Error creating voucher:", e);
      error = e instanceof Error ? e.message : "Error saving voucher";
    } finally {
      loading = false;
    }
  };
</script>

<div class="p-6 max-w-4xl">
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
  <div class="bg-neutral-800 border border-gray-600 rounded p-4 mb-4">
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
        bind:value={formHeader.date}
        required
      />
      <Input
        name="series"
        label="Series"
        type="text"
        bind:value={formHeader.series}
      />
    </div>
  </div>

  <!-- Account Lines -->
  <div
    class="bg-neutral-800 border border-gray-600 rounded overflow-hidden mb-4"
  >
    <table class="w-full text-sm">
      <thead>
        <tr class="bg-neutral-700 border-b border-gray-600">
          <th class="text-left p-2 w-8">#</th>
          <th class="text-left p-2">Account</th>
          <th class="text-left p-2 w-20">D/C</th>
          <th class="text-right p-2 w-32">Amount</th>
          <th class="text-left p-2">Short Narration</th>
          <th class="p-2 w-12"></th>
        </tr>
      </thead>
      <tbody>
        {#each lines as line, i (i)}
          <tr class="border-b border-gray-700">
            <td class="p-2 text-gray-400">{i + 1}</td>
            <td class="p-2">
              <select
                bind:value={line.accountId}
                class="w-full p-1 bg-neutral-700 border border-gray-600 rounded text-sm"
              >
                {#each accounts as a}<option value={a.id}>{a.name}</option
                  >{/each}
              </select>
            </td>
            <td class="p-2">
              <select
                bind:value={line.dc}
                class="w-full p-1 bg-neutral-700 border border-gray-600 rounded text-sm"
              >
                <option value="D">Debit</option>
                <option value="C">Credit</option>
              </select>
            </td>
            <td class="p-2">
              <input
                type="number"
                bind:value={line.amount}
                min="0"
                step="0.01"
                class="w-full p-1 bg-neutral-700 border border-gray-600 rounded text-sm text-right"
              />
            </td>
            <td class="p-2">
              <input
                type="text"
                bind:value={line.shortNarration}
                placeholder="optional"
                class="w-full p-1 bg-neutral-700 border border-gray-600 rounded text-sm"
              />
            </td>
            <td class="p-2">
              {#if lines.length > 2}
                <button
                  onclick={() => removeLine(i)}
                  class="text-red-400 hover:text-red-300 text-xs">✕</button
                >
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
      <tfoot>
        <tr class="bg-neutral-700 border-t border-gray-600 font-semibold">
          <td colspan="2" class="p-2">
            <button
              onclick={addLine}
              class="text-sm text-blue-400 hover:text-blue-300"
              >+ Add Line</button
            >
          </td>
          <td class="p-2 text-sm">Total</td>
          <td class="p-2 text-right text-sm">
            <span class="text-green-400">Dr: {totalDebit.toFixed(2)}</span>{" "}
            <span class="text-red-400">Cr: {totalCredit.toFixed(2)}</span>
          </td>
          <td colspan="2" class="p-2">
            {#if !isBalanced}
              <span class="text-yellow-400 text-xs"
                >Diff: {Math.abs(totalDebit - totalCredit).toFixed(2)}</span
              >
            {:else}
              <span class="text-green-400 text-xs">✓ Balanced</span>
            {/if}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- Narration -->
  <div class="mb-4">
    <label class="text-sm font-medium block mb-1">Narration</label>
    <textarea
      bind:value={formHeader.narration}
      rows="2"
      class="w-full p-2 bg-neutral-800 border border-gray-600 rounded text-sm resize-none"
      placeholder="Voucher description..."
    ></textarea>
  </div>

  <button
    onclick={handleSubmit}
    disabled={loading || !isBalanced}
    class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded"
  >
    {loading ? "Saving..." : `Save ${voucherType}`}
  </button>
</div>
