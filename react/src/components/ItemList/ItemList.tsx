import { useEffect, useState } from "react"

import { getItems } from "../../services/api"
import type { Item } from "../../types/item"
import { ItemCard } from "../ItemCard/ItemCard"
import styles from "./ItemList.module.css"

interface ItemListProps {
  searchTerm: string
}

/**
 * Busca e exibe itens publicados no catálogo.
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

        setError("Não foi possível carregar os itens. Tente novamente.")
      } finally {
        setIsLoading(false)
      }
    }

    void loadItems()

    return () => controller.abort()
  }, [searchTerm])

  if (isLoading) {
    return (
      <p className={styles.feedback} role="status">
        Carregando itens...
      </p>
    )
  }

  if (error) {
    return (
      <p className={`${styles.feedback} ${styles.error}`} role="alert">
        {error}
      </p>
    )
  }

  if (items.length === 0) {
    return (
      <p className={styles.feedback}>
        Nenhum item encontrado.
      </p>
    )
  }

  return (
    <section className={styles.section} aria-label="Lista de itens">
      <div className={styles.grid}>
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}