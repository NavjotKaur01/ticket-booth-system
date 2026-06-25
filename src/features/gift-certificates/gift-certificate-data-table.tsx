import { DataTable } from "@/components/data-table/data-table"
import { giftCertificateColumns } from "@/features/gift-certificates/gift-certificate-columns"
import type { GiftCertificate } from "@/types/gift-certificate"

type GiftCertificateDataTableProps = {
  data: GiftCertificate[]
}

export function GiftCertificateDataTable({
  data,
}: GiftCertificateDataTableProps) {
  return (
    <DataTable
      columns={giftCertificateColumns}
      data={data}
      emptyMessage="No record found"
      entityLabel="gift certificates"
      pageSize={10}
    />
  )
}
