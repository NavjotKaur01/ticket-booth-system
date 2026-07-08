export type ComicManagerTransferOption =
  | "comicTransfer"
  | "picTransfer"
  | "bioTransfer"
  | "makeInactive"

export const comicManagerTransferOptions: {
  id: ComicManagerTransferOption
  label: string
}[] = [
  { id: "comicTransfer", label: "Comic Transfer" },
  { id: "picTransfer", label: "Pic Transfer" },
  { id: "bioTransfer", label: "Bio Transfer" },
  { id: "makeInactive", label: "Make Inactive" },
]
