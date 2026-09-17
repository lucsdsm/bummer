export interface CatalogOption {
  id: number
  name: string
  slug: string
}

export interface CategoryOption extends CatalogOption {
  parent_id: number | null
  children: CategoryOption[]
}