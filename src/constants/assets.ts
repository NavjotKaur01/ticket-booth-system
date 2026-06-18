/** Base URL for static images in `public/images/` (works locally and on Vercel). */
export const IMAGE_BASE = "/images"

const DASHBOARD_IMAGE_DIR = "dashboard"

/** Build a public image path, e.g. imagePath("logo.png") → "/images/logo.png" */
export function imagePath(filename: string) {
  return `${IMAGE_BASE}/${filename.replace(/^\//, "")}`
}

/** Dashboard news card images: img1.bmp … img6.bmp in public/images/dashboard/ */
export function dashboardNewsImage(index: number) {
  return imagePath(`${DASHBOARD_IMAGE_DIR}/img${index}.bmp`)
}
