export interface DocumentChange {
  name: string
  date: string
  owner: string
  version: string
}

export interface ChangelogEntry {
  version: string
  date: string
  description: string
}

export interface APIEndpoint {
  label: string
  endpoints: string[]
}

export interface ReleaseNoteData {
  service: string
  version: string
  date: string
  contacts: string
  overview: string
  documentChanges?: DocumentChange[]
  databaseUpdates?: string[]
  improvements?: string[]
  bugFixes?: string[]
  apis?: APIEndpoint[]
  changelog?: ChangelogEntry[]
}
