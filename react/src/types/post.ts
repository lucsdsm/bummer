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
  created_at: string
  updated_at: string
}

export interface Image {
  id: number
  image_url: string
  position: number
}