<script lang="ts">
  import Button from "../components/Button.svelte";
  import CreateCompany from "../components/CreateCompany.svelte";
  import DropDown from "../components/Dropdown.svelte";
  import Home from "../components/Home.svelte";
  import ListCompanies from "../components/ListCompanies.svelte";
  import CompanyStatus from "../components/CompanyStatus.svelte";
  import Masters from "../components/Masters.svelte";
  import Configuration from "../components/Configuration.svelte";
  import Transactions from "../components/Transactions.svelte";
  import Display from "../components/Display.svelte";
  import Printing from "../components/Printing.svelte";
  import DataManagement from "../components/DataManagement.svelte";
  import { session } from "../lib/stores/session";

  type View =
    | "CREATE_COMPANY"
    | "COMPANY_DETAILS"
    | "HOME"
    | "COMPANY_OPEN"
    | "CONFIGURATION"
    | "MASTERS"
    | "UTILITIES"
    | "TRANSACTIONS"
    | "DISPLAY"
    | "PRINTING"
    | "DATA_MANAGEMENT";
  let currentView: View = $state("HOME");

  let isCompanyOpen = $state(false);
  let activeSubmenu: string = $state("");

  $effect(() => {
    const unsub = session.subscribe((s) => {
      isCompanyOpen = s.companyId !== null;
      if (isCompanyOpen) {
        currentView = "COMPANY_OPEN";
      } else {
        currentView = "HOME";
        activeSubmenu = "";
      }
    });
    return unsub;
  });

  let mainOptions = $derived([
    {
      text: "Company",
      activeOption: ["Create Company", "Open Company"].includes(activeSubmenu)
        ? activeSubmenu
        : "",
      options: [
        {
          text: "Create Company",
          onclick: () => {
            currentView = "CREATE_COMPANY";
            activeSubmenu = "Create Company";
          },
        },
        {
          text: "Open Company",
          onclick: () => {
            currentView = "COMPANY_DETAILS";
            activeSubmenu = "Open Company";
          },
        },
        ...(isCompanyOpen
          ? [
              {
                text: "Close Company",
                onclick: () => {
                  session.closeCompany();
                  activeSubmenu = "";
                },
              },
            ]
          : []),
      ],
    },
    {
      text: "Administration",
      activeOption: ["Configuration", "Masters", "Utilities"].includes(
        activeSubmenu
      )
        ? activeSubmenu
        : "",
      options: isCompanyOpen
        ? [
            {
              text: "Configuration",
              onclick: () => {
                currentView = "CONFIGURATION";
                activeSubmenu = "Configuration";
              },
            },
            {
              text: "Masters",
              onclick: () => {
                currentView = "MASTERS";
                activeSubmenu = "Masters";
              },
            },
            {
              text: "Utilities",
              onclick: () => {
                currentView = "UTILITIES";
                activeSubmenu = "Utilities";
              },
            },
          ]
        : [],
    },
    {
      text: "Transactions",
      activeOption: [
        "Sales",
        "Sales Return",
        "Purchase",
        "Purchase Return",
        "Payment",
        "Receipt",
        "Journal",
        "Contra",
        "Debit Note",
        "Credit Note",
        "Stock Transfer",
        "Forms Received",
        "Forms Issued",
        "VAT Journal",
      ].includes(activeSubmenu)
        ? activeSubmenu
        : "",
      options: isCompanyOpen
        ? [
            {
              text: "Sales",
              onclick: () => {
                currentView = "TRANSACTIONS";
                activeSubmenu = "Sales";
              },
            },
            {
              text: "Sales Return",
              onclick: () => {
                currentView = "TRANSACTIONS";
                activeSubmenu = "Sales Return";
              },
            },
            {
              text: "Purchase",
              onclick: () => {
                currentView = "TRANSACTIONS";
                activeSubmenu = "Purchase";
              },
            },
            {
              text: "Purchase Return",
              onclick: () => {
                currentView = "TRANSACTIONS";
                activeSubmenu = "Purchase Return";
              },
            },
            {
              text: "Payment",
              onclick: () => {
                currentView = "TRANSACTIONS";
                activeSubmenu = "Payment";
              },
            },
            {
              text: "Receipt",
              onclick: () => {
                currentView = "TRANSACTIONS";
                activeSubmenu = "Receipt";
              },
            },
            {
              text: "Journal",
              onclick: () => {
                currentView = "TRANSACTIONS";
                activeSubmenu = "Journal";
              },
            },
            {
              text: "Contra",
              onclick: () => {
                currentView = "TRANSACTIONS";
                activeSubmenu = "Contra";
              },
            },
            {
              text: "Debit Note",
              onclick: () => {
                currentView = "TRANSACTIONS";
                activeSubmenu = "Debit Note";
              },
            },
            {
              text: "Credit Note",
              onclick: () => {
                currentView = "TRANSACTIONS";
                activeSubmenu = "Credit Note";
              },
            },
            {
              text: "Stock Transfer",
              onclick: () => {
                currentView = "TRANSACTIONS";
                activeSubmenu = "Stock Transfer";
              },
            },
            {
              text: "Forms Received",
              onclick: () => {
                currentView = "TRANSACTIONS";
                activeSubmenu = "Forms Received";
              },
            },
            {
              text: "Forms Issued",
              onclick: () => {
                currentView = "TRANSACTIONS";
                activeSubmenu = "Forms Issued";
              },
            },
            {
              text: "VAT Journal",
              onclick: () => {
                currentView = "TRANSACTIONS";
                activeSubmenu = "VAT Journal";
              },
            },
          ]
        : [],
    },
    {
      text: "Display",
      activeOption: [
        "Trial Balance",
        "Account Ledger",
        "Stock Status",
      ].includes(activeSubmenu)
        ? activeSubmenu
        : "",
      options: isCompanyOpen
        ? [
            {
              text: "Trial Balance",
              onclick: () => {
                currentView = "DISPLAY";
                activeSubmenu = "Trial Balance";
              },
            },
            {
              text: "Account Ledger",
              onclick: () => {
                currentView = "DISPLAY";
                activeSubmenu = "Account Ledger";
              },
            },
            {
              text: "Stock Status",
              onclick: () => {
                currentView = "DISPLAY";
                activeSubmenu = "Stock Status";
              },
            },
          ]
        : [],
    },
    {
      text: "Print/Email/SMS",
      activeOption: activeSubmenu === "Printing" ? "Printing" : "",
      options: isCompanyOpen
        ? [
            {
              text: "Printing",
              onclick: () => {
                currentView = "PRINTING";
                activeSubmenu = "Printing";
              },
            },
          ]
        : [],
    },
    {
      text: "House-Keeping",
      activeOption:
        activeSubmenu === "Data Management" ? "Data Management" : "",
      options: isCompanyOpen
        ? [
            {
              text: "Data Management",
              onclick: () => {
                currentView = "DATA_MANAGEMENT";
                activeSubmenu = "Data Management";
              },
            },
          ]
        : [],
    },
  ]);
</script>

<main class="flex flex-col h-screen bg-[#0a0a0a]">
  <nav
    class="flex items-center gap-1 px-3 py-2 bg-neutral-900/80 border-b border-neutral-800 backdrop-blur-sm"
  >
    <Button
      onclick={() => {
        currentView = "HOME";
        activeSubmenu = "";
      }}
      variant="ghost">Home</Button
    >
    <div class="w-px h-5 bg-neutral-700 mx-1"></div>
    {#each mainOptions as { text, options, activeOption }}
      <DropDown
        {text}
        {options}
        {activeOption}
        disabled={text !== "Company" && text !== "Help" && !isCompanyOpen}
      />
    {/each}
  </nav>

  <div class="flex-1 overflow-auto">
    {#if currentView == "CREATE_COMPANY"}
      <CreateCompany />
    {/if}

    {#if currentView == "COMPANY_DETAILS"}
      <ListCompanies />
    {/if}

    {#if currentView == "COMPANY_OPEN"}
      <CompanyStatus onClose={() => (currentView = "HOME")} />
    {/if}

    {#if currentView == "HOME"}
      <Home />
    {/if}

    {#if currentView == "CONFIGURATION"}
      <Configuration />
    {/if}

    {#if currentView == "MASTERS"}
      <Masters />
    {/if}

    {#if currentView == "UTILITIES"}
      <div class="p-8">
        <h1 class="text-2xl font-bold text-white">Utilities</h1>
        <p class="text-neutral-500 mt-4">Utility features coming soon...</p>
      </div>
    {/if}

    {#if currentView == "TRANSACTIONS"}
      <Transactions />
    {/if}

    {#if currentView == "PRINTING"}
      <Printing />
    {/if}

    {#if currentView == "DATA_MANAGEMENT"}
      <DataManagement />
    {/if}
  </div>
</main>
