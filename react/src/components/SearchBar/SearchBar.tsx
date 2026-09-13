import type { ChangeEvent } from "react"

import styles from "./SearchBar.module.css"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

/**
 * Campo controlado para pesquisar itens no catálogo.
 *
 * O componente não executa requisições. Ele só comunica o termo ao pai,
 * que repassa o valor para a lista de itens.
 */
export function SearchBar({
  value,
  onChange,
}: SearchBarProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value)
  }

  return (
    <section className={styles.section} aria-label="Pesquisar itens">
      <div className={styles.field}>
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>

        <label className={styles.visuallyHidden} htmlFor="item-search">
          Pesquisar itens
        </label>

        <input
          id="item-search"
          className={styles.input}
          type="search"
          value={value}
          onChange={handleChange}
          placeholder="Pesquise por nome, jogo ou categoria..."
          autoComplete="off"
        />

        {value && (
          <button
            type="button"
            className={styles.clearButton}
            aria-label="Limpar pesquisa"
            onClick={() => onChange("")}
          >
            Limpar
          </button>
        )}
      </div>
    </section>
  )
}