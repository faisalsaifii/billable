<script lang="ts">
  let { name, type, label } = $props();
</script>

<span class="flex gap-2 items-center">
  <label for={name}>{label}</label>
  <input
    class="rounded leading-none border border-white p-1"
    {type}
    id={name}
    {name}
    required
  />
</span>
