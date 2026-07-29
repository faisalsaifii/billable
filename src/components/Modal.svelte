<script lang="ts">
  import { onMount } from "svelte";
  import { createFocusTrap } from "../lib/hooks/useFocusTrap";

  let {
    show = $bindable(false),
    title,
    onClose,
    variant = "default",
    children,
  }: {
    show?: boolean;
    title: string;
    onClose?: () => void;
    variant?: "default" | "danger";
    children?: any;
  } = $props();

  let modalElement: HTMLElement;

  onMount(() => {
    if (show && modalElement) {
      const trap = createFocusTrap(modalElement, () => {
        show = false;
        onClose?.();
      });
      return () => trap.destroy();
    }
  });

  $effect(() => {
    if (show && modalElement) {
      const trap = createFocusTrap(modalElement, () => {
        show = false;
        onClose?.();
      });
      return () => trap.destroy();
    }
  });

  const variants = {
    default: {
      border: "border-neutral-700",
      title: "text-white",
    },
    danger: {
      border: "border-red-700/50",
      title: "text-red-400",
    },
  };

  const currentVariant = $derived(variants[variant]);
</script>

{#if show}
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div
      bind:this={modalElement}
      class="bg-neutral-900 border {currentVariant.border} rounded-xl p-8 max-w-md w-full shadow-2xl"
    >
      <h2
        id="modal-title"
        class="text-2xl font-bold {currentVariant.title} mb-4"
      >
        {title}
      </h2>

      {@render children?.()}
    </div>
  </div>
{/if}
