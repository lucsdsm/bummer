import type { Item } from "../types/item"

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"

/**
 * Obtém os itens publicados no catálogo.
 *
 * @param signal Sinal opcional para cancelar a requisição quando necessário.
 */
export async function getItems(
  signal?: AbortSignal,
): Promise<Item[]> {
  const response = await fetch(`${apiUrl}/items/`, {
    signal,
  })

  if (!response.ok) {
    throw new Error("Não foi possível carregar os itens.")
  }

  return response.json() as Promise<Item[]>
}