import { useState } from "react"

import { Header } from "./components/Header/Header"
import { ItemList } from "./components/ItemList/ItemList"
import { SearchBar } from "./components/SearchBar/SearchBar"

export default function App() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <>
      <Header />

      <main>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
        />

        <ItemList searchTerm={searchTerm} />
      </main>
    </>
  )
}