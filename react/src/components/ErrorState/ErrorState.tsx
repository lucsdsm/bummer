import { EmptyState } from "../EmptyState/EmptyState"

interface ErrorStateProps {
  message: string
}

/**
 * Exibe uma falha ao carregar dados da API.
 */
export function ErrorState({ message }: ErrorStateProps) {
  return (
    <EmptyState
      variant="error"
      title="Não foi possível carregar os posts."
      description={message}
    />
  )
}