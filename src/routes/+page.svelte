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
  import KeyboardShortcuts from "../components/KeyboardShortcuts.svelte";
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
  let showShortcuts = $state(false);

  // Keyboard shortcuts handler
  function handleKeydown(e: KeyboardEvent) {
    const isCtrlOrAlt = e.ctrlKey || e.altKey;

    // F1 - Show keyboard shortcuts help
    if (e.key === "F1") {
      e.preventDefault();
      showShortcuts = true;
      return;
    }

    // Only process shortcuts if company is open (except F1)
    if (!isCompanyOpen) return;

    // Alt/Ctrl + Letter shortcuts
    if (isCtrlOrAlt) {
      switch (e.key.toLowerCase()) {
        case "f":
          e.preventDefault();
          currentView = "CONFIGURATION";
          activeSubmenu = "Configuration";
          break;
        case "m":
          e.preventDefault();
          currentView = "MASTERS";
          activeSubmenu = "Masters";
          break;
        case "u":
          e.preventDefault();
          currentView = "UTILITIES";
          activeSubmenu = "Utilities";
          break;
        case "l":
          e.preventDefault();
          currentView = "DISPLAY";
          activeSubmenu = "Account Ledger";
          break;
        case "g":
          e.preventDefault();
          currentView = "DISPLAY";
          activeSubmenu = "Item Ledger";
          break;
        case "t":
          e.preventDefault();
          currentView = "DISPLAY";
          activeSubmenu = "Trial Balance";
          break;
        case "b":
          e.preventDefault();
          currentView = "DISPLAY";
          activeSubmenu = "Balance Sheet";
          break;
        case "s":
          e.preventDefault();
          currentView = "DISPLAY";
          activeSubmenu = "Stock Status";
          break;
        case "a":
          e.preventDefault();
          currentView = "DISPLAY";
          activeSubmenu = "Accounts Monthly Summary";
          break;
        case "i":
          e.preventDefault();
          currentView = "DISPLAY";
          activeSubmenu = "Item Monthly Summary";
          break;
        case "e":
          e.preventDefault();
          currentView = "DATA_MANAGEMENT";
          activeSubmenu = "Data Management";
          break;
        case "n":
          e.preventDefault();
          // Notes Manager - placeholder
          console.log("Notes Manager shortcut");
          break;
        case "q":
          e.preventDefault();
          // Query on Transactions - placeholder
          console.log("Query on Transactions shortcut");
          break;
      }

      // Alt/Ctrl + Function keys for vouchers
      if (e.key.startsWith("F")) {
        switch (e.key) {
          case "F1":
            e.preventDefault();
            currentView = "MASTERS";
            activeSubmenu = "Masters";
            // Add New Account - placeholder
            break;
          case "F2":
            e.preventDefault();
            currentView = "MASTERS";
            activeSubmenu = "Masters";
            // Add Item - placeholder
            break;
          case "F3":
            e.preventDefault();
            currentView = "TRANSACTIONS";
            activeSubmenu = "Sales";
            break;
          case "F5":
            e.preventDefault();
            currentView = "TRANSACTIONS";
            activeSubmenu = "Payment";
            break;
          case "F6":
            e.preventDefault();
            currentView = "TRANSACTIONS";
            activeSubmenu = "Receipt";
            break;
          case "F7":
            e.preventDefault();
            currentView = "TRANSACTIONS";
            activeSubmenu = "Journal";
            break;
          case "F8":
            e.preventDefault();
            currentView = "TRANSACTIONS";
            activeSubmenu = "Sales";
            break;
          case "F9":
            e.preventDefault();
            currentView = "TRANSACTIONS";
            activeSubmenu = "Purchase";
            break;
        }
      }
    }

    // Alt only shortcuts
    if (e.altKey && !e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case "v":
          e.preventDefault();
          currentView = "DISPLAY";
          activeSubmenu = "VAT Summary";
          break;
        case "p":
          e.preventDefault();
          // Show Pending Batches - placeholder
          console.log("Show Pending Batches shortcut");
          break;
        case "r":
          e.preventDefault();
          // Repeat last value - placeholder for form context
          console.log("Repeat last value shortcut");
          break;
      }
    }

    // Ctrl only shortcuts
    if (e.ctrlKey && !e.altKey) {
      if (e.key.toLowerCase() === "d") {
        e.preventDefault();
        // Batch Deletion - placeholder
        console.log("Batch Deletion shortcut");
      }
    }

    // Function keys without modifiers (for form contexts)
    if (!isCtrlOrAlt) {
      switch (e.key) {
        case "F5":
          // List of Records - context dependent
          break;
        case "F10":
          e.preventDefault();
          // Calculator - placeholder
          console.log("Calculator shortcut");
          break;
      }
    }
  }

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
        activeSubmenu,
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

<svelte:window onkeydown={handleKeydown} />

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

    <!-- Spacer to push help button to the right -->
    <div class="flex-1"></div>

    <!-- Help button -->
    <Button
      onclick={() => (showShortcuts = true)}
      variant="ghost"
      class="gap-2"
      title="Keyboard Shortcuts (F1)"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </Button>
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

    {#if currentView == "DISPLAY"}
      <Display {activeSubmenu} />
    {/if}

    {#if currentView == "DATA_MANAGEMENT"}
      <DataManagement />
    {/if}
  </div>

  <!-- Keyboard Shortcuts Modal -->
  <KeyboardShortcuts bind:show={showShortcuts} />
</main>
