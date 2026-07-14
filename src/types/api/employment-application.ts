export interface EmploymentApplication {
  EntryID: string
  OpeningID: string
  LocationID: string
  FirstName: string
  LastName: string
  DateSubmitted: string
  Reviewed: string
  ReviewedBy: string | null
  HireDate: string | null
  DismissalDate: string | null
  ReviewComments: string | null
}

export interface EmploymentApplicationBio {
  FirstName: string
  LastName: string
  Address1: string
  Address2: string
  City: string
  State: string
  Zipcode: string
  EmailAddress: string
  PrimaryPhone: string
  SecondaryPhone: string | null
}

export interface EmploymentApplicationOpening {
  EntryID: string
  OpeningID: string
  OpeningHeader: string
  OpeningDescription: string
  OtherOpportunities: string | null
}

export interface EmploymentApplicationQuestion {
  Question: string
  Answer: string
}

export interface EmploymentApplicationReview {
  DateSubmitted: string
  Reviewed: string
  ReviewedBy: string | null
  ReviewedOn: string | null
  HireDate: string | null
  DismissalDate: string | null
  ReviewComments: string | null
}

export interface UpdateEmploymentApplicationReviewRequest {
  ConnectionString: string
  EntryID: string
  ReviewedBy: string
  ReviewedOn: string
  HireDate: string | null
  DismissalDate: string | null
  ReviewComments: string | null
}
