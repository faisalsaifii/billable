<script lang="ts">
  import Database from "@tauri-apps/plugin-sql";
  import Input from "./Input.svelte";

  let handleSubmit = async (event: Event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const companyName = (form.companyName as HTMLInputElement).value;
    const country = (form.country as HTMLInputElement).value;

    if (!companyName) {
      alert("Please enter a company name.");
      return;
    }

    try {
      const db = await Database.load("sqlite:billable.db");

      await db.execute(`
        CREATE TABLE IF NOT EXISTS companies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          country TEXT
        );
      `);

      await db.execute("INSERT INTO companies (name) VALUES (?1)", [
        companyName,
        country,
      ]);

      alert("Company added!");
    } catch (err) {
      console.error("DB Error:", err);
      alert("Failed to add company.");
    }
  };
</script>

<form
  onsubmit={handleSubmit}
  class="flex flex-col gap-2 p-4 border border-white max-w-3xl"
>
  <h1 class="font-bold text-center text-xl mb-4">Create Company</h1>
  <span class="flex gap-2 items-center">
    <label for="companyName">Name</label>
    <input
      class="rounded leading-none border border-white p-1"
      type="text"
      id="companyName"
      name="companyName"
      required
    />
  </span>
  <Input name="country" label="Country" type="text" />
  <button
    type="submit"
    class="p-1 px-2 cursor-pointer mt-4 hover:bg-neutral-700 border border-white"
  >
    Create Company
  </button>
</form>
