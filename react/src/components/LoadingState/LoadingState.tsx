import { EmptyState } from "../EmptyState/EmptyState"

/**
 * Exibe o estado de carregamento da lista de posts.
 */
export function LoadingState() {
  return (
    <EmptyState
      variant="loading"
      title="Carregando posts..."
      description="Buscando conteúdo no catálogo."
    />
  )
}