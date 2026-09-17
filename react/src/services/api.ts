import type { CatalogOption, CategoryOption } from "../types/catalog"
import type { Post } from "../types/post"

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"

/**
 * Obtém as opções de catálogo cadastradas no sistema.
 */
async function getCatalogOptions<T extends CatalogOption>(
  endpoint: "categories" | "games",
  signal?: AbortSignal,
): Promise<T[]> {
  const response = await fetch(`${apiUrl}/${endpoint}/`, {
    signal,
  })

  if (!response.ok) {
    throw new Error(`Não foi possível carregar ${endpoint}.`)
  }

  return response.json() as Promise<T[]>
}

/**
 * Obtém as categorias cadastradas no catálogo.
 */
export function getCategories(
  signal?: AbortSignal,
): Promise<CategoryOption[]> {
  return getCatalogOptions(
    "categories",
    signal,
  ) as Promise<CategoryOption[]>
}

/**
 * Obtém os posts publicados exibidos na grade principal.
 */
export async function getPosts({
  search = "",
  signal,
}: GetPostsParams = {}): Promise<Post[]> {
  const params = new URLSearchParams()

  if (search.trim()) {
    params.set("search", search.trim())
  }

  const queryString = params.toString()
  const url = queryString
    ? `${apiUrl}/posts/?${queryString}`
    : `${apiUrl}/posts/`

  const response = await fetch(url, {
    signal,
  })

  if (!response.ok) {
    throw new Error("Não foi possível carregar os posts.")
  }

  return response.json() as Promise<Post[]>
}

/**
 * Obtém os jogos cadastrados no catálogo.
 */
export function getGames(
  signal?: AbortSignal,
): Promise<CatalogOption[]> {
  return getCatalogOptions<CatalogOption>(
    "games",
    signal,
  )
}