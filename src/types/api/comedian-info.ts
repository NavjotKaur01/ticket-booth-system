export type ApiComedianInfo = {
  ComicID: string
  FirstName: string | null
  LastName: string | null
  StageName: string | null
  URL: string | null
  AltURL: string | null
  Active: string | null
  ArtistType: string | null
  Email: string | null
  Address1: string | null
  Address2: string | null
  State: string | null
  Country: string | null
  City: string | null
  ZipCode: string | null
  HomePhone: string | null
  CellPhone: string | null
  Fax: string | null
  PreferredContact: string | null
  GlobalNote: string | null
  LocalNote: string | null
  GlobalBio: string | null
  LocalBio: string | null
  GlobalPicture?: string | null
  LocalPicture?: string | null
  GlobalPic?: string | null
  LocalPic?: string | null
  Pic?: string | null
}

export type ComedianRequestModel = {
  ConnectionString: string
  LastUpdateID: string
  LocationId: string
  LastUpdateDt: string
  ComicId: string
  AltURL: string
  ArtistType: string
  FirstName: string
  LastName: string
  StageName: string
  URL: string
  Address1: string
  Address2: string
  CellPhone: string
  HomePhone: string
  Fax: string
  Email: string
  ZipCode: string
  PreferredContact: string
  City: string
  State: string
  Country: string
  GlobalBio: string
  GlobalNote: string
}

export type ComedianImageRequestModel = {
  ConnectionString: string
  LastUpdateID: string
  LocationId: string
  LastUpdateDt: string
  Image: string
  ComicId?: string
}
