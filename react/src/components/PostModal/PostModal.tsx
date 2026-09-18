import { useEffect, useId, useState } from "react"
import { FiChevronLeft, FiChevronRight, FiDownload, FiX, } from "react-icons/fi"

import type { Post } from "../../types/post"
import styles from "./PostModal.module.css"

interface PostModalProps {
  post: Post
  onClose: () => void
}

function getNextIndex(
  currentIndex: number,
  imageCount: number,
): number {
  return (currentIndex + 1) % imageCount
}

function getPreviousIndex(
  currentIndex: number,
  imageCount: number,
): number {
  return (currentIndex - 1 + imageCount) % imageCount
}

function formatDate(dateValue: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue))
}

export function PostModal({
  post,
  onClose,
}: PostModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const titleId = useId()
  const descriptionId = useId()

  const images = post.images ?? []
  const activeImage = images[activeImageIndex]
  const hasMultipleImages = images.length > 1

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }

      if (event.key === "ArrowRight" && hasMultipleImages) {
        setActiveImageIndex((currentIndex) =>
          getNextIndex(currentIndex, images.length),
        )
      }

      if (event.key === "ArrowLeft" && hasMultipleImages) {
        setActiveImageIndex((currentIndex) =>
          getPreviousIndex(currentIndex, images.length),
        )
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [
    hasMultipleImages,
    images.length,
    onClose,
  ])

  function handleOverlayClick(
    event: React.MouseEvent<HTMLDivElement>,
  ) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  function showNextImage() {
    setActiveImageIndex((currentIndex) =>
      getNextIndex(currentIndex, images.length),
    )
  }

  function showPreviousImage() {
    setActiveImageIndex((currentIndex) =>
      getPreviousIndex(currentIndex, images.length),
    )
  }

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={handleOverlayClick}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >

        <div className={styles.gallery}>
          {activeImage ? (
            <img
              key={activeImage.id}
              className={styles.image}
              src={activeImage.image_url}
              alt={`Imagem ${activeImageIndex + 1} de ${post.name}`}
            />
          ) : (
            <div className={styles.imageFallback}>
              Este post não possui imagens.
            </div>
          )}

          {hasMultipleImages && (
            <>
              <div className={styles.imageDots}>
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    className={`${styles.imageDot} ${
                      index === activeImageIndex
                        ? styles.imageDotActive
                        : ""
                    }`}
                    aria-label={`Mostrar imagem ${index + 1}`}
                    aria-pressed={index === activeImageIndex}
                    onClick={() => setActiveImageIndex(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.metadata}>
            <span>{post.category}</span>

            {post.subcategory && (
              <>
                <span aria-hidden="true">/</span>
                <span>{post.subcategory}</span>
              </>
            )}

            {post.game && (
              <>
                <span aria-hidden="true">/</span>
                <span>{post.game}</span>
              </>
            )}
          </div>

          <h2 id={titleId} className={styles.title}>
            {post.name}
          </h2>

          <p id={descriptionId} className={styles.description}>
            {post.description}
          </p>

          <dl className={styles.details}>
            <div className={styles.detail}>
              <dt>Categoria</dt>
              <dd>{post.category}</dd>
            </div>

            {post.subcategory && (
              <div className={styles.detail}>
                <dt>Subcategoria</dt>
                <dd>{post.subcategory}</dd>
              </div>
            )}

            {post.game && (
              <div className={styles.detail}>
                <dt>Jogo</dt>
                <dd>{post.game}</dd>
              </div>
            )}

            <div className={styles.detail}>
              <dt>Publicado em</dt>
              <dd>{formatDate(post.created_at)}</dd>
            </div>

            <div className={styles.detail}>
              <dt>Atualizado em</dt>
              <dd>{formatDate(post.updated_at)}</dd>
            </div>
          </dl>

          <a
            className={styles.downloadButton}
            href={post.download_url}
            target="_blank"
            rel="noreferrer"
          >
            <FiDownload aria-hidden="true" />
            Download
          </a>
        </div>
      </section>
    </div>
  )
}