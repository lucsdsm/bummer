export interface Post {
  id: number
  name: string
  slug: string
  description: string
  game: string
  category: string
  download_url: string
  images: Image[]
}

export interface Image {
  id: number
  image_url: string
  position: number
}