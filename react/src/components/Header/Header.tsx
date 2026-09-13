import { useEffect, useRef, useState } from "react"

import { getCategories, getGames } from "../../services/api"
import type { CatalogOption } from "../../types/catalog"
import styles from "./Header.module.css"

import {
  SiGithub,
  SiInstagram,
  SiYoutube,
} from "react-icons/si"

type MenuName = "categories" | "games" | null

interface HeaderMenuProps {
  label: string
  items: CatalogOption[]
  isOpen: boolean
  isLoading: boolean
  error: string | null
  onClick: () => void
}

/**
 * Exibe um menu suspenso de leitura do catálogo.
 *
 * Os itens listados não possuem navegação nesta etapa; eles apenas refletem
 * os jogos e categorias que foram cadastrados no Django Admin.
 */
function HeaderMenu({
  label,
  items,
  isOpen,
  isLoading,
  error,
  onClick,
}: HeaderMenuProps) {
  return (
    <div className={styles.menu}>
      <button
        type="button"
        className={styles.menuButton}
        aria-expanded={isOpen}
        onClick={onClick}
      >
        {label}
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="menu">
          {isLoading && (
            <p className={styles.dropdownFeedback}>Carregando...</p>
          )}

          {error && (
            <p className={styles.dropdownError} role="alert">
              {error}
            </p>
          )}

          {!isLoading && !error && items.length === 0 && (
            <p className={styles.dropdownFeedback}>
              Nenhum registro encontrado.
            </p>
          )}

          {!isLoading &&
            !error &&
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={styles.dropdownItem}
              >
                {item.name}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}

/**
 * Cabeçalho principal da aplicação.
 *
 * Busca jogos e categorias uma vez ao montar e exibe cada coleção em um
 * menu suspenso, sem alterar a página ao selecionar uma opção.
 */
export function Header() {
  const [categories, setCategories] = useState<CatalogOption[]>([])
  const [games, setGames] = useState<CatalogOption[]>([])
  const [openMenu, setOpenMenu] = useState<MenuName>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadHeaderData() {
      try {
        const [categoriesData, gamesData] = await Promise.all([
          getCategories(controller.signal),
          getGames(controller.signal),
        ])

        setCategories(categoriesData)
        setGames(gamesData)
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return
        }

        setError("Não foi possível carregar o catálogo.")
      } finally {
        setIsLoading(false)
      }
    }

    void loadHeaderData()

    return () => controller.abort()
  }, [])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenu(null)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  function toggleMenu(menu: Exclude<MenuName, null>) {
    setOpenMenu((currentMenu) => (
      currentMenu === menu ? null : menu
    ))
  }

  return (
    <header className={styles.header} ref={headerRef}>
      <div className={styles.content}>
        <a className={styles.logo} href="/" aria-label="Bummer, página inicial">
            <img
                src="/branding/bummer.webp"
                alt=""
                className={styles.logoImage}
            />
        </a>
        <span className={styles.logoName}>Bummer</span>

        <nav
            className={styles.socialNavigation}
            aria-label="Links sociais"
            >
            <a
                className={styles.socialLink}
                href="https://github.com/lucsdsm"
                target="_blank"
                rel="noopener noreferrer"
            >
                <SiGithub />
            </a>

            <a
                className={styles.socialLink}
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
            >
                <SiInstagram />
            </a>

            <a
                className={styles.socialLink}
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
            >
                <SiYoutube />
            </a>
        </nav>

        <nav className={styles.navigation} aria-label="Navegação do catálogo">
          <HeaderMenu
            label="Categorias"
            items={categories}
            isOpen={openMenu === "categories"}
            isLoading={isLoading}
            error={error}
            onClick={() => toggleMenu("categories")}
          />

          <HeaderMenu
            label="Jogos"
            items={games}
            isOpen={openMenu === "games"}
            isLoading={isLoading}
            error={error}
            onClick={() => toggleMenu("games")}
          />
        </nav>
      </div>
    </header>
  )
}