<script lang="ts">
  import { companyService } from "../lib/services/companyService";
  import Input from "./Input.svelte";
  import { createFocusTrap } from "../lib/hooks/useFocusTrap";
  import { onMount } from "svelte";

  let {
    companyId,
    oncreated,
    oncancel,
  }: {
    companyId: number;
    oncreated?: () => void;
    oncancel?: () => void;
  } = $props();

  let loading = $state(false);
  let error = $state("");
  let username = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let modalElement: HTMLElement;

  onMount(() => {
    if (modalElement) {
      const trap = createFocusTrap(modalElement, () => oncancel?.());
      return () => trap.destroy();
    }
  });

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    loading = true;
    error = "";
    try {
      if (!username || username.length > 20)
        throw new Error("Username must be 1-20 characters");
      if (!password || password.length > 20)
        throw new Error("Password must be 1-20 characters");
      if (password !== confirmPassword)
        throw new Error("Passwords do not match");
      await companyService.createSuperUser(companyId, username, password);
      oncreated?.();
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to create SuperUser";
    } finally {
      loading = false;
    }
  };
</script>

<div
  class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
  role="dialog"
  aria-modal="true"
  aria-labelledby="superuser-title"
>
  <div
    bind:this={modalElement}
    class="bg-neutral-900 border border-neutral-700 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
  >
    <h2 id="superuser-title" class="text-2xl font-bold text-white mb-2">
      Create SuperUser
    </h2>
    <p class="text-neutral-400 mb-6 text-sm">
      Every company needs a SuperUser for administration.
    </p>
    {#if error}
      <div
        class="bg-red-900/30 text-red-300 p-3 rounded-lg mb-4 text-sm border border-red-800/50"
      >
        {error}
      </div>
    {/if}
    <form onsubmit={handleSubmit} class="space-y-4">
      <Input
        name="username"
        label="SuperUser Name (max 20)"
        type="text"
        bind:value={username}
        maxlength={20}
        required
        placeholder="Administrator"
      />
      <Input
        name="password"
        label="Password (max 20)"
        type="password"
        bind:value={password}
        maxlength={20}
        required
        placeholder="Enter password"
      />
      <Input
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        bind:value={confirmPassword}
        maxlength={20}
        required
        placeholder="Re-enter password"
      />
      <div class="flex gap-3 mt-6 pt-2">
        <button
          type="button"
          onclick={() => oncancel?.()}
          disabled={loading}
          class="flex-1 p-2 border border-neutral-600 rounded-lg hover:bg-neutral-800 disabled:opacity-40 transition-colors duration-150 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          class="flex-1 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors duration-150"
        >
          {loading ? "Creating..." : "Create SuperUser"}
        </button>
      </div>
    </form>
  </div>
</div>
