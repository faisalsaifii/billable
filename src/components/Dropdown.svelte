<script lang="ts">
  import Button from "./Button.svelte";

  type Option = {
    text: string;
    onclick: () => void;
  };
  let {
    text = "Button",
    options,
    disabled = false,
    activeOption = "",
  }: {
    text?: string;
    options: Option[];
    disabled?: boolean;
    activeOption?: string;
  } = $props();

  let showDropdown: boolean = $state(false);
  let focusedIndex: number = $state(-1);
  let dropdownRef: HTMLDivElement | null = $state(null);

  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      showDropdown = false;
      focusedIndex = -1;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!showDropdown) {
      if (
        event.key === "Enter" ||
        event.key === " " ||
        event.key === "ArrowDown"
      ) {
        event.preventDefault();
        showDropdown = true;
        focusedIndex = 0;
      }
      return;
    }

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        showDropdown = false;
        focusedIndex = -1;
        break;
      case "ArrowDown":
        event.preventDefault();
        focusedIndex = (focusedIndex + 1) % options.length;
        break;
      case "ArrowUp":
        event.preventDefault();
        focusedIndex =
          focusedIndex <= 0 ? options.length - 1 : focusedIndex - 1;
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          options[focusedIndex].onclick();
          showDropdown = false;
          focusedIndex = -1;
        }
        break;
      case "Tab":
        showDropdown = false;
        focusedIndex = -1;
        break;
    }
  }

  $effect(() => {
    if (showDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  });
</script>

<div class="relative" bind:this={dropdownRef}>
  <Button
    onclick={() => {
      showDropdown = !showDropdown;
      if (showDropdown) focusedIndex = 0;
    }}
    {disabled}
    onkeydown={handleKeydown}
    aria-haspopup="true"
    aria-expanded={showDropdown}
  >
    {text}
    <span class="ml-1 text-xs" aria-hidden="true"
      >{showDropdown ? "▲" : "▼"}</span
    >
  </Button>
  {#if showDropdown && !disabled}
    <div
      class="absolute border border-neutral-700 bg-neutral-900 flex items-stretch z-50 flex-col p-1.5 mt-2 min-w-max rounded-lg shadow-xl shadow-black/40"
      role="menu"
      aria-label="{text} menu"
    >
      {#each options as option, index}
        <button
          class="text-left px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors duration-100
            {focusedIndex === index ? 'bg-neutral-700' : 'hover:bg-neutral-800'}
            {activeOption === option.text
            ? 'text-blue-400 font-medium'
            : 'text-neutral-200'}"
          role="menuitem"
          tabindex={focusedIndex === index ? 0 : -1}
          aria-current={activeOption === option.text ? "true" : undefined}
          onclick={() => {
            showDropdown = false;
            focusedIndex = -1;
            option.onclick();
          }}
          onmouseenter={() => (focusedIndex = index)}
        >
          {#if activeOption === option.text}
            <span class="mr-1.5 text-blue-400" aria-hidden="true">•</span>
          {/if}
          {option.text}
        </button>
      {/each}
      {#if options.length == 0}
        <span class="px-3 py-1.5 text-gray-500 text-sm" role="menuitem"
          >No options</span
        >
      {/if}
    </div>
  {/if}
</div>
