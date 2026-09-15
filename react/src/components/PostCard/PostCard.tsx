import type { Post } from "../../types/post"
import styles from "./PostCard.module.css"

interface PostCardProps {
  post: Post
}

/**
 * Exibe um post do catálogo com miniatura e metadados essenciais.
 *
 * A estrutura é preparada para receber interação futura, como a abertura
 * de um modal de detalhes ao selecionar o card.
 */
export function PostCard({ post }: PostCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={post.image_url}
          alt={`Imagem de exemplo do post ${post.name}`}
          className={styles.image}
          loading="lazy"
        />
      </div>

      <div className={styles.content}>
        <p className={styles.metadata}>
          {post.category}
        </p>

        <p className={styles.metadata}>
          {post.game}
        </p>

        <h2 className={styles.title}>{post.name}</h2>

        {post.description && (
          <p className={styles.description}>{post.description}</p>
        )}
      </div>
    </article>
  )
}