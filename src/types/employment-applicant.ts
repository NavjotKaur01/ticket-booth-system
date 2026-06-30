export type EmploymentApplicantFilterGroup = {
  id: string
  locationId: string
  label: string
}

export type EmploymentApplicantRecord = {
  id: string
  locationId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  positionGroupId: string
  positionGroupLabel: string
  opportunityId: string
  opportunityTitle: string
  submittedOn: string
  reviewed: boolean
  reviewedBy: string
  hireDate: string | null
  dismissalDate: string | null
  notes: string
}

export type EmploymentApplicantUpdateInput = {
  reviewed: boolean
  reviewedBy: string
  hireDate: string | null
  dismissalDate: string | null
  notes: string
}
