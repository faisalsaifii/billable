<script lang="ts">
  let {
    onclick,
    onkeydown = undefined,
    styles = "",
    disabled = false,
    variant = "default",
    children,
  } = $props();

  const variants: Record<string, string> = {
    default:
      "bg-neutral-800 border-neutral-600 hover:bg-neutral-700 hover:border-neutral-500 text-white",
    primary: "bg-blue-600 border-blue-500 hover:bg-blue-500 text-white",
    danger: "bg-red-600/20 border-red-600/50 hover:bg-red-600/30 text-red-400",
    ghost:
      "bg-transparent border-transparent hover:bg-neutral-800 text-neutral-300",
  };
</script>

<button
  class={`rounded-lg py-1.5 px-3 cursor-pointer border font-medium text-sm transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent ${variants[variant] || variants.default} ${styles}`}
  {onclick}
  {onkeydown}
  {disabled}
>
  {@render children?.()}
</button>
