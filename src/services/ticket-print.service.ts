import QRCode from "qrcode"

import type {
  CreateTicketPrintDataParams,
  GetMockTicketPrintDataParams,
  PrintReservationTicketRequest,
  TicketPrintData,
  TicketPrintLayout,
  TicketPrintShow,
  TicketPrintText,
  TicketPrintVenue,
} from "@/types/ticket-print"
import type { ReservationPrintProperties } from "@/types/api/reservation-print"


const DEFAULT_VENUE: TicketPrintVenue = {
  venueName: "Standupmedia",
  addressLines: ["178 E Park Street Westerville, OH, 43081"],
  website: "Standupmedia.mobi",
}

const DEFAULT_TICKET_TEXT: TicketPrintText = {
  middleText: "All sales are final. No credits, refunds, or exchanges.",
  bottomText: "Bottom text under Price here.",
  printFooter: "TICKET",
  reprintFooter: "Re-Print Ticket",
}

function parseCurrency(value: string) {
  return Number(value.replace(/[^0-9.-]/g, "")) || 0
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}

function titleCaseWords(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function buildMiddleTextMarkup(value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    return ""
  }

  const normalized = trimmed.replace(/\s+/g, " ")
  const defaultText = "All sales are final. No credits, refunds, or exchanges."

  if (normalized === defaultText) {
    return [
      '<div class="middle-line">All sales are final.</div>',
      '<div class="middle-line">No credits, refunds, or exchanges.</div>',
    ].join("")
  }

  return trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<div class="middle-line">${escapeHtml(line)}</div>`)
    .join("")
}

function resolveVenue(locationName?: string): TicketPrintVenue {
  if (!locationName?.trim()) {
    return DEFAULT_VENUE
  }

  return {
    ...DEFAULT_VENUE,
    venueName: titleCaseWords(locationName.trim()),
  }
}

function splitShowLabel(showLabel?: string) {
  const trimmed = showLabel?.trim() ?? ""
  const match = trimmed.match(/^(\d{1,2}:\d{2}\s*[APap][Mm])\s+(.*)$/)

  if (!match) {
    return {
      timeLabel: "",
      title: trimmed || "Reservation Ticket",
    }
  }

  return {
    timeLabel: match[1].toUpperCase(),
    title: match[2].trim(),
  }
}

function buildShowData(showDate: string, showLabel?: string): TicketPrintShow {
  const { timeLabel, title } = splitShowLabel(showLabel)
  const baseDate = new Date(`${showDate}T00:00:00`)

  if (Number.isNaN(baseDate.getTime())) {
    return {
      title,
      dateLabel: showDate,
      timeLabel,
      dateTimeLabel: [showDate, timeLabel].filter(Boolean).join(" "),
    }
  }

  let dateForDisplay = baseDate
  if (timeLabel) {
    const timeMatch = timeLabel.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/)
    if (timeMatch) {
      let hours = Number(timeMatch[1]) % 12
      const minutes = Number(timeMatch[2])
      if (timeMatch[3] === "PM") {
        hours += 12
      }
      dateForDisplay = new Date(baseDate)
      dateForDisplay.setHours(hours, minutes, 0, 0)
    }
  }

  return {
    title,
    dateLabel: baseDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    timeLabel,
    dateTimeLabel: dateForDisplay.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  }
}

function resolvePaymentType(source: string) {
  const normalized = source.trim().toLowerCase()

  if (normalized === "walkup") {
    return "Cash"
  }

  if (normalized === "phone") {
    return "Credit Card"
  }

  return "Web"
}

function formatReservationSource(source: string) {
  const normalized = source.trim().toLowerCase()

  if (normalized === "walkup") {
    return "Walkup"
  }

  if (normalized === "phone") {
    return "Phone"
  }

  if (normalized === "web") {
    return "Web"
  }

  return titleCaseWords(source.trim()) || "Walkup"
}

function buildCustomerFullName(firstName: string, lastName: string) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim()
  return fullName || "Guest"
}

function buildPrintedTicket(ticket: TicketPrintData, ticketCount: number) {
  const originalCount = Math.max(1, ticket.reservation.partySize)
  const normalizedCount = Math.min(Math.max(1, ticketCount), originalCount)
  const perTicketAmount = roundMoney(ticket.reservation.totalAmount / originalCount)
  const printedTotal = roundMoney(perTicketAmount * normalizedCount)

  return {
    ...ticket,
    reservation: {
      ...ticket.reservation,
      partySize: normalizedCount,
      totalAmount: printedTotal,
      remainingCount: Math.max(0, normalizedCount - ticket.reservation.checkedInCount),
    },
  }
}

async function buildQrMarkup(value: string) {
  const svg = await QRCode.toString(value, {
    type: "svg",
    width: 80,
    margin: 0,
    errorCorrectionLevel: "M",
    color: {
      dark: "#111827",
      light: "#FFFFFF",
    },
  })

  return `
    <div class="qr-wrap" aria-label="Reservation QR">
      <div class="qr-svg">${svg}</div>
    </div>
  `
}

function buildTicketMarkup(
  ticket: TicketPrintData,
  isReprint: boolean,
  qrMarkup: string,
  includeQr: boolean,
  ticketIndex?: number
) {
  const footerText = isReprint ? ticket.text.reprintFooter : ticket.text.printFooter
  const tablesList = ticket.reservation.tables ? ticket.reservation.tables.split(",").map(s => s.trim()) : []
  const tableNo = ticketIndex !== undefined && tablesList.length > ticketIndex ? tablesList[ticketIndex] : ticket.reservation.tables || ""
  
  const seatsList = ticket.reservation.seatNumbers ? ticket.reservation.seatNumbers.split(",").map(s => {
    const match = s.trim().match(/#\d+\$(\d+)/)
    return match ? match[1] : s.trim()
  }) : []
  const ticketNo = ticketIndex !== undefined && seatsList.length > ticketIndex ? seatsList[ticketIndex] : (1001 + (ticketIndex || 0)).toString()
  
  const headerBox = ticketIndex !== undefined ? `
      <div class="ticket-header-box">
        TABLE NO: ${escapeHtml(tableNo)} &nbsp;|&nbsp; TICKET NO: ${escapeHtml(ticketNo)}
      </div>` : ""

  return `
    <section class="ticket">
      <div class="venue">
        <div class="venue-name">${escapeHtml(ticket.venue.venueName)}</div>
        ${ticket.venue.addressLines
      .map((line) => `<div>${escapeHtml(line)}</div>`)
      .join("")}
        <div>${escapeHtml(ticket.venue.website)}</div>
      </div>

      <div class="divider"></div>
      ${headerBox}
      <div class="customer-name">${escapeHtml(ticket.customer.fullName)}</div>
      <div class="show-datetime">${escapeHtml(ticket.show.dateTimeLabel)}</div>
      <div class="ticket-summary">
        ${escapeHtml(
        `${ticket.reservation.partySize} ticket(s) for "${ticket.show.title}"`
      )}
      </div>
      <div class="source">${escapeHtml(ticket.reservation.source)}</div>
      
      <div class="detail-row">
      <span>Payment Type:</span>
      <span>${escapeHtml(ticket.reservation.paymentType)}</span>
      </div>
      
      <div class="back">Back</div>
      
      <div class="total-label">Total :${escapeHtml(
        formatCurrency(ticket.reservation.totalAmount)
      )}</div>
      <div class="middle-text">${buildMiddleTextMarkup(ticket.text.middleText)}</div>

      <div class="notice">----------- DO NOT DISCARD -----------</div>
      <div class="bottom-text">${escapeHtml(ticket.text.bottomText)}</div>

      ${includeQr ? qrMarkup : ""}
      <div class="footer-text">${escapeHtml(footerText)}</div>
    </section>
  `
}

async function buildPrintDocument(
  ticket: TicketPrintData,
  ticketCount: number,
  isReprint: boolean,
  includeQr: boolean,
  layout: TicketPrintLayout
) {
  const originalCount = Math.max(1, ticket.reservation.partySize)
  const normalizedCount = Math.min(Math.max(1, ticketCount), originalCount)

  const ticketMarkup = layout === "individual"
    ? (await Promise.all(
      Array.from({ length: normalizedCount }, async (_, i) => {
        const printedTicket = buildPrintedTicket(ticket, 1)
        const qrMarkup = includeQr
          ? await buildQrMarkup(printedTicket.qrValue)
          : ""

        return `<div class="page">${buildTicketMarkup(printedTicket, isReprint, qrMarkup, includeQr, i)}</div>`
      })
    )).join("")
    : await (async () => {
      const printedTicket = buildPrintedTicket(ticket, normalizedCount)
      const qrMarkup = includeQr
        ? await buildQrMarkup(printedTicket.qrValue)
        : ""

      return `<div class="page">${buildTicketMarkup(printedTicket, isReprint, qrMarkup, includeQr)}</div>`
    })()

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(ticket.customer.fullName)} Ticket</title>
    <style>
      :root { color-scheme: light; }
      body {
        margin: 0;
        background: #fff;
        color: #000;
        font-family: "Times New Roman", serif;
      }
      .page {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0;
        break-after: page;
        page-break-after: always;
      }
      .page:last-child {
        break-after: auto;
        page-break-after: auto;
      }
      .ticket {
        width: 100%;
        padding: 0mm 4mm 7mm;
        text-align: center;
        box-sizing: border-box;
      }
      .venue-name,
      .customer-name,
      .ticket-summary,
      .source,
      .total-label,
      .notice,
      .footer-text,
      .bottom-text,
      .back {
        font-weight: 700;
      }
      .venue {
        font-size: 14px;
        line-height: 1.35;
      }
      .venue-name {
        font-size: 18px !important;
        margin-bottom: 4px;
      }
      .divider {
        margin: 5px 0;
        border-top: 2px solid #111827;
      }
      .customer-name {
        font-size: 16px;
      }
      .ticket-header-box {
        font-size: 14px;
        font-weight: 700;
        margin: 5px 0;
      }
      .show-datetime {
        margin-top: 3px;
        font-size: 12px;
      }
      .ticket-summary {
        margin-top: 5px;
        font-size: 14px;
      }
      .source {
        margin-top: 2px;
        font-size: 16px;
      }
      .detail-row {
        display: flex;
        justify-content: center;
        gap: 4px;
        margin-top: 3px;
        font-size: 12px;
      }
      .back {
        margin: 15px 0 5px;
        font-size: 14px;
      }
      .total-label {
        margin-top: 3px;
        font-size: 12px;
      }
      .middle-text,
      .bottom-text {
        margin-top: 2px;
        font-size: 12px;
        line-height: 1.35;
      }
      .notice {
        margin-top: 12px;
        font-size: 14px;
      }
      .qr-wrap {
        margin: 9px auto 0;
        width: 80px;
      }
      .qr-svg svg {
        display: block;
        width: 80px;
        height: 80px;
      }
      .qr-caption {
        margin-top: 6px;
        font-family: monospace;
        font-size: 10px;
        word-break: break-all;
      }
      .footer-text {
        margin-top: 7px;
        font-size: 14px;
      }
      @page {
        size: 80mm auto;
        margin: 0;
      }
      @media print {
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
      }
    </style>
  </head>
  <body>
    ${ticketMarkup}
  </body>
</html>`
}

function removePrintFrame(frame: HTMLIFrameElement) {
  window.setTimeout(() => {
    frame.remove()
  }, 0)
}

async function startPrintDocument(html: string) {
  const frame = document.createElement("iframe")
  frame.setAttribute("aria-hidden", "true")
  frame.style.position = "fixed"
  frame.style.right = "0"
  frame.style.bottom = "0"
  frame.style.width = "0"
  frame.style.height = "0"
  frame.style.border = "0"
  frame.style.opacity = "0"
  frame.style.pointerEvents = "none"

  document.body.appendChild(frame)

  const frameWindow = frame.contentWindow
  const frameDocument = frame.contentDocument

  if (!frameWindow || !frameDocument) {
    removePrintFrame(frame)
    return false
  }

  let cleanedUp = false

  const cleanup = () => {
    if (cleanedUp) {
      return
    }
    cleanedUp = true
    frameWindow.onafterprint = null
    removePrintFrame(frame)
  }

  frameWindow.onafterprint = cleanup

  frameDocument.open()
  frameDocument.write(html)
  frameDocument.close()

  return await new Promise<boolean>((resolve) => {
    window.setTimeout(() => {
      try {
        frameWindow.focus()
        frameWindow.print()
        resolve(true)
      } catch {
        cleanup()
        resolve(false)
      }
    }, 80)

    window.setTimeout(cleanup, 60000)
  })
}



export function buildReprintCountOptions(partySize: number) {
  return Array.from({ length: Math.max(1, partySize) }, (_, index) => index + 1)
}

export function createTicketPrintData({
  reservationId,
  firstName,
  lastName,
  partySize,
  checkedInCount = 0,
  totalAmount,
  paidAmount,
  paymentType,
  source,
  section,
  showDate,
  showLabel,
  locationName,
  qrValue,
  tables,
  seatNumbers,
}: CreateTicketPrintDataParams): TicketPrintData {
  const normalizedPartySize = Math.max(1, partySize)
  const normalizedCheckedInCount = Math.max(
    0,
    Math.min(checkedInCount, normalizedPartySize)
  )

  return {
    venue: resolveVenue(locationName),
    customer: {
      firstName,
      lastName,
      fullName: buildCustomerFullName(firstName, lastName),
    },
    show: buildShowData(showDate, showLabel),
    reservation: {
      reservationId,
      partySize: normalizedPartySize,
      checkedInCount: normalizedCheckedInCount,
      remainingCount: Math.max(0, normalizedPartySize - normalizedCheckedInCount),
      totalAmount: roundMoney(totalAmount),
      paidAmount: roundMoney(paidAmount),
      paymentType,
      source: formatReservationSource(source),
      section: section || "General",
      tables: tables || null,
      seatNumbers: seatNumbers || null,
    },
    text: DEFAULT_TICKET_TEXT,
    qrValue: qrValue || reservationId,
  }
}

export async function getMockTicketPrintData({
  reservation,
  showDate,
  showLabel,
  locationName,
}: GetMockTicketPrintDataParams): Promise<TicketPrintData> {
  await new Promise((resolve) => window.setTimeout(resolve, 140))

  return createTicketPrintData({
    reservationId: reservation.id,
    firstName: reservation.firstName,
    lastName: reservation.lastName,
    partySize: Math.max(1, reservation.qty),
    checkedInCount: Math.max(0, reservation.scanner),
    totalAmount: parseCurrency(reservation.total),
    paidAmount: parseCurrency(reservation.paid),
    paymentType: resolvePaymentType(reservation.source),
    source: reservation.source,
    section: reservation.section || "General",
    tables: reservation.tables || null,
    seatNumbers: reservation.seatNo || null,
    showDate,
    showLabel,
    locationName,
    qrValue: reservation.id,
  })
}

export async function printReservationTicket({
  ticket,
  ticketCount,
  isReprint = false,
  includeQr = true,
  layout = "combined",
}: PrintReservationTicketRequest) {
  const normalizedCount = Math.min(
    Math.max(1, ticketCount),
    Math.max(1, ticket.reservation.partySize)
  )


  const html = await buildPrintDocument(
    ticket,
    normalizedCount,
    isReprint,
    includeQr,
    layout
  )

  return await startPrintDocument(html)
}

export async function printSignatureTicket(properties: ReservationPrintProperties) {
  const html = buildSignatureMarkup(properties)
  return await startPrintDocument(html)
}

function buildSignatureMarkup(properties: ReservationPrintProperties) {
  const escapeHtml = (unsafe: string) => {
    return (unsafe || "")
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
  }

  // Format dates according to image
  // Current Date e.g. "Thursday, July 09, 2026" and Time "12:16 PM"
  const now = new Date()
  const currentDate = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "2-digit", year: "numeric" })
  const currentTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

  // Show Date e.g. "06/28/26 01:30 PM"
  let showDateTime = ""
  if (properties.showtm) {
    const showDt = new Date(properties.showtm)
    const dateStr = showDt.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" })
    const timeStr = showDt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    showDateTime = `${dateStr} ${timeStr}`
  }

  const reservationIdStr = `{${properties.reservationid}}`

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Signature Slip - ${escapeHtml(properties.CustomerName || "")}</title>
    <style>
      :root { color-scheme: light; }
      body {
        margin: 0;
        background: #fff;
        color: #000;
        font-family: "Times New Roman", serif;
      }
      .page {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0;
      }
      .ticket {
        width: 100%;
        padding: 0mm 4mm 7mm;
        box-sizing: border-box;
      }
      .center {
        text-align: center;
      }
      .flex-between {
        display: flex;
        justify-content: space-between;
      }
      .current-date {
        margin-top: 10px;
        font-size: 14px;
      }
      .current-time {
        font-size: 14px;
        margin-bottom: 10px;
      }
      .show-time-row {
        margin-bottom: 10px;
        font-size: 14px;
      }
      .show-time-row .right {
        text-align: right;
        max-width: 120px;
      }
      .tickets-row {
        margin-bottom: 5px;
        font-size: 14px;
      }
      .venue-section {
        margin-top: 5px;
        margin-bottom: 5px;
        font-size: 14px;
      }
      .venue-name {
        font-size: 16px;
        font-weight: bold;
      }
      .customer-name {
        font-size: 14px;
        margin-bottom: 5px;
      }
      .reservation-id {
        font-size: 12px;
        margin-bottom: 20px;
        word-break: break-all;
      }
      .payment-row {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 5px;
      }
      .auth-row {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 30px;
      }
      .signature-row {
        font-size: 14px;
        margin-top: 20px;
        text-align: left;
      }
      .signature-line {
        border-bottom: 1px solid #000;
        display: inline-block;
        width: calc(100% - 70px);
        margin-left: 5px;
      }
      @page {
        size: 80mm auto;
        margin: 0;
      }
      @media print {
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <section class="ticket">
        <div class="center current-date">${escapeHtml(currentDate)}</div>
        <div class="center current-time">${escapeHtml(currentTime)}</div>
        
        <div class="flex-between show-time-row">
          <span>ShowTime</span>
          <span class="right">${escapeHtml(showDateTime).replace(" AM", "<br/>AM").replace(" PM", "<br/>PM")}</span>
        </div>
        
        <div class="flex-between tickets-row">
          <span>${properties.PartyNo || 0} ticket(s) for</span>
          <span>${escapeHtml(properties.Headliner || "")}</span>
        </div>
        
        <div class="center venue-section">
          <div class="venue-name">${escapeHtml(properties.LocSName || "")}</div>
          <div>${escapeHtml(properties.LocAddr1 || "")}${escapeHtml(properties.LocCity || "")}, ${escapeHtml(properties.LocState || "")}, ${escapeHtml(properties.LocZip || "").trim()}</div>
          <div>${escapeHtml(properties.LocURL || "")}</div>
          <div class="customer-name">${escapeHtml(properties.CustomerName || "")}</div>
          <div class="reservation-id">${escapeHtml(reservationIdStr)}</div>
        </div>
        
        <div class="flex-between payment-row">
          <span>${escapeHtml(properties.CardType || "")} ${escapeHtml(properties.CardNum || "")}</span>
          <span>$${properties.PaiedAmount ? properties.PaiedAmount.toFixed(2) : "0.00"}</span>
        </div>
        
        <div class="flex-between auth-row">
          <span>Authorization:</span>
          <span>${escapeHtml(properties.Auth || "")}</span>
        </div>
        
        <div class="signature-row">
          Signature<span class="signature-line"></span>
        </div>
        
      </section>
    </div>
  </body>
</html>`
}