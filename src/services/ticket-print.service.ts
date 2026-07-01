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
  includeQr: boolean
) {
  const footerText = isReprint ? ticket.text.reprintFooter : ticket.text.printFooter

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
        Array.from({ length: normalizedCount }, async () => {
          const printedTicket = buildPrintedTicket(ticket, 1)
          const qrMarkup = includeQr
            ? await buildQrMarkup(printedTicket.qrValue)
            : ""

          return `<div class="page">${buildTicketMarkup(printedTicket, isReprint, qrMarkup, includeQr)}</div>`
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














