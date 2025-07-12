<script lang="ts">
  export let onclick;
  export let styles = "";
</script>

<button
  class={`rounded p-1 px-2 cursor-pointer hover:bg-neutral-700 border border-white ${styles}`}
  {onclick}
>
  <slot />
</button>
