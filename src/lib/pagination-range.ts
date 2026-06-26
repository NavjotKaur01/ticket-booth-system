export type PaginationItem = number | "ellipsis"

/** Compact page list: first/last, current ±1, ellipses for gaps. */
export function getPaginationRange(
  currentPageIndex: number,
  totalPages: number
): PaginationItem[] {
  if (totalPages <= 1) {
    return totalPages === 1 ? [1] : []
  }

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const currentPage = currentPageIndex + 1
  const pages = new Set<number>([1, totalPages])

  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page >= 1 && page <= totalPages) {
      pages.add(page)
    }
  }

  const sortedPages = Array.from(pages).sort((left, right) => left - right)
  const range: PaginationItem[] = []

  for (let index = 0; index < sortedPages.length; index += 1) {
    const page = sortedPages[index]
    const previousPage = sortedPages[index - 1]

    if (index > 0 && page - previousPage > 1) {
      range.push("ellipsis")
    }

    range.push(page)
  }

  return range
}
