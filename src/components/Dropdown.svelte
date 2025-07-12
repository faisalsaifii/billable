<script lang="ts">
  type Option = {
    text: string;
    onclick: () => void;
  };
  let { text = "Button", options }: { text?: string; options: Option[] } =
    $props();
  import Button from "./Button.svelte";
  let showDropdown: boolean = $state(false);
</script>

<div class="relative">
  <Button onclick={() => (showDropdown = !showDropdown)}>
    {text}
  </Button>
  {#if showDropdown}
    <div
      class="absolute border bg-black flex items-center justify-center z-10 flex-col p-2 mt-2 w-fit"
    >
      {#each options as { text, onclick }}
        <Button
          onclick={() => {
            showDropdown = false;
            onclick();
          }}>{text}</Button
        >
      {/each}
      {#if options.length == 0}
        No Options
      {/if}
    </div>
  {/if}
</div>
