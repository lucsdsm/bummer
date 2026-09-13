import type { Item } from "../../types/item"
import styles from "./ItemCard.module.css"

interface ItemCardProps {
  item: Item
}

/**
 * Exibe um item do catálogo com miniatura e metadados essenciais.
 *
 * A estrutura é preparada para receber interação futura, como a abertura
 * de um modal de detalhes ao selecionar o card.
 */
export function ItemCard({ item }: ItemCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={item.image_url}
          alt={`Imagem de exemplo do item ${item.name}`}
          className={styles.image}
          loading="lazy"
        />
      </div>

      <div className={styles.content}>
        <p className={styles.metadata}>
          {item.category}
        </p>

        <p className={styles.metadata}>
          {item.game}
        </p>

        <h2 className={styles.title}>{item.name}</h2>

        {item.description && (
          <p className={styles.description}>{item.description}</p>
        )}
      </div>
    </article>
  )
}