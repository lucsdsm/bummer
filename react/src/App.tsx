import { useState } from "react"

import { Header } from "./components/Header/Header"
import { PostList } from "./components/PostList/PostList"

export default function App() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <>
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main>
        <PostList searchTerm={searchTerm} />
      </main>
    </>
  )
}