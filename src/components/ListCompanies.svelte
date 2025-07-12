<script lang="ts">
  import Database from "@tauri-apps/plugin-sql";
  import { onMount } from "svelte";

  let fetchCompanies = async () => {
    try {
      const db = await Database.load("sqlite:billable.db");
      const companies: Array<{ id: number; name: string }> = await db.select(
        "SELECT * FROM companies",
      );
      console.log("Companies:", companies);
      return companies;
    } catch (err) {
      console.error("DB Error:", err);
      return [];
    }
  };

  let companies: Array<{ id: number; name: string }> = $state([]);

  onMount(async () => {
    companies = await fetchCompanies();
  });
</script>

{#if companies.length > 0}
  <h1 class="font-bold text-center text-xl mb-4">Companies</h1>
  {#each companies as company}
    <li class="text-center">{company.name}</li>
  {/each}
{/if}
