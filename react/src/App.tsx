import { useState } from "react"

import { Header } from "./components/Header/Header"
import { ItemList } from "./components/ItemList/ItemList"

export default function App() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <>
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main>
        <ItemList searchTerm={searchTerm} />
      </main>
    </>
  )
}