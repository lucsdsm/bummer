import { useEffect, useState } from "react"

import type { Post } from "../../types/post"
import styles from "./PostCard.module.css"

interface PostCardProps {
  post: Post
}

const IMAGE_ROTATION_INTERVAL = 5000
const MAX_INITIAL_DELAY = 2500

/**
 * Retorna um atraso inicial aleatório para evitar que vários cards
 * alternem as imagens no mesmo instante.
 */
function getInitialDelay(): number {
  return Math.floor(Math.random() * MAX_INITIAL_DELAY)
}

/**
 * Retorna o próximo índice de forma circular.
 *
 * Exemplo com três imagens:
 * 0 -> 1 -> 2 -> 0
 */
function getNextImageIndex(
  currentIndex: number,
  imageCount: number,
): number {
  return (currentIndex + 1) % imageCount
}

/**
 * Exibe os controles de seleção direta das imagens do post.
 */
interface ImageDotsProps {
  imageCount: number
  activeIndex: number
  onSelect: (index: number) => void
}

function ImageDots({
  imageCount,
  activeIndex,
  onSelect,
}: ImageDotsProps) {
  if (imageCount <= 1) {
    return null
  }

  return (
    <div
      className={styles.imageDots}
      aria-label="Selecionar imagem do post"
    >
      {Array.from({ length: imageCount }, (_, index) => (
        <button
          key={index}
          type="button"
          className={`${styles.imageDot} ${
            index === activeIndex ? styles.imageDotActive : ""
          }`}
          aria-label={`Exibir imagem ${index + 1} de ${imageCount}`}
          aria-current={index === activeIndex ? "true" : undefined}
          onClick={() => onSelect(index)}
        />
      ))}
    </div>
  )
}

/**
 * Exibe um post do catálogo com miniatura e metadados essenciais.
 *
 * Quando existem várias imagens, a miniatura avança automaticamente em
 * sequência e também pode ser alterada pelos dots.
 */
export function PostCard({ post }: PostCardProps) {
  const imageCount = post.images.length
  const [imageIndex, setImageIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    setImageIndex(0)
  }, [post.id, imageCount])

  useEffect(() => {
    if (imageCount <= 1 || isPaused) {
      return
    }

    const initialDelay = getInitialDelay()

    const timeoutId = window.setTimeout(() => {
      setImageIndex((currentIndex) => (
        getNextImageIndex(currentIndex, imageCount)
      ))
    }, initialDelay)

    const intervalId = window.setInterval(() => {
      setImageIndex((currentIndex) => (
        getNextImageIndex(currentIndex, imageCount)
      ))
    }, IMAGE_ROTATION_INTERVAL)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [imageCount, isPaused, post.id])

  function handleImageSelect(index: number) {
    setImageIndex(index)
  }

  const currentImage = post.images[imageIndex]

  return (
    <article className={styles.card}>
      <div
        className={styles.imageWrapper}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={() => setIsPaused(false)}
      >
        {currentImage ? (
          <img
            key={currentImage.id}
            src={currentImage.image_url}
            alt={`Imagem ${imageIndex + 1} de ${imageCount} do post ${post.name}`}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.imageFallback}>
            Sem imagem disponível
          </div>
        )}

        <ImageDots
          imageCount={imageCount}
          activeIndex={imageIndex}
          onSelect={handleImageSelect}
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