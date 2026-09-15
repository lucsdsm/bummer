import { useEffect, useState } from "react"

import { getItems } from "../../services/api"

import type { Item } from "../../types/item"
import { ItemCard } from "../ItemCard/ItemCard"
import { EmptyState } from "../EmptyState/EmptyState"
import { ErrorState } from "../ErrorState/ErrorState"
import { LoadingState } from "../LoadingState/LoadingState"

import styles from "./ItemList.module.css"

interface ItemListProps {
  searchTerm: string
}

/**
 * Busca e exibe posts publicados no catálogo.
 *
 * A lista é atualizada quando o termo de pesquisa é alterado.
 */
export function ItemList({ searchTerm }: ItemListProps) {
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadItems() {
      try {
        setIsLoading(true)
        setError(null)

        const data = await getItems({
          search: searchTerm,
          signal: controller.signal,
        })

        setItems(data)
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return
        }

        setError("Não foi possível carregar os posts. Tente novamente.")
      } finally {
        setIsLoading(false)
      }
    }

    void loadItems()

    return () => controller.abort()
  }, [searchTerm])

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nenhum item encontrado"
        description={
          searchTerm
            ? `Não encontramos resultados para “${searchTerm}”.`
            : "Ainda não há posts publicados no site."
        }
      />
    )
  }

  return (
    <section className={styles.section} aria-label="Lista de posts">
      <div className={styles.catalog}>
        <h2 className={styles.title}>Posts recentes</h2>

        <div className={styles.grid}>
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}