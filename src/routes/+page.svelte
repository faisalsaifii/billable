<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { onMount } from "svelte";

  let greetMsg = $state("");

  onMount(async () => {
    greetMsg = await invoke("first_text");
  });
</script>

<main class="container">
  <h1>Billable</h1>
  <p>{greetMsg}</p>
</main>

<style>
  .container {
    color: white;
    background-color: black;
  }
</style>
