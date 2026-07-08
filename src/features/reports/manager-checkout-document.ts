import * as XLSX from "xlsx"

import {
  buildManagerCheckoutDocuments,
  formatDesktopMoney,
  type ManagerCheckoutGiftCertApiRow,
  type ManagerCheckoutPaymentBucket,
  type ManagerCheckoutShowDocument,
} from "@/features/reports/manager-checkout-data"
import type { ReportViewerResult } from "@/features/reports/reports.service"

const DESKTOP_STYLES = `
  body { margin: 0; padding: 25px; color: #111; font-family: "Times New Roman", Times, serif; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0 18px; }
  th, td { border: 1px solid #999; padding: 4px 6px; vertical-align: top; }
  th { font-weight: 700; text-align: center; background: #f3f3f3; }
  .left { text-align: left; }
  .center { text-align: center; }
  .bold { font-weight: 700; }
  .club { font-size: 18px; font-weight: 600; margin: 18px 0 8px; }
  .section-title { font-size: 14px; font-weight: 600; text-align: center; margin: 14px 0 6px; }
  .show-block { page-break-inside: avoid; margin-bottom: 24px; }
`

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function moneyCells(bucket: ManagerCheckoutPaymentBucket, blankZero = false) {
  const values = [
    bucket.cash,
    bucket.amex,
    bucket.discover,
    bucket.mastercard,
    bucket.visa,
    bucket.giftCard,
    bucket.giftCert,
    bucket.webGiftCert,
    bucket.other,
  ]
  return values
    .map((value) => `<td class="center">${formatDesktopMoney(value, blankZero)}</td>`)
    .join("")
}

function buildPaymentTable(show: ManagerCheckoutShowDocument): string {
  // Recompute net totals from buckets directly — same logic as manager-checkout-view.tsx
  const cashDrawerNet = show.cashDrawer.subTotal - show.refund.subTotal
  const posNet        = show.pos.subTotal - show.posRefund.subTotal
  const webNet        = show.web.subTotal - show.webRefund.subTotal
  const totalCash     = cashDrawerNet + posNet + webNet
  const saleTax       = show.saleTax
  const netSales      = totalCash - saleTax
  const fees          = show.fees
  const revenue       = netSales - fees

  const rows = [
    // "Total" column is null for source rows, net value only on Refund rows (matches view)
    { label: "Cash Drawer", bucket: show.cashDrawer,  sub: show.cashDrawer.subTotal,  total: null as number | null },
    { label: "Refund",      bucket: show.refund,      sub: show.refund.subTotal,      total: cashDrawerNet },
    { label: "POS",         bucket: show.pos,         sub: show.pos.subTotal,         total: null as number | null },
    { label: "Refund",      bucket: show.posRefund,   sub: show.posRefund.subTotal,   total: posNet },
    { label: "Web",         bucket: show.web,         sub: show.web.subTotal,         total: null as number | null },
    { label: "Web/Refunds", bucket: show.webRefund,   sub: show.webRefund.subTotal,   total: webNet },
    {
      label: "Total",
      bucket: {
        ...show.columnTotals,
        subTotal: show.subTotal,
        total: totalCash,
      } as ManagerCheckoutPaymentBucket,
      sub: show.subTotal,
      total: totalCash,
      bold: true,
    },
    { label: "Sale Tax",  summary: saleTax  },
    { label: "Net Sales", summary: netSales },
    { label: "Fee",       summary: fees     },
    { label: "Revenue",   summary: revenue  },
  ]

  const body = rows
    .map((row) => {
      if ("summary" in row) {
        return `<tr>
          <td class="left">${row.label}</td>
          <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
          <td></td>
          <td class="center">${formatDesktopMoney(row.summary ?? 0)}</td>
        </tr>`
      }

      const bucket = row.bucket as ManagerCheckoutPaymentBucket
      return `<tr${row.bold ? ' class="bold"' : ""}>
        <td class="left">${row.label}</td>
        ${moneyCells(bucket, false)}
        <td class="center">${formatDesktopMoney(row.sub ?? 0)}</td>
        <td class="center">${row.total != null ? formatDesktopMoney(row.total) : ""}</td>
      </tr>`
    })
    .join("")

  return `<table>
    <thead>
      <tr>
        <th class="left">Type</th>
        <th>Cash</th><th>AmEx</th><th>Discover</th><th>MasterCard</th><th>Visa</th>
        <th>Gift Card</th><th>Gift Cert</th><th>WebGiftCert</th><th>Other</th>
        <th>SubTotal</th><th>Total</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>`
}


function buildCheckedInTable(show: ManagerCheckoutShowDocument): string {
  const promoRows = show.promos
    .map((promo, index) => {
      const source = show.promoSources[index] ?? { phoneIn: 0, walkup: 0, web: 0 }
      return `<tr>
        <td class="left">${escapeHtml(promo.promo || "-")}</td>
        <td class="center">${promo.party}</td>
        <td class="center">${promo.seated}</td>
        <td class="center">${promo.paid}</td>
        <td class="center">${promo.comp}</td>
        <td class="center">${promo.disc}</td>
        <td class="center">${promo.scanned}</td>
        <td class="center">${promo.scanPaid}</td>
        <td class="center">${promo.scanComp}</td>
        <td class="center">${promo.scanDisc}</td>
        <td class="center">${source.phoneIn}</td>
        <td class="center">${source.walkup}</td>
        <td class="center">${source.web}</td>
      </tr>`
    })
    .join("")

  return `<div class="section-title">CheckedIn</div>
  <table>
    <thead>
      <tr>
        <th class="left">Promotion</th>
        <th>Party</th><th>Seated</th><th>Paid</th><th>Comp</th><th>Disc</th>
        <th>Scanned</th><th>ScanPaid</th><th>ScanComp</th><th>ScanDisc</th>
        <th>Phone-In</th><th>Walkup</th><th>Web</th>
      </tr>
    </thead>
    <tbody>
      ${promoRows}
      <tr class="bold">
        <td class="left">Total</td>
        <td class="center">${show.sumParty}</td>
        <td class="center">${show.sumCheckedIn}</td>
        <td class="center">${show.sumPaid}</td>
        <td class="center">${show.sumComp}</td>
        <td class="center">${show.sumDisc}</td>
        <td class="center">${show.sumScanned}</td>
        <td class="center">${show.sumScanPaid}</td>
        <td class="center">${show.sumScanComp}</td>
        <td class="center">${show.sumScanDisc}</td>
        <td class="center">${show.sumPhoneIn}</td>
        <td class="center">${show.sumWalkup}</td>
        <td class="center">${show.sumWeb}</td>
      </tr>
    </tbody>
  </table>`
}

function buildOriginTable(show: ManagerCheckoutShowDocument): string {
  const rows = show.origins
    .map(
      (origin) => `<tr>
      <td class="left">${escapeHtml(origin.origin)}</td>
      <td class="center">${origin.party}</td>
      <td class="center">${origin.seated}</td>
      <td class="center">${formatDesktopMoney(origin.paid)}</td>
    </tr>`
    )
    .join("")

  const sectionRows = show.showSections
    .map(
      (section) => `<tr>
      <td class="left">${escapeHtml(section.section)}</td>
      <td class="center">${section.party}</td>
      <td class="center">${formatDesktopMoney(section.totalAmount)}</td>
    </tr>`
    )
    .join("")

  const sectionTable =
    show.showSections.length > 0
      ? `<table>
      <thead>
        <tr><th class="left">Show Section</th><th>Party</th><th>Total Amount</th></tr>
      </thead>
      <tbody>${sectionRows}</tbody>
    </table>`
      : ""

  return `<table>
    <thead>
      <tr><th class="left">Orgin</th><th>Party</th><th>(Pre)Seated</th><th>Paid</th></tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="bold">
        <td class="left">Total</td>
        <td class="center">${show.allPartySum}</td>
        <td class="center">${show.allSeatedSum}</td>
        <td class="center">${formatDesktopMoney(show.allPaidSum)}</td>
      </tr>
    </tbody>
  </table>
  ${sectionTable}`
}

function buildWebGiftCertificateTables(show: ManagerCheckoutShowDocument): string {
  if (!show.webGiftCertificateList.length) return ""

  const listRows = show.webGiftCertificateList
    .map(
      (row) => `<tr>
      <td class="center">${escapeHtml(row.date)}</td>
      <td class="center">${row.number}</td>
      <td class="center">${formatDesktopMoney(row.amount)}</td>
    </tr>`
    )
    .join("")

  const paymentRows = show.webGiftCertificatePaymentList
    .map(
      (row) => `<tr>
      <td class="center">${escapeHtml(row.date)}</td>
      <td class="center">${formatDesktopMoney(row.amex)}</td>
      <td class="center">${formatDesktopMoney(row.discover)}</td>
      <td class="center">${formatDesktopMoney(row.mastercard)}</td>
      <td class="center">${formatDesktopMoney(row.visa)}</td>
      <td class="center">${formatDesktopMoney(row.total)}</td>
    </tr>`
    )
    .join("")

  return `<div class="section-title">Web Gift Certificate Totals</div>
  <table>
    <thead><tr><th>Date</th><th>Number</th><th>Amount</th></tr></thead>
    <tbody>${listRows}</tbody>
  </table>
  ${
    paymentRows
      ? `<table>
    <thead>
      <tr><th>Date</th><th>AmEx</th><th>Discover</th><th>MasterCard</th><th>Visa</th><th>Total</th></tr>
    </thead>
    <tbody>${paymentRows}</tbody>
  </table>`
      : ""
  }`
}

function buildShowHtml(show: ManagerCheckoutShowDocument, clubName: string): string {
  const locationLabel = show.location || clubName
  return `<section class="show-block">
    <div class="club">CLUB NAME: ${escapeHtml(locationLabel)}</div>
    <table>
      <tbody>
        <tr>
          <td colspan="3" class="bold">Manager Checkout</td>
          <td colspan="2">Booked</td>
          <td colspan="2">Pre (Seat)</td>
        </tr>
        <tr>
          <td colspan="2">Show Date: ${escapeHtml(show.date)}</td>
          <td></td>
          <td colspan="2" class="center">${show.booked}</td>
          <td colspan="2" class="center">${show.preSeated}</td>
        </tr>
        <tr>
          <td colspan="2">Show Time: ${escapeHtml(show.time)}</td>
          <td></td>
          <td colspan="2">Ticket Price<br>${escapeHtml(show.strTicketPrice)}</td>
          <td colspan="2">Total Recipts<br>N/A</td>
        </tr>
        <tr>
          <td colspan="2">Comic Name: ${escapeHtml(show.comic)}</td>
          <td colspan="5"></td>
        </tr>
      </tbody>
    </table>
    ${buildPaymentTable(show)}
    ${buildCheckedInTable(show)}
    ${buildOriginTable(show)}
    ${buildWebGiftCertificateTables(show)}
  </section>`
}

export function resolveManagerCheckoutDocuments({
  result,
  clubName,
  giftCertificateList,
  giftCertificatePayments,
}: {
  result: ReportViewerResult
  clubName: string
  giftCertificateList?: ManagerCheckoutGiftCertApiRow[]
  giftCertificatePayments?: ManagerCheckoutGiftCertApiRow[]
}): ManagerCheckoutShowDocument[] {
  return buildManagerCheckoutDocuments(result.rawData, {
    giftCertificateList,
    giftCertificatePayments,
  }).map((show) => ({
    ...show,
    location: show.location || clubName,
  }))
}

export function buildDesktopManagerCheckoutHtml({
  documents,
}: {
  documents: ManagerCheckoutShowDocument[]
  clubName: string
}): string {
  const body = documents.length
    ? documents.map((show) => buildShowHtml(show, show.location)).join("")
    : `<p class="center">No records found</p>`

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Manager Checkout</title>
    <style>${DESKTOP_STYLES}</style>
  </head>
  <body>${body}</body>
</html>`
}

export function buildManagerCheckoutWorkbook(documents: ManagerCheckoutShowDocument[]) {
  const rows: (string | number)[][] = []

  for (const show of documents) {
    rows.push([`Club Name${show.location}`])
    rows.push(["Manager Checkout"])
    rows.push([`Show Date${show.date}`])
    rows.push([`Show Time${show.time}`])
    rows.push([`Comic Name:${show.comic}`])
    rows.push(["", "", "Booked", show.booked, "", "(Pre Seat)", show.preSeated])
    rows.push(["", "", "Ticket Price", show.strTicketPrice, "", "Ticket Receipts", "N/A"])
    rows.push([
      "Type",
      "Cash",
      "AmEx",
      "Discover",
      "MasterCard",
      "Visa",
      "Gift Card",
      "Gift Cert",
      "WebGiftCert",
      "Other",
      "SubTotal",
      "Total",
    ])

    const paymentRows = [
      { label: "Cash Drawer", bucket: show.cashDrawer, total: show.refundTotal },
      { label: "Refund", bucket: show.refund, total: show.refundTotal },
      { label: "POS", bucket: show.pos, total: show.refundTotal2 },
      { label: "Refund", bucket: show.posRefund, total: show.refundTotal2 },
      { label: "Web", bucket: show.web, total: show.webRefundTotal },
      { label: "Web/Refund", bucket: show.webRefund, total: show.webRefundTotal },
      {
        label: "Total",
        bucket: {
          cash: show.columnTotals.cash,
          amex: show.columnTotals.amex,
          discover: show.columnTotals.discover,
          mastercard: show.columnTotals.mastercard,
          visa: show.columnTotals.visa,
          giftCard: show.columnTotals.giftCard,
          giftCert: show.columnTotals.giftCert,
          webGiftCert: show.columnTotals.webGiftCert,
          other: show.columnTotals.other,
          subTotal: show.subTotal,
          total: show.totalCash,
        },
        total: show.totalCash,
      },
      { label: "Sale Tax", summary: show.saleTax },
      { label: "Net Sale", summary: show.netSales },
      { label: "Fee", summary: show.fees },
      { label: "Revenue", summary: show.revenue },
    ]

    for (const paymentRow of paymentRows) {
      if ("summary" in paymentRow) {
        rows.push([
          paymentRow.label,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          formatDesktopMoney(paymentRow.summary ?? 0),
        ])
        continue
      }

      const bucket = paymentRow.bucket
      rows.push([
        paymentRow.label,
        `$${formatDesktopMoney(bucket.cash)}`,
        `$${formatDesktopMoney(bucket.amex)}`,
        `$${formatDesktopMoney(bucket.discover)}`,
        `$${formatDesktopMoney(bucket.mastercard)}`,
        `$${formatDesktopMoney(bucket.visa)}`,
        `$${formatDesktopMoney(bucket.giftCard)}`,
        `$${formatDesktopMoney(bucket.giftCert)}`,
        `$${formatDesktopMoney(bucket.webGiftCert)}`,
        `$${formatDesktopMoney(bucket.other)}`,
        `$${formatDesktopMoney(bucket.subTotal)}`,
        paymentRow.total != null ? `$${formatDesktopMoney(paymentRow.total)}` : "",
      ])
    }

    rows.push([])
    rows.push(["", "", "Checked-In"])
    rows.push([
      "Promotions",
      "Party",
      "Seated",
      "Paid",
      "Comp",
      "Disc",
      "Scanned",
      "ScanPaid",
      "ScanComp",
      "ScanDisc",
      "Phone-In",
      "Walkup",
      "Web",
    ])

    for (let index = 0; index < show.promos.length; index += 1) {
      const promo = show.promos[index]
      const source = show.promoSources[index] ?? { phoneIn: 0, walkup: 0, web: 0 }
      rows.push([
        promo.promo,
        promo.party,
        promo.seated,
        promo.paid,
        promo.comp,
        promo.disc,
        promo.scanned,
        promo.scanPaid,
        promo.scanComp,
        promo.scanDisc,
        source.phoneIn,
        source.walkup,
        source.web,
      ])
    }

    rows.push([
      "Total",
      show.sumParty,
      show.sumCheckedIn,
      show.sumPaid,
      show.sumComp,
      show.sumDisc,
      show.sumScanned,
      show.sumScanPaid,
      show.sumScanComp,
      show.sumScanDisc,
      show.sumPhoneIn,
      show.sumWalkup,
      show.sumWeb,
    ])
    rows.push([])
    rows.push(["Orgin", "Party", "Pre(Seated)", "Paid"])
    for (const origin of show.origins) {
      rows.push([origin.origin, origin.party, origin.seated, origin.paid])
    }
    rows.push(["Total", show.allPartySum, show.allSeatedSum, show.allPaidSum])
    rows.push([])

    if (show.showSections.length) {
      rows.push(["", "", "", "", "", "", "", "Show Section", "Party", "Total Amount"])
      for (const section of show.showSections) {
        rows.push(["", "", "", "", "", "", "", section.section, section.party, section.totalAmount])
      }
      rows.push([])
    }

    if (show.webGiftCertificateList.length) {
      rows.push(["Web Gift Certificate Totals"])
      rows.push(["Date", "Number", "Amount"])
      for (const cert of show.webGiftCertificateList) {
        rows.push([cert.date, cert.number, cert.amount])
      }
      if (show.webGiftCertificatePaymentList.length) {
        rows.push(["Date", "AmEx", "Discover", "MasterCard", "Visa", "Total"])
        for (const payment of show.webGiftCertificatePaymentList) {
          rows.push([
            payment.date,
            payment.amex,
            payment.discover,
            payment.mastercard,
            payment.visa,
            payment.total,
          ])
        }
      }
      rows.push([])
    }
  }

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(rows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "ManagerCheckout")
  return workbook
}

export function buildManagerCheckoutExcelBlob(documents: ManagerCheckoutShowDocument[]) {
  const workbook = buildManagerCheckoutWorkbook(documents)
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([output], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}
