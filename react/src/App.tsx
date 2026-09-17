import { useState } from "react"

import { Header } from "./components/Header/Header"
import { PostList } from "./components/PostList/PostList"

export default function App() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<
    string | null
  >(null)
  const [selectedGameSlug, setSelectedGameSlug] = useState<
    string | null
  >(null)

  return (
    <>
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategorySlug={selectedCategorySlug}
        selectedGameSlug={selectedGameSlug}
        onCategorySelect={setSelectedCategorySlug}
        onGameSelect={setSelectedGameSlug}
      />

      <main>
        <PostList
          searchTerm={searchTerm}
          categorySlug={selectedCategorySlug}
          gameSlug={selectedGameSlug}
        />
      </main>
    </>
  )
}