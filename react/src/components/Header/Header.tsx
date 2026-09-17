import { useEffect, useRef, useState } from "react"
import {
  SiGithub,
  SiInstagram,
  SiYoutube,
} from "react-icons/si"

import { SearchBar } from "../SearchBar/SearchBar"
import { getCategories, getGames } from "../../services/api"
import type { CatalogOption, CategoryOption } from "../../types/catalog"
import styles from "./Header.module.css"

type MenuName = "categories" | "games" | null

interface HeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
}

interface HeaderMenuProps {
  label: string
  items: Array<CatalogOption | CategoryOption>
  isOpen: boolean
  isLoading: boolean
  error: string | null
  selectedSlug: string | null
  onClick: () => void
  onSelect: (slug: string | null) => void
}

/**
 * Exibe um dropdown com opções cadastradas no catálogo.
 */
function hasChildren(
  item: CatalogOption | CategoryOption,
): item is CategoryOption {
  return "children" in item && item.children.length > 0
}

function HeaderMenu({
  label,
  items,
  isOpen,
  isLoading,
  error,
  selectedSlug,
  onClick,
  onSelect,
}: HeaderMenuProps) {
  function handleSelect(slug: string | null) {
    onSelect(slug)
  }

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
            <p className={styles.dropdownFeedback}>
              Carregando...
            </p>
          )}

          {error && (
            <p className={styles.dropdownError} role="alert">
              {error}
            </p>
          )}

          {!isLoading && !error && items.length === 0 && (
            <p className={styles.dropdownFeedback}>
              Nada registrado aqui ainda.
            </p>
          )}

          {!isLoading && !error && items.length > 0 && (
            <button
              type="button"
              className={`${styles.dropdownItem} ${
                selectedSlug === null ? styles.dropdownItemActive : ""
              }`}
              onClick={() => handleSelect(null)}
            >
              All
            </button>
          )}

          {!isLoading &&
            !error &&
            items.map((item) => (
              <div key={item.id} className={styles.dropdownGroup}>
                <button
                  type="button"
                  className={`${styles.dropdownItem} ${
                    selectedSlug === item.slug
                      ? styles.dropdownItemActive
                      : ""
                  }`}
                  onClick={() => handleSelect(item.slug)}
                >
                  {item.name}
                </button>

                {hasChildren(item) && (
                  <div className={styles.submenu}>
                    {item.children.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        className={`${styles.submenuItem} ${
                          selectedSlug === child.slug
                            ? styles.submenuItemActive
                            : ""
                        }`}
                        onClick={() => handleSelect(child.slug)}
                      >
                        {child.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

/**
 * Cabeçalho principal do Bummer.
 *
 * O termo de busca pertence ao App porque é compartilhado entre SearchBar
 * e PostList. O Header apenas recebe e atualiza esse valor por props.
 */
export function Header({
  searchTerm,
  onSearchChange,
  selectedCategorySlug,
  selectedGameSlug,
  onCategorySelect,
  onGameSelect,
}: HeaderProps) {
  const [categories, setCategories] = useState<CategoryOption[]>([])
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

        setError("Não foi possível carregar os dados.")
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

  function handleCategorySelect(slug: string | null) {
    onCategorySelect(slug)
    setOpenMenu(null)
  }

  function handleGameSelect(slug: string | null) {
    onGameSelect(slug)
    setOpenMenu(null)
  }

  return (
    <header className={styles.header} ref={headerRef}>
      <div className={styles.catalogContainer}>
        <div className={styles.topbar}>
          <a
            className={styles.logo}
            href="/"
            aria-label="Bummer, página inicial"
          >
            <img
              src="/branding/bummer.webp"
              alt=""
              className={styles.logoImage}
            />

            <span className={styles.logoName}>Bummer</span>
          </a>

          <div className={styles.search}>
            <SearchBar
              value={searchTerm}
              onChange={onSearchChange}
            />
          </div>

          <nav
            className={styles.socialNavigation}
            aria-label="Links sociais"
          >
            <a
              className={styles.socialLink}
              href="https://github.com/lucsdsm"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub de Lucas Eduardo dos Santos"
              title="GitHub"
            >
              <SiGithub aria-hidden="true" />
            </a>

            <a
              className={styles.socialLink}
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
            >
              <SiInstagram aria-hidden="true" />
            </a>

            <a
              className={styles.socialLink}
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              title="YouTube"
            >
              <SiYoutube aria-hidden="true" />
            </a>
          </nav>
        </div>

        <nav
          className={styles.navigation}
          aria-label="Filtros do catálogo"
        >
          <span className={styles.filterLabel}>Explorar</span>

          <HeaderMenu
            label="Categorias"
            items={categories}
            isOpen={openMenu === "categories"}
            isLoading={isLoading}
            error={error}
            selectedSlug={selectedCategorySlug}
            onClick={() => toggleMenu("categories")}
            onSelect={handleCategorySelect}
          />

          <HeaderMenu
            label="Jogos"
            items={games}
            isOpen={openMenu === "games"}
            isLoading={isLoading}
            error={error}
            selectedSlug={selectedGameSlug}
            onClick={() => toggleMenu("games")}
            onSelect={handleGameSelect}
          />
        </nav>
      </div>
    </header>
  )
}