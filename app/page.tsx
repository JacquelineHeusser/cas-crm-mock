// app/page.tsx
import { revalidatePath } from "next/cache";

import { prisma } from './lib/prisma';

// --- Server Actions ---
async function getTodos() {
  return prisma.todoLoeschmich.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createTodo(formData: FormData) {
  "use server";
  const title = (formData.get("title") as string)?.trim();
  if (!title) return;
  await prisma.todoLoeschmich.create({
    data: { title, done: false },
  });
  revalidatePath("/");
}

export async function toggleDone(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const done = formData.get("done") === "true";
  if (!Number.isFinite(id)) return;
  await prisma.todoLoeschmich.update({
    where: { id },
    data: { done },
  });
  revalidatePath("/");
}

// --- Page (Server Component) ---
export default async function Page() {
  const todos = await getTodos();

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Todos</h1>

      {/* Neuer Eintrag */}
      <section className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Neuen Eintrag erstellen</h2>
          <form action={createTodo} className="flex gap-3">
            <input
              name="title"
              type="text"
              placeholder="Titel..."
              className="input input-bordered flex-1"
              required
            />
            <button className="btn btn-primary" type="submit">
              Hinzufügen
            </button>
          </form>
        </div>
      </section>

      {/* Tabelle */}
      <section className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Übersicht</h2>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Titel</th>
                  <th>Status</th>
                  <th>Erstellt</th>
                  <th>Aktion</th>
                </tr>
              </thead>
              <tbody>
                {todos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-base-content/60">
                      Keine Einträge vorhanden.
                    </td>
                  </tr>
                )}

                {todos.map((t) => (
                  <tr key={t.id} className={t.done ? "opacity-60" : ""}>
                    <td>{t.id}</td>
                    <td className={t.done ? "line-through" : ""}>{t.title}</td>
                    <td>
                      {t.done ? (
                        <span className="badge badge-success">Erledigt</span>
                      ) : (
                        <span className="badge badge-warning">Offen</span>
                      )}
                    </td>
                    <td>{new Date(t.createdAt).toLocaleString()}</td>
                    <td>
                      <form action={toggleDone} className="inline">
                        <input type="hidden" name="id" value={t.id} />
                        {/* Wir setzen explizit auf true/false, was der neue Zustand sein soll */}
                        <input type="hidden" name="done" value={(!t.done).toString()} />
                        <button
                          className={`btn btn-sm ${t.done ? "btn-ghost" : "btn-secondary"}`}
                          type="submit"
                          title={t.done ? "Als offen markieren" : "Als erledigt markieren"}
                        >
                          {t.done ? "Reopen" : "Erledigt"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
