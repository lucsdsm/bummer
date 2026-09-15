import { useEffect, useState } from "react"
import { LuArrowUpRight, LuSparkles } from "react-icons/lu"

import type { Post } from "../../types/post"
import styles from "./PostFeatured.module.css"

interface PostFeaturedProps {
  posts: Post[]
}

/**
 * Retorna um índice aleatório válido dentro de uma lista.
 */
function getRandomIndex(length: number): number {
  return Math.floor(Math.random() * length)
}

/**
 * Exibe um post aleatório como destaque acima da lista principal.
 *
 * O post destacado é recalculado apenas quando a coleção de posts muda.
 */
export function PostFeatured({ posts }: PostFeaturedProps) {
  const [PostFeatured, setPostFeatured] = useState<Post | null>(null)

  useEffect(() => {
    if (posts.length === 0) {
      setPostFeatured(null)
      return
    }

    setPostFeatured(posts[getRandomIndex(posts.length)])
  }, [posts])

  if (!PostFeatured) {
    return null
  }

  const coverImage = PostFeatured.images[0]

  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        {coverImage ? (
          <img
            src={coverImage.image_url}
            alt={`Imagem de exemplo do post em destaque ${PostFeatured.name}`}
            className={styles.image}
          />
        ) : (
          <div className={styles.imageFallback}>
            Sem imagem disponível
          </div>
        )}

        <div className={styles.imageOverlay} />

        <div className={styles.badge}>
          <LuSparkles aria-hidden="true" />
          <span>Em destaque</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.metadata}>
          <span>{PostFeatured.category}</span>
          <span aria-hidden="true">•</span>
          <span>{PostFeatured.game}</span>
        </div>

        <h2 className={styles.title}>{PostFeatured.name}</h2>

        {PostFeatured.description && (
          <p className={styles.description}>
            {PostFeatured.description}
          </p>
        )}

        <button
          type="button"
          className={styles.action}
          aria-label={`Ver detalhes de ${PostFeatured.name}`}
        >
          Ver post
          <LuArrowUpRight aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}