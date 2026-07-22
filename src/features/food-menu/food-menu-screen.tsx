import {
  FileImage,
  FilePlus2,
  Eye,
  ImageOff,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import type { SegmentedTab } from "@/components/common/segmented-tab-list"
import { SegmentedTabList } from "@/components/common/segmented-tab-list"
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { StandardRowActionsMenu } from "@/components/common/standard-row-actions-menu"
import { VenueNoLocationState } from "@/components/common/venue-no-location-state"
import { ScrollSelectControl } from "@/components/common/scroll-select-control"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAppSession } from "@/hooks/use-app-session"
import { reportError, reportErrorMessage, toastSuccess } from "@/lib/app-toast"
import {
  useAddUpdateMenuMutation,
  useAddUpdateMenuPdfMutation,
  useDeleteMenuMutation,
  useDeleteMenuPdfMutation,
  useGetMenuImageMutation,
  useGetMenuPdfListQuery,
  useGetMenuPdfMutation,
  useGetMenusQuery,
  useUploadMenuImageMutation,
} from "@/store/api/clubmanApi"
import type { MenuItem, MenuPdfItem } from "@/types/api/menu"
import type { FoodMenuCategory, FoodMenuPdf } from "@/types/food-menu"

const FOOD_MENU_TABS = [
  { id: "categories", label: "Categories" },
  { id: "pdf", label: "PDF" },
] as const satisfies readonly SegmentedTab<FoodMenuTab>[]

const ACTIVE_OPTIONS = [
  { value: "Y", label: "Yes" },
  { value: "N", label: "No" },
] as const

type FoodMenuTab = "categories" | "pdf"
type PdfEditorMode = "create" | "edit" | "image"

type PendingDelete =
  | { kind: "category"; id: string; label: string }
  | { kind: "pdf"; id: string; label: string }

type CategoryFormState = {
  menuName: string
  menuOrder: string
  active: boolean
}

const EMPTY_CATEGORY_FORM: CategoryFormState = {
  menuName: "",
  menuOrder: "1",
  active: true,
}

function mapMenuItemToCategory(item: MenuItem): FoodMenuCategory {
  return {
    id: item.MenuId,
    locationId: item.LocationId,
    menuName: item.MenuName,
    menuOrder: item.MenuOrder,
    active: item.Active === "Y",
  }
}

function mapMenuPdfItemToRow(item: MenuPdfItem): FoodMenuPdf {
  const label = item.FileDescription?.trim() || "Untitled PDF"
  return {
    id: item.FileGuid,
    locationId: item.LocationID,
    name: label,
    description: item.FileDescription ?? "",
    fileName: label,
    imageLabel: "",
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : ""
      const base64 = result.includes(",") ? result.split(",")[1] ?? "" : result
      resolve(base64)
    }
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read PDF file."))
    reader.readAsDataURL(file)
  })
}

function base64ToPdfBlob(base64Content: string): Blob {
  const normalized = base64Content.includes(",")
    ? base64Content.split(",")[1] ?? ""
    : base64Content
  const binary = window.atob(normalized)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return new Blob([bytes], { type: "application/pdf" })
}

function downloadPdfBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-sm border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={active
        ? "inline-flex min-w-9 items-center justify-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
        : "inline-flex min-w-9 items-center justify-center rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground"
      }
    >
      {active ? "Y" : "N"}
    </span>
  )
}

function base64ToImageSrc(base64Content: string) {
  const normalized = base64Content.includes(",")
    ? base64Content
    : `data:image/png;base64,${base64Content}`
  return normalized
}

function PdfToolbarButton({
  label,
  onClick,
  icon,
  disabled = false,
}: {
  label: string
  onClick: () => void
  icon: React.ReactNode
  disabled?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={onClick}
          disabled={disabled}
          className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
        >
          {icon}
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}

export function FoodMenuScreen() {
  const { locationId, locationName, username } = useAppSession()

  const [activeTab, setActiveTab] = useState<FoodMenuTab>("categories")
  const [categoryRows, setCategoryRows] = useState<FoodMenuCategory[]>([])
  const [pdfRows, setPdfRows] = useState<FoodMenuPdf[]>([])
  const [selectedPdfId, setSelectedPdfId] = useState("")
  const [pdfEditorMode, setPdfEditorMode] = useState<PdfEditorMode>("edit")
  const [pdfDescription, setPdfDescription] = useState("")
  const [replacementPdfFile, setReplacementPdfFile] = useState<File | null>(null)
  const [replacementPdfName, setReplacementPdfName] = useState("")
  const [pdfFileInputKey, setPdfFileInputKey] = useState(0)
  const [imageTitle, setImageTitle] = useState("")
  const [imageOrder, setImageOrder] = useState("1")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageFileName, setImageFileName] = useState("")
  const [imageFileInputKey, setImageFileInputKey] = useState(0)
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null)
  const [loadingImage, setLoadingImage] = useState(false)
  const [savingImage, setSavingImage] = useState(false)
  const [savingCategory, setSavingCategory] = useState(false)
  const [savingPdf, setSavingPdf] = useState(false)
  const [previewingPdf, setPreviewingPdf] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState(false)
  const [deletingPdf, setDeletingPdf] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(EMPTY_CATEGORY_FORM)
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null)

  const {
    data: apiMenus,
    isLoading: isMenusLoading,
    error: menusQueryError,
    refetch: refetchMenus,
  } = useGetMenusQuery(
    { connectionString: "demo_prod", locationId: locationId ?? "" },
    { skip: !locationId }
  )

  const {
    data: apiMenuPdfs,
    isLoading: isPdfsLoading,
    error: pdfsQueryError,
    refetch: refetchMenuPdfs,
  } = useGetMenuPdfListQuery(
    { locationId: locationId ?? "" },
    { skip: !locationId }
  )

  const [addUpdateMenu] = useAddUpdateMenuMutation()
  const [addUpdateMenuPdf] = useAddUpdateMenuPdfMutation()
  const [getMenuPdf] = useGetMenuPdfMutation()
  const [getMenuImage] = useGetMenuImageMutation()
  const [uploadMenuImage] = useUploadMenuImageMutation()
  const [deleteMenu] = useDeleteMenuMutation()
  const [deleteMenuPdf] = useDeleteMenuPdfMutation()

  const isDeleting = deletingCategory || deletingPdf
  const loading = isMenusLoading || isPdfsLoading
  const parsedImageOrder = Number(imageOrder)

  const pdfOptions = useMemo(
    () =>
      pdfRows.map((row) => ({
        value: row.id,
        label: row.name,
      })),
    [pdfRows]
  )

  const selectedPdf = useMemo(
    () => pdfRows.find((row) => row.id === selectedPdfId) ?? null,
    [pdfRows, selectedPdfId]
  )

  const canSaveImage =
    Boolean(selectedPdf) &&
    imageTitle.trim().length > 0 &&
    Boolean(imageFile) &&
    Number.isFinite(parsedImageOrder) &&
    parsedImageOrder > 0 &&
    !savingImage

  useEffect(() => {
    if (menusQueryError) {
      reportErrorMessage(setError, "Unable to load food menu categories.")
    }
  }, [menusQueryError])

  useEffect(() => {
    if (pdfsQueryError) {
      reportErrorMessage(setError, "Unable to load food menu PDF list.")
    }
  }, [pdfsQueryError])

  useEffect(() => {
    if (apiMenus) {
      setCategoryRows(
        [...apiMenus]
          .map(mapMenuItemToCategory)
          .sort((a, b) => a.menuOrder - b.menuOrder)
      )
    } else {
      setCategoryRows([])
    }
  }, [apiMenus])

  useEffect(() => {
    if (apiMenuPdfs) {
      const mapped = apiMenuPdfs.map(mapMenuPdfItemToRow)
      setPdfRows(mapped)
      setSelectedPdfId((current) => {
        if (pdfEditorMode === "create") {
          return ""
        }
        if (current && mapped.some((row) => row.id === current)) {
          return current
        }
        return mapped[0]?.id ?? ""
      })
    } else {
      setPdfRows([])
      if (pdfEditorMode !== "create") {
        setSelectedPdfId("")
      }
    }
  }, [apiMenuPdfs, pdfEditorMode])

  useEffect(() => {
    setPdfDescription("")
    setReplacementPdfFile(null)
    setReplacementPdfName("")
    setPdfEditorMode("edit")
    setImageTitle("")
    setImageOrder("1")
    setImageFile(null)
    setImageFileName("")
    setCurrentImageSrc(null)
    setActionMessage(null)
    setPendingDelete(null)
    setCategoryDialogOpen(false)
    setEditingCategoryId(null)
    setCategoryForm(EMPTY_CATEGORY_FORM)
    setCategoryFormError(null)
    setError(null)
  }, [locationId])

  useEffect(() => {
    if (pdfEditorMode === "create" || pdfEditorMode === "image") {
      return
    }

    if (!selectedPdf) {
      setPdfDescription("")
      setReplacementPdfFile(null)
      setReplacementPdfName("")
      setPdfFileInputKey((current) => current + 1)
      return
    }

    setPdfDescription(selectedPdf.description)
    setReplacementPdfFile(null)
    setReplacementPdfName("")
    setPdfFileInputKey((current) => current + 1)
  }, [selectedPdf?.id, pdfEditorMode])

  useEffect(() => {
    if (pdfEditorMode !== "image" || !selectedPdfId) {
      return
    }

    let isActive = true
    setLoadingImage(true)
    setCurrentImageSrc(null)

    getMenuImage({ fileGuid: selectedPdfId })
      .unwrap()
      .then((imageData) => {
        if (!isActive) {
          return
        }
        if (imageData?.ImageTitle) {
          setImageTitle(imageData.ImageTitle)
        }
        if (imageData?.OrderNumber != null) {
          setImageOrder(String(imageData.OrderNumber))
        }
        if (imageData?.ImageContent) {
          setCurrentImageSrc(base64ToImageSrc(imageData.ImageContent))
        } else {
          setCurrentImageSrc(null)
        }
      })
      .catch(() => {
        if (isActive) {
          setCurrentImageSrc(null)
        }
      })
      .finally(() => {
        if (isActive) {
          setLoadingImage(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [getMenuImage, pdfEditorMode, selectedPdfId])

  const nextMenuOrder = useMemo(() => {
    if (categoryRows.length === 0) {
      return 1
    }
    return Math.max(...categoryRows.map((row) => row.menuOrder)) + 1
  }, [categoryRows])

  const parsedMenuOrder = Number(categoryForm.menuOrder)
  const canSaveCategory =
    Boolean(locationId) &&
    categoryForm.menuName.trim().length > 0 &&
    Number.isFinite(parsedMenuOrder) &&
    parsedMenuOrder > 0

  function updateCategoryField<K extends keyof CategoryFormState>(
    key: K,
    value: CategoryFormState[K]
  ) {
    setCategoryForm((current) => ({ ...current, [key]: value }))
    setCategoryFormError(null)
  }

  function openCreateCategoryDialog() {
    setEditingCategoryId(null)
    setCategoryForm({
      ...EMPTY_CATEGORY_FORM,
      menuOrder: String(nextMenuOrder),
    })
    setCategoryFormError(null)
    setCategoryDialogOpen(true)
  }

  function openEditCategoryDialog(row: FoodMenuCategory) {
    setEditingCategoryId(row.id)
    setCategoryForm({
      menuName: row.menuName,
      menuOrder: String(row.menuOrder),
      active: row.active,
    })
    setCategoryFormError(null)
    setCategoryDialogOpen(true)
  }

  function closeCategoryDialog() {
    setCategoryDialogOpen(false)
    setEditingCategoryId(null)
    setCategoryForm(EMPTY_CATEGORY_FORM)
    setCategoryFormError(null)
  }

  function handleCategoryDialogChange(open: boolean) {
    if (savingCategory) {
      return
    }
    if (!open) {
      closeCategoryDialog()
      return
    }
    setCategoryDialogOpen(true)
  }

  async function handleCategorySave() {
    if (!locationId || !canSaveCategory || savingCategory) {
      if (!canSaveCategory) {
        setCategoryFormError("Enter a menu name and a valid menu order.")
      }
      return
    }

    const menuName = categoryForm.menuName.trim()
    const duplicate = categoryRows.find(
      (row) =>
        row.menuName.toLowerCase() === menuName.toLowerCase() &&
        row.id !== editingCategoryId
    )
    if (duplicate) {
      setCategoryFormError("A category with this menu name already exists.")
      return
    }

    const isEdit = Boolean(editingCategoryId)
    setSavingCategory(true)
    setCategoryFormError(null)
    setError(null)

    try {
      await addUpdateMenu({
        ConnectionString: "demo_prod",
        MenuId: editingCategoryId ?? "",
        MenuName: menuName,
        MenuOrder: parsedMenuOrder,
        Active: categoryForm.active ? "Y" : "N",
        LocationId: locationId,
        LastUpdatedId: username || "Admin",
      }).unwrap()

      const saveMessage = isEdit
        ? `Updated category ${menuName} for ${locationName}.`
        : `Added category ${menuName} for ${locationName}.`
      setActionMessage(saveMessage)
      toastSuccess(saveMessage)
      closeCategoryDialog()
      await refetchMenus()
    } catch (requestError) {
      reportError(setCategoryFormError, requestError, "Unable to save the food menu category.")
    } finally {
      setSavingCategory(false)
    }
  }

  function handleCategoryDelete(row: FoodMenuCategory) {
    setPendingDelete({ kind: "category", id: row.id, label: row.menuName })
  }

  function handlePdfDelete() {
    if (!selectedPdf || pdfEditorMode === "create") {
      return
    }

    setPendingDelete({ kind: "pdf", id: selectedPdf.id, label: selectedPdf.name })
  }

  function openCreatePdfEditor() {
    setPdfEditorMode("create")
    setSelectedPdfId("")
    setPdfDescription("")
    setReplacementPdfFile(null)
    setReplacementPdfName("")
    setPdfFileInputKey((current) => current + 1)
    setError(null)
    setActionMessage(`Adding a new PDF menu for ${locationName}.`)
  }

  function openEditPdfEditor() {
    if (!selectedPdfId && pdfRows[0]) {
      setSelectedPdfId(pdfRows[0].id)
    }
    setPdfEditorMode("edit")
    setError(null)
  }

  function openImagePdfEditor() {
    const targetId = selectedPdfId || pdfRows[0]?.id || ""
    if (!targetId) {
      reportErrorMessage(setError, "Select or create a PDF menu before adding an image.")
      return
    }
    setSelectedPdfId(targetId)
    setPdfEditorMode("image")
    setImageTitle("")
    setImageOrder("1")
    setImageFile(null)
    setImageFileName("")
    setImageFileInputKey((current) => current + 1)
    setError(null)
    setActionMessage(`Add an image for the selected PDF menu in ${locationName}.`)
  }

  async function handleSavePdf() {
    if (!locationId || savingPdf || previewingPdf || pdfEditorMode === "image") {
      return
    }

    const isCreate = pdfEditorMode === "create"
    if (!isCreate && !selectedPdf) {
      return
    }

    const description = pdfDescription.trim()
    if (!description) {
      reportErrorMessage(setError, "Enter a description for the PDF menu.")
      return
    }

    if (isCreate && !replacementPdfFile) {
      reportErrorMessage(setError, "Choose a PDF file to upload.")
      return
    }

    setSavingPdf(true)
    setError(null)

    try {
      const pdfContent = replacementPdfFile
        ? await fileToBase64(replacementPdfFile)
        : ""

      const result = await addUpdateMenuPdf({
        FileGuid: isCreate ? "" : selectedPdf!.id,
        LocationID: locationId,
        FileDescription: description,
        UserName: username || "Admin",
        PdfContent: pdfContent,
      }).unwrap()

      const saveMessage = isCreate
        ? `Added PDF menu ${description} for ${locationName}.`
        : `Updated PDF menu ${description} for ${locationName}.`
      setActionMessage(saveMessage)
      toastSuccess(saveMessage)
      setReplacementPdfFile(null)
      setReplacementPdfName("")
      setPdfFileInputKey((current) => current + 1)
      setPdfEditorMode("edit")
      if (result?.FileGuid) {
        setSelectedPdfId(result.FileGuid)
      }
      await refetchMenuPdfs()
    } catch (requestError) {
      reportError(
        setError,
        requestError,
        isCreate ? "Unable to add the PDF menu." : "Unable to update the PDF menu."
      )
    } finally {
      setSavingPdf(false)
    }
  }

  async function confirmDelete() {
    if (!pendingDelete || isDeleting) {
      return
    }

    if (pendingDelete.kind === "category") {
      setDeletingCategory(true)
      setError(null)

      try {
        await deleteMenu({
          ConnectionString: "demo_prod",
          MenuId: pendingDelete.id,
        }).unwrap()

        const deleteMessage = `Removed category ${pendingDelete.label} from ${locationName}.`
        setActionMessage(deleteMessage)
        toastSuccess(deleteMessage)
        setPendingDelete(null)
        await refetchMenus()
      } catch (requestError) {
        reportError(setError, requestError, "Unable to delete the food menu category.")
      } finally {
        setDeletingCategory(false)
      }
      return
    }

    setDeletingPdf(true)
    setError(null)

    try {
      await deleteMenuPdf({ fileGuid: pendingDelete.id }).unwrap()

      const deleteMessage = `Removed PDF menu ${pendingDelete.label} from ${locationName}.`
      setActionMessage(deleteMessage)
      toastSuccess(deleteMessage)
      setPendingDelete(null)
      if (selectedPdfId === pendingDelete.id) {
        setSelectedPdfId("")
      }
      setPdfEditorMode("edit")
      await refetchMenuPdfs()
    } catch (requestError) {
      reportError(setError, requestError, "Unable to delete the PDF menu.")
    } finally {
      setDeletingPdf(false)
    }
  }

  async function handleSavePdfImage() {
    if (!locationId || !selectedPdf || !canSaveImage || !imageFile) {
      return
    }

    setSavingImage(true)
    setError(null)

    try {
      const imageContent = await fileToBase64(imageFile)
      await uploadMenuImage({
        FileGuid: selectedPdf.id,
        ImageTitle: imageTitle.trim(),
        "Tab Value": parsedImageOrder,
        ImageContent: imageContent,
        UserName: username || "Admin",
      }).unwrap()

      const saveMessage = `Added image for ${selectedPdf.name} in ${locationName}.`
      setActionMessage(saveMessage)
      toastSuccess(saveMessage)
      setCurrentImageSrc(base64ToImageSrc(imageContent))
      setImageFile(null)
      setImageFileName("")
      setImageFileInputKey((current) => current + 1)
    } catch (requestError) {
      reportError(setError, requestError, "Unable to upload the PDF menu image.")
    } finally {
      setSavingImage(false)
    }
  }

  async function handlePreviewPdf() {
    if (!selectedPdf || previewingPdf || savingPdf) {
      return
    }

    setPreviewingPdf(true)
    setError(null)

    try {
      const pdfData = await getMenuPdf({ fileGuid: selectedPdf.id }).unwrap()
      if (!pdfData?.PdfContent) {
        throw new Error("PDF not available for this menu.")
      }

      const fileLabel =
        pdfData.FileDescription?.trim() ||
        selectedPdf.name.trim() ||
        "menu"
      const fileName = `${fileLabel.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "-")}.pdf`

      downloadPdfBlob(base64ToPdfBlob(pdfData.PdfContent), fileName)
      const saveMessage = `Downloaded ${fileLabel} PDF.`
      setActionMessage(saveMessage)
      toastSuccess(saveMessage)
    } catch (requestError) {
      reportError(setError, requestError, "Unable to download the PDF menu.")
    } finally {
      setPreviewingPdf(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Food Menu
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage venue food menu categories and PDF menu assets for the selected
              location.
            </p>
          </div>
          {activeTab === "categories" ? (
            <Button
              type="button"
              size="sm"
              className="gap-2"
              disabled={!locationId || loading}
              onClick={openCreateCategoryDialog}
            >
              <Plus className="size-4" />
              Add
            </Button>
          ) : null}
        </div>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b bg-muted/40 px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground">
                Food Menu Data
              </CardTitle>
              <SegmentedTabList
                tabs={FOOD_MENU_TABS}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                ariaLabel="Food menu sections"
                className="border-border bg-background/70"
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-4 py-5">
            {error ? (
              <p className="rounded-sm border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            {!locationId ? (
              <VenueNoLocationState featureLabel="Food menu data" />
            ) : loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Loading food menu data...
              </div>
            ) : activeTab === "categories" ? (
              categoryRows.length === 0 ? (
                <EmptyState
                  title="No categories found."
                  description="This location does not have food menu categories yet."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-14 px-4">#</TableHead>
                      <TableHead>Menu Name</TableHead>
                      <TableHead>Menu Order</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="px-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryRows.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell className="px-4 font-medium tabular-nums text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{row.menuName}</TableCell>
                        <TableCell className="tabular-nums">{row.menuOrder}</TableCell>
                        <TableCell><StatusPill active={row.active} /></TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center justify-end">
                            <StandardRowActionsMenu
                              ariaLabel={`Actions for ${row.menuName}`}
                              hiddenActions={["Add"]}
                              onAction={(action) => {
                                if (action === "Edit") {
                                  openEditCategoryDialog(row)
                                }
                                if (action === "Delete") {
                                  handleCategoryDelete(row)
                                }
                              }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            ) : (
              <div className="space-y-5">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,18rem)_1fr]">
                  <div className="space-y-2">
                    <Label htmlFor="food-menu-pdf-select">PDF Menus</Label>
                    <ScrollSelectControl
                      id="food-menu-pdf-select"
                      value={selectedPdfId}
                      onChange={(value) => {
                        setPdfEditorMode((current) =>
                          current === "image" ? "image" : "edit"
                        )
                        setSelectedPdfId(value)
                      }}
                      options={pdfOptions}
                      placeholder="Select PDF menu"
                      disabled={pdfOptions.length === 0 || pdfEditorMode === "create"}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-start gap-1 rounded-sm border border-border/70 bg-muted/20 px-2 py-1 lg:justify-end">
                    <PdfToolbarButton
                      label="Edit PDF menu"
                      icon={<Pencil className="size-4" />}
                      onClick={openEditPdfEditor}
                      disabled={!selectedPdfId && pdfRows.length === 0}
                    />
                    <span className="text-muted-foreground/60">|</span>
                    <PdfToolbarButton
                      label="Add PDF menu"
                      icon={<FilePlus2 className="size-4" />}
                      onClick={openCreatePdfEditor}
                      disabled={savingPdf || previewingPdf}
                    />
                    <span className="text-muted-foreground/60">|</span>
                    <PdfToolbarButton
                      label="Delete PDF menu"
                      icon={<Trash2 className="size-4" />}
                      onClick={handlePdfDelete}
                      disabled={!selectedPdf || pdfEditorMode === "create"}
                    />
                    <span className="text-muted-foreground/60">|</span>
                    <PdfToolbarButton
                      label="Add image for PDF"
                      icon={<FileImage className="size-4" />}
                      onClick={openImagePdfEditor}
                      disabled={
                        (!selectedPdf && pdfRows.length === 0) ||
                        pdfEditorMode === "create"
                      }
                    />
                  </div>
                </div>

              {pdfRows.length === 0 && pdfEditorMode !== "create" ? (
                <EmptyState
                  title="No PDF menus found."
                  description="This location does not have PDF menu entries yet."
                />
              ) : pdfEditorMode === "image" ? (
                <div className="overflow-hidden rounded-sm border border-border">
                  <div className="border-b bg-muted/40 px-4 py-2.5">
                    <p className="text-sm font-semibold text-foreground">Add Image for PDF</p>
                  </div>
                  <div className="grid gap-6 bg-background p-4 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)]">
                    <div className="space-y-4">
                      <div className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-center">
                        <Label htmlFor="food-menu-image-title">Title</Label>
                        <Input
                          id="food-menu-image-title"
                          value={imageTitle}
                          onChange={(event) => setImageTitle(event.target.value)}
                          placeholder="Image title"
                          disabled={!selectedPdf || savingImage}
                        />
                      </div>

                      <div className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-start">
                        <Label htmlFor="food-menu-image-file" className="sm:pt-2">
                          Add New Image
                        </Label>
                        <div className="space-y-1.5">
                          <Input
                            key={imageFileInputKey}
                            id="food-menu-image-file"
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={(event) => {
                              const file = event.target.files?.[0] ?? null
                              setImageFile(file)
                              setImageFileName(file?.name || "")
                              if (file) {
                                setCurrentImageSrc(URL.createObjectURL(file))
                              }
                            }}
                            disabled={!selectedPdf || savingImage}
                          />
                          <p className="text-xs text-muted-foreground">
                            {imageFileName || "(only image file like png or jpg are preferred)"}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-start">
                        <Label htmlFor="food-menu-image-order" className="sm:pt-2">
                          Order
                        </Label>
                        <div className="space-y-1.5">
                          <Input
                            id="food-menu-image-order"
                            type="number"
                            min={1}
                            className="max-w-28"
                            value={imageOrder}
                            onChange={(event) => setImageOrder(event.target.value)}
                            placeholder="1"
                            disabled={!selectedPdf || savingImage}
                          />
                          <p className="text-xs text-muted-foreground">(only numeric value)</p>
                        </div>
                      </div>

                      <div className="sm:pl-[7.5rem]">
                        <Button
                          type="button"
                          className="min-w-36 gap-2"
                          disabled={!canSaveImage}
                          onClick={() => void handleSavePdfImage()}
                        >
                          {savingImage ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <FileImage className="size-4" />
                          )}
                          Add Image
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">
                        Current Image for PDF
                      </p>
                      <div className="flex min-h-64 items-center justify-center rounded-sm border border-border bg-muted/10 p-3">
                        {loadingImage ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <LoaderCircle className="size-4 animate-spin" />
                            Loading image...
                          </div>
                        ) : currentImageSrc ? (
                          <img
                            src={currentImageSrc}
                            alt={imageTitle || selectedPdf?.name || "PDF menu image"}
                            className="max-h-72 w-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <ImageOff className="size-10" />
                            <p className="text-xs font-semibold uppercase tracking-wide">
                              No Image Found
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,16rem)_1fr]">
                  <Card className="gap-0 border border-border/80 py-0 shadow-none">
                    <CardContent className="space-y-3 px-4 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">Current PDF</p>
                        <p className="text-sm text-muted-foreground">
                          {pdfEditorMode === "create"
                            ? "Creating a new PDF menu."
                            : selectedPdf?.fileName || "Select a PDF menu to inspect its details."}
                        </p>
                      </div>

                      <div className="rounded-sm border border-dashed border-border bg-muted/20 px-3 py-4 text-sm text-muted-foreground">
                        {pdfEditorMode === "create"
                          ? "Upload a PDF below to create this menu."
                          : selectedPdf?.imageLabel || "No preview image selected yet."}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="gap-0 border border-border/80 py-0 shadow-none">
                    <CardContent className="grid gap-4 px-4 py-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="food-menu-pdf-description">Description</Label>
                          <Textarea
                            id="food-menu-pdf-description"
                            value={pdfDescription}
                            onChange={(event) => setPdfDescription(event.target.value)}
                            placeholder={
                              pdfEditorMode === "create"
                                ? "Describe the new PDF menu"
                                : "Describe the selected PDF menu"
                            }
                            className="min-h-24"
                            disabled={
                              savingPdf ||
                              (pdfEditorMode === "edit" && !selectedPdf)
                            }
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="food-menu-pdf-file">
                            {pdfEditorMode === "create" ? "PDF File" : "Replacement PDF"}
                          </Label>
                          <Input
                            key={`${pdfEditorMode}-${selectedPdfId}-${pdfFileInputKey}`}
                            id="food-menu-pdf-file"
                            type="file"
                            accept="application/pdf"
                            onChange={(event) => {
                              const file = event.target.files?.[0] ?? null
                              setReplacementPdfFile(file)
                              setReplacementPdfName(file?.name || "")
                            }}
                            disabled={
                              savingPdf ||
                              (pdfEditorMode === "edit" && !selectedPdf)
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            {replacementPdfName ||
                              (pdfEditorMode === "create"
                                ? "Choose a PDF file to upload."
                                : "Choose a PDF file to replace the current document.")}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="gap-1.5"
                          disabled={
                            !selectedPdf ||
                            pdfEditorMode === "create" ||
                            savingPdf ||
                            previewingPdf
                          }
                          onClick={() => void handlePreviewPdf()}
                        >
                          {previewingPdf ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                          Preview
                        </Button>
                        <Button
                          type="button"
                          className="gap-1.5"
                          disabled={
                            savingPdf ||
                            previewingPdf ||
                            !pdfDescription.trim() ||
                            (pdfEditorMode === "create"
                              ? !replacementPdfFile
                              : !selectedPdf)
                          }
                          onClick={() => void handleSavePdf()}
                        >
                          {savingPdf ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : pdfEditorMode === "create" ? (
                            <Plus className="size-4" />
                          ) : (
                            <Pencil className="size-4" />
                          )}
                          {pdfEditorMode === "create" ? "Add" : "Edit"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t px-4 py-3">
          <div aria-live="polite" className="text-sm text-muted-foreground">
            {locationId
              ? actionMessage ||
                `${categoryRows.length} categor${categoryRows.length === 1 ? "y" : "ies"} loaded for ${locationName}.`
              : "Select a location from the header to begin managing the food menu."}
          </div>
        </CardFooter>
      </Card>

      <ConfirmDeleteDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setPendingDelete(null)
          }
        }}
        onConfirm={() => void confirmDelete()}
        title={pendingDelete?.kind === "pdf" ? "Delete PDF menu?" : "Delete category?"}
        description={pendingDelete
          ? pendingDelete.kind === "pdf"
            ? `This will remove ${pendingDelete.label} from ${locationName}.`
            : `This will remove the ${pendingDelete.label} category from ${locationName}.`
          : ""}
        confirmLabel={pendingDelete?.kind === "pdf" ? "Delete PDF menu" : "Delete category"}
        isPending={isDeleting}
      />

      <Dialog open={categoryDialogOpen} onOpenChange={handleCategoryDialogChange}>
        <DialogContent className="max-w-md p-0 sm:max-w-md">
          <DialogHeader className="border-b bg-muted/40 px-5 py-4">
            <DialogTitle className="text-base font-semibold text-foreground">
              {editingCategoryId ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategoryId
                ? `Update this food menu category for ${locationName}.`
                : `Create a new food menu category for ${locationName}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-5">
            {categoryFormError ? (
              <p className="rounded-sm border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {categoryFormError}
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="food-menu-category-name">Menu Name</Label>
              <Input
                id="food-menu-category-name"
                value={categoryForm.menuName}
                onChange={(event) => updateCategoryField("menuName", event.target.value)}
                placeholder="e.g. Sandwiches"
                autoFocus
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="food-menu-category-order">Menu Order</Label>
                <Input
                  id="food-menu-category-order"
                  type="number"
                  min={1}
                  value={categoryForm.menuOrder}
                  onChange={(event) => updateCategoryField("menuOrder", event.target.value)}
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="food-menu-category-active">Active</Label>
                <Select
                  value={categoryForm.active ? "Y" : "N"}
                  onValueChange={(value) => updateCategoryField("active", value === "Y")}
                >
                  <SelectTrigger id="food-menu-category-active" className="w-full bg-background">
                    <SelectValue placeholder="Select active state" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {ACTIVE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t px-5 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleCategoryDialogChange(false)}
              disabled={savingCategory}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="gap-2"
              onClick={() => void handleCategorySave()}
              disabled={!canSaveCategory || savingCategory}
            >
              {savingCategory ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {editingCategoryId ? "Save" : "Add"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  )
}




