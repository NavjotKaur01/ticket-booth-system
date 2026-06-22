export type StatSummary = {
  id: string
  label: string
  value: number
  href?: string
}

export type ServiceFees = {
  walkup: string
  phone: string
  web: string
}

export type NewsItem = {
  id: string
  title: string
  date: string
  description?: string
  imageUrl?: string
  fees?: ServiceFees
}

export type UserSession = {
  username: string
  organization: string
  clubSlug: string
  userId: string
  userRight: string
  lastLogin: string
}

export type QuickLink = {
  label: string
  href: string
}
