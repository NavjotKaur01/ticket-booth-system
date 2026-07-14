import type { PreSaleRecord } from "@/types/pre-sale"

export const preSaleShowOptions = [
  { id: "1", label: "7:30 PM Benson, Doug" },
  { id: "2", label: "9:30 PM Benson, Doug" },
  { id: "3", label: "10:00 PM Open Mic Night" },
] as const

export const preSaleComicOptions = [
  { id: "bandit", label: "The Bandit" },
  { id: "benson", label: "Doug Benson" },
  { id: "spark", label: "Jane Spark" },
  { id: "laughs", label: "Johnny Laughs" },
] as const

export const preSaleRecords: PreSaleRecord[] = [
  {
    id: "1",
    accessCode: "SUMTESTNEW",
    startDate: "8/28/2023 12:00:00 AM",
    endDate: "10/1/2023 11:00:00 PM",
    createdBy: "max",
    createDate: "8/28/2023 10:15:32 AM",
    privateLink: "",
  },
  {
    id: "2",
    accessCode: "PASS",
    startDate: "9/1/2023 12:00:00 AM",
    endDate: "12/31/2023 11:59:00 PM",
    createdBy: "admin",
    createDate: "9/1/2023 9:02:11 AM",
    privateLink: "",
  },
  {
    id: "3",
    accessCode: "123",
    startDate: "6/1/2024 12:00:00 AM",
    endDate: "6/30/2024 11:00:00 PM",
    createdBy: "admin",
    createDate: "6/1/2024 8:44:05 AM",
    privateLink: "",
  },
  {
    id: "4",
    accessCode: "VIP2024",
    startDate: "1/1/2024 12:00:00 AM",
    endDate: "3/31/2024 11:00:00 PM",
    createdBy: "admin",
    createDate: "1/2/2024 2:30:18 PM",
    privateLink: "",
  },
  {
    id: "5",
    accessCode: "EARLYBIRD",
    startDate: "5/15/2024 8:00:00 AM",
    endDate: "5/20/2024 11:59:00 PM",
    createdBy: "max",
    createDate: "5/14/2024 4:12:47 PM",
    privateLink: "",
  },
  {
    id: "6",
    accessCode: "COMPPASS",
    startDate: "2/10/2024 12:00:00 AM",
    endDate: "2/10/2024 11:59:00 PM",
    createdBy: "admin",
    createDate: "2/9/2024 11:05:22 AM",
    privateLink: "",
  },
  {
    id: "7",
    accessCode: "PRESALE01",
    startDate: "8/1/2024 12:00:00 AM",
    endDate: "8/15/2024 11:00:00 PM",
    createdBy: "admin",
    createDate: "7/28/2024 1:18:09 PM",
    privateLink: "",
  },
  {
    id: "8",
    accessCode: "TESTCODE",
    startDate: "6/19/2026 12:00:00 AM",
    endDate: "6/30/2026 11:00:00 PM",
    createdBy: "admin",
    createDate: "6/19/2026 9:00:00 AM",
    privateLink: "",
  },
]
