<script lang="ts">
  import Button from "../components/Button.svelte";
  import CreateCompany from "../components/CreateCompany.svelte";
  import DropDown from "../components/Dropdown.svelte";
  import Home from "../components/Home.svelte";
  import ListCompanies from "../components/ListCompanies.svelte";

  type View = "CREATE_COMPANY" | "COMPANY_DETAILS" | "HOME";
  let currentView: View = $state("HOME");

  let mainOptions = [
    {
      text: "Company",
      options: [
        {
          text: "Create Company",
          onclick: () => (currentView = "CREATE_COMPANY"),
        },
        {
          text: "Open Company",
          onclick: () => (currentView = "COMPANY_DETAILS"),
        },
      ],
    },
    {
      text: "Administration",
      options: [],
    },
    {
      text: "Transactions",
      options: [],
    },
    {
      text: "Display",
      options: [],
    },
    {
      text: "Print/Email/SMS",
      options: [],
    },
    {
      text: "House-Keeping",
      options: [],
    },
    {
      text: "Help",
      options: [],
    },
    {
      text: "Favorites",
      options: [],
    },
  ];
</script>

<main class="flex flex-col gap-4 p-2 h-screen">
  <div class="flex gap-2 flex-wrap">
    <Button onclick={() => (currentView = "HOME")}>Home</Button>
    {#each mainOptions as { text, options }}
      <DropDown {text} {options} />
    {/each}
  </div>
  {#if currentView == "CREATE_COMPANY"}
    <CreateCompany />
  {/if}
  {#if currentView == "COMPANY_DETAILS"}
    <ListCompanies />
  {/if}
  {#if currentView == "HOME"}
    <Home />
  {/if}
</main>
