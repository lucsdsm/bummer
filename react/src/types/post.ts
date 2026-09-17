export interface Post {
  id: number
  name: string
  slug: string
  description: string
  game: string | null
  category: string
  subcategory: string | null
  download_url: string
  images: Image[]
}

export interface Image {
  id: number
  image_url: string
  position: number
}