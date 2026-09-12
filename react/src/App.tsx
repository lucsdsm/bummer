const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"

export default function App() {
  return (
    <main>
      <h1>Bummer</h1>
      <p className="description">
        Catálogo independente de mods para GTA San Andreas.
      </p>

      <section className="status">
        <span aria-hidden="true" />
        <p>Frontend React + TypeScript ativo</p>
      </section>

      <small>API configurada em: {apiUrl}</small>
    </main>
  )
}
