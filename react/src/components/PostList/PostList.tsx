import { useEffect, useState } from "react"

import { getPosts } from "../../services/api"

import type { Post } from "../../types/post"
import { PostCard } from "../PostCard/PostCard"
import { PostFeatured } from "../PostFeatured/PostFeatured"
import { EmptyState } from "../EmptyState/EmptyState"
import { ErrorState } from "../ErrorState/ErrorState"
import { LoadingState } from "../LoadingState/LoadingState"

import styles from "./PostList.module.css"

interface PostListProps {
  searchTerm: string
}

/**
 * Busca e exibe posts publicados no catálogo.
 *
 * A lista é atualizada quando o termo de pesquisa é alterado.
 */
export function PostList({ searchTerm }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadPosts() {
      try {
        setIsLoading(true)
        setError(null)

        const data = await getPosts({
          search: searchTerm,
          signal: controller.signal,
        })

        setPosts(data)
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return
        }

        setError("Não foi possível carregar os posts. Tente novamente.")
      } finally {
        setIsLoading(false)
      }
    }

    void loadPosts()

    return () => controller.abort()
  }, [searchTerm])

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        title="Nenhum post encontrado."
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

        <PostFeatured posts={posts} />

        <h2 className={styles.title}>Posts recentes</h2>

        <div className={styles.grid}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}