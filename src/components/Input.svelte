<script lang="ts">
  interface Props {
    name: string;
    type: string;
    label: string;
    value?: string | number;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    maxlength?: number;
    step?: string;
    min?: string;
    max?: string;
    class?: string;
    onchange?: (e: Event) => void;
  }

  let {
    name,
    type,
    label,
    value = $bindable(""),
    required = false,
    disabled = false,
    placeholder = "",
    maxlength,
    step,
    min,
    max,
    class: className = "",
    onchange,
  }: Props = $props();
</script>

<div class="flex flex-col gap-1.5">
  <label for={name} class="text-sm font-medium text-neutral-300"
    >{label}{#if required}<span class="text-red-400 ml-0.5">*</span>{/if}</label
  >
  <input
    class="rounded-lg border border-neutral-600 px-3 py-2 bg-neutral-900 text-white placeholder:text-neutral-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 {className}"
    {type}
    id={name}
    {name}
    bind:value
    {required}
    {disabled}
    {placeholder}
    {maxlength}
    {step}
    {min}
    {max}
    {onchange}
  />
</div>
