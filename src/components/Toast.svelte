<script lang="ts">
  import { toast } from "../lib/stores/toast";
  import { fly } from "svelte/transition";

  $: toasts = $toast;

  function getToastColor(type: "success" | "error" | "info") {
    switch (type) {
      case "success":
        return "bg-green-900/90 border-green-700 text-green-100";
      case "error":
        return "bg-red-900/90 border-red-700 text-red-100";
      case "info":
        return "bg-blue-900/90 border-blue-700 text-blue-100";
    }
  }

  function getIcon(type: "success" | "error" | "info") {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "info":
        return "ℹ";
    }
  }
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
  {#each toasts as toastItem (toastItem.id)}
    <div
      transition:fly={{ x: 300, duration: 300 }}
      class="px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm min-w-[300px] max-w-md flex items-start gap-3 {getToastColor(
        toastItem.type,
      )}"
    >
      <span class="text-xl font-bold flex-shrink-0"
        >{getIcon(toastItem.type)}</span
      >
      <p class="flex-1 text-sm">{toastItem.message}</p>
      <button
        onclick={() => toast.dismiss(toastItem.id)}
        class="flex-shrink-0 hover:opacity-70 transition-opacity"
        aria-label="Dismiss"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  {/each}
</div>
