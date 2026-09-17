import type {
  CatalogOption,
  CategoryOption,
} from "../types/catalog"
import type { Post } from "../types/post"

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"

interface GetPostsParams {
  search?: string
  category?: string | null
  game?: string | null
  signal?: AbortSignal
}

export async function getPosts({
  search = "",
  category = null,
  game = null,
  signal,
}: GetPostsParams = {}): Promise<Post[]> {
  const params = new URLSearchParams()

  if (search.trim()) {
    params.set("search", search.trim())
  }

  if (category) {
    params.set("category", category)
  }

  if (game) {
    params.set("game", game)
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

export function getCategories(
  signal?: AbortSignal,
): Promise<CategoryOption[]> {
  return getCatalogOptions<CategoryOption>(
    "categories",
    signal,
  )
}

export function getGames(
  signal?: AbortSignal,
): Promise<CatalogOption[]> {
  return getCatalogOptions<CatalogOption>(
    "games",
    signal,
  )
}