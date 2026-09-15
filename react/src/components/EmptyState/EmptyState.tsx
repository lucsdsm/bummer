import {
  LuCircleAlert,
  LuLoaderCircle,
  LuSearchX,
} from "react-icons/lu"

import styles from "./EmptyState.module.css"

type StateVariant = "empty" | "error" | "loading"

interface EmptyStateProps {
  title: string
  description: string
  variant?: StateVariant
}

const stateIcons = {
  empty: LuSearchX,
  error: LuCircleAlert,
  loading: LuLoaderCircle,
}

/**
 * Exibe uma mensagem centralizada para estados sem conteúdo.
 *
 * É reutilizado durante o carregamento, quando não há resultados e quando
 * ocorre uma falha ao consultar o catálogo.
 */
export function EmptyState({
  title,
  description,
  variant = "empty",
}: EmptyStateProps) {
  const Icon = stateIcons[variant]

  return (
    <section
      className={`${styles.wrapper} ${styles[variant]}`}
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? undefined : "polite"}
    >
      <div className={styles.card}>
        <div className={styles.icon} aria-hidden="true">
          <Icon className={variant === "loading" ? styles.spinning : ""} />
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>{title}</h2>

          <p className={styles.description}>{description}</p>
        </div>
      </div>
    </section>
  )
}