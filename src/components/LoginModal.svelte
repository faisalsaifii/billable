<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { companyService } from "../lib/services/companyService";
  import type { Company } from "../types";
  import Input from "./Input.svelte";

  const dispatch = createEventDispatcher();

  export let company: Company;

  let loading = false;
  let error = "";
  let username = "";
  let password = "";

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    loading = true;
    error = "";

    try {
      // Validate inputs
      if (!username || !password) {
        throw new Error("Username and password are required");
      }

      // Validate credentials
      const isValid = await companyService.validateLogin(
        company.id,
        username,
        password
      );

      if (!isValid) {
        throw new Error("Invalid username or password");
      }

      // Dispatch success event with username
      dispatch("loggedin", { username });
    } catch (err) {
      error = err instanceof Error ? err.message : "Login failed";
      console.error("Error:", err);
    } finally {
      loading = false;
    }
  };

  const handleCancel = () => {
    dispatch("cancel");
  };
</script>

<div
  class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
>
  <div
    class="bg-neutral-900 border border-neutral-700 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
  >
    <h2 class="text-2xl font-bold text-white mb-1">Login</h2>
    <p class="text-neutral-400 text-sm mb-6">{company.name}</p>

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
        label="SuperUser Name"
        type="text"
        bind:value={username}
        required
        disabled={loading}
        placeholder="Administrator"
      />

      <Input
        name="password"
        label="Password"
        type="password"
        bind:value={password}
        required
        disabled={loading}
        placeholder="Enter password"
      />

      <div class="flex gap-3 mt-6 pt-2">
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
          class="flex-1 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors duration-150"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </form>
  </div>
</div>
