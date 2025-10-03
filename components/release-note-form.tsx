"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Play, Save, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ReleaseNoteData, DocumentChange, ChangelogEntry, APIEndpoint } from "@/lib/types"

interface ReleaseNoteFormProps {
  onGenerate: (data: ReleaseNoteData) => void
}

export function ReleaseNoteForm({ onGenerate }: ReleaseNoteFormProps) {
  const { toast } = useToast()
  const [service, setService] = useState("")
  const [version, setVersion] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [contacts, setContacts] = useState("")
  const [overview, setOverview] = useState("")

  const [enableDocChanges, setEnableDocChanges] = useState(false)
  const [documentChanges, setDocumentChanges] = useState<DocumentChange[]>([])

  const [enableDbUpdates, setEnableDbUpdates] = useState(false)
  const [databaseUpdates, setDatabaseUpdates] = useState<string[]>([])

  const [enableImprovements, setEnableImprovements] = useState(false)
  const [improvements, setImprovements] = useState<string[]>([])

  const [enableBugFixes, setEnableBugFixes] = useState(false)
  const [bugFixes, setBugFixes] = useState<string[]>([])

  const [enableAPIs, setEnableAPIs] = useState(false)
  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([])

  const [enableChangelog, setEnableChangelog] = useState(false)
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([])
  const [showChangelogHistoryInput, setShowChangelogHistoryInput] = useState(false)
  const [changelogHistoryText, setChangelogHistoryText] = useState("")

  const handleGenerate = () => {
    if (!service || !version) {
      toast({
        title: "Missing information",
        description: "Please fill in service name and version.",
        variant: "destructive",
      })
      return
    }

    const data: ReleaseNoteData = {
      service,
      version,
      date,
      contacts,
      overview,
      documentChanges: enableDocChanges ? documentChanges : undefined,
      databaseUpdates: enableDbUpdates ? databaseUpdates.filter(Boolean) : undefined,
      improvements: enableImprovements ? improvements.filter(Boolean) : undefined,
      bugFixes: enableBugFixes ? bugFixes.filter(Boolean) : undefined,
      apis: enableAPIs ? apiEndpoints.filter(api => api.label.trim() && api.endpoints.some(ep => ep.trim())) : undefined,
      changelog: enableChangelog ? changelog : undefined,
    }

    onGenerate(data)
  }

  const handleSaveDraft = () => {
    const draft = {
      service,
      version,
      date,
      contacts,
      overview,
      enableDocChanges,
      documentChanges,
      enableDbUpdates,
      databaseUpdates,
      enableImprovements,
      improvements,
      enableBugFixes,
      bugFixes,
      enableAPIs,
      apiEndpoints,
      enableChangelog,
      changelog,
    }
    localStorage.setItem("release-note-draft", JSON.stringify(draft))
    toast({
      title: "Draft saved",
      description: "Your work has been saved to browser storage.",
    })
  }

  const handleParseChangelogHistory = () => {
    if (!changelogHistoryText.trim()) {
      toast({
        title: "Empty input",
        description: "Please paste your changelog history.",
        variant: "destructive",
      })
      return
    }

    const lines = changelogHistoryText.trim().split('\n').filter(line => line.trim())
    const newEntries: ChangelogEntry[] = []
    
    for (const line of lines) {
      // Parse format: [version] (date): description
      const match = line.match(/^\s*\[([^\]]+)\]\s*\(([^)]+)\):\s*(.+)$/)
      if (match) {
        const [, version, date, description] = match
        
        // Convert date format from DD/MM/YYYY to YYYY-MM-DD
        let formattedDate = date.trim()
        const dateMatch = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
        if (dateMatch) {
          const [, day, month, year] = dateMatch
          formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        }
        
        newEntries.push({
          version: version.trim(),
          date: formattedDate,
          description: description.trim(),
        })
      }
    }
    
    if (newEntries.length > 0) {
      setChangelog([...changelog, ...newEntries])
      setEnableChangelog(true)
      setChangelogHistoryText("")
      setShowChangelogHistoryInput(false)
      toast({
        title: "Changelog history parsed",
        description: `Added ${newEntries.length} changelog entries.`,
      })
    } else {
      toast({
        title: "No valid entries found",
        description: "Please use format: [version] (date): description",
        variant: "destructive",
      })
    }
  }

  const handleLoadSample = () => {
    setService("AI Face Service")
    setVersion("0.0.1.20")
    setDate(new Date().toISOString().split("T")[0])
    setContacts("hailq9, nhatvd2")
    setOverview(
      "Cross-system face synchronization (FM - AIS - Device). New DB collections + versioning; APIs for synchronization.",
    )

    setEnableDocChanges(true)
    setDocumentChanges([
      { name: "SW - API Design", date: new Date().toISOString().split("T")[0], owner: "hailq9", version: "v1.2" },
      { name: "SW - Database Design", date: new Date().toISOString().split("T")[0], owner: "nhatvd2", version: "v1.0" },
    ])

    setEnableDbUpdates(true)
    setDatabaseUpdates([
      "New collection: FaceUserMetadata",
      "New collection: DeviceSyncStatus",
      "Versioning for Face collection",
    ])

    setEnableImprovements(true)
    setImprovements(["Optimized query indexes", "Updated Hazelcast with new metadata"])

    setEnableBugFixes(true)
    setBugFixes(["Fixed incorrect image file naming"])

    setEnableAPIs(true)
    setApiEndpoints([
      { 
        label: "Device APIs", 
        endpoints: ["GET /api/device/v1/faces/metadata", "POST /api/device/v1/faces/sync/ack"] 
      },
      { 
        label: "AI Cloud APIs", 
        endpoints: ["GET /api/aicloud/v1/faces/metadata", "POST /api/aicloud/v1/faces/sync/ack"] 
      }
    ])

    setEnableChangelog(true)
    setChangelog([
      {
        version: "0.0.1.20",
        date: new Date().toISOString().split("T")[0],
        description: "Cross-system sync, DB + APIs, bug fixes",
      },
    ])

    toast({
      title: "Sample loaded",
      description: "Sample data has been loaded into the form.",
    })
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Release Information</CardTitle>
            <CardDescription>Fill in the details for your release note</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleLoadSample}>
              <Play className="h-4 w-4 mr-2" />
              Sample
            </Button>
            <Button variant="outline" size="sm" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={handleGenerate} size="sm">
              <Play className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-6 py-6 scrollbar-thin">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="service">Service *</Label>
            <Input
              id="service"
              placeholder="Name of service"
              value={service}
              onChange={(e) => setService(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="version">Version *</Label>
            <Input id="version" placeholder="0.0.1.20" value={version} onChange={(e) => setVersion(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Release Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contacts">Contacts</Label>
            <Input
              id="contacts"
              placeholder="Name of contacts (separated by comma)"
              value={contacts}
              onChange={(e) => setContacts(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="overview">Overview</Label>
            <Textarea
              id="overview"
              placeholder="Brief summary of this release..."
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        {/* Document Changes */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="doc-changes"
                checked={enableDocChanges}
                onCheckedChange={(checked) => setEnableDocChanges(checked as boolean)}
              />
              <Label htmlFor="doc-changes" className="font-semibold cursor-pointer">
                📄 Document Changes
              </Label>
            </div>
            <span className="text-xs text-muted-foreground">Optional</span>
          </div>

          {enableDocChanges && (
            <div className="space-y-2">
              {documentChanges.map((doc, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <Input
                    placeholder="Document name"
                    value={doc.name}
                    onChange={(e) => {
                      const newDocs = [...documentChanges]
                      newDocs[index].name = e.target.value
                      setDocumentChanges(newDocs)
                    }}
                    className="col-span-4"
                  />
                  <Input
                    type="date"
                    value={doc.date}
                    onChange={(e) => {
                      const newDocs = [...documentChanges]
                      newDocs[index].date = e.target.value
                      setDocumentChanges(newDocs)
                    }}
                    className="col-span-3"
                  />
                  <Input
                    placeholder="Owner"
                    value={doc.owner}
                    onChange={(e) => {
                      const newDocs = [...documentChanges]
                      newDocs[index].owner = e.target.value
                      setDocumentChanges(newDocs)
                    }}
                    className="col-span-2"
                  />
                  <Input
                    placeholder="v1.0"
                    value={doc.version}
                    onChange={(e) => {
                      const newDocs = [...documentChanges]
                      newDocs[index].version = e.target.value
                      setDocumentChanges(newDocs)
                    }}
                    className="col-span-2"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDocumentChanges(documentChanges.filter((_, i) => i !== index))}
                    className="col-span-1"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDocumentChanges([...documentChanges, { name: "", date: "", owner: "", version: "" }])}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            </div>
          )}
        </div>

        {/* Database Updates & Improvements */}
        <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="db-updates"
                  checked={enableDbUpdates}
                  onCheckedChange={(checked) => setEnableDbUpdates(checked as boolean)}
                />
                <Label htmlFor="db-updates" className="font-semibold cursor-pointer">
                Database Updates
                </Label>
              </div>
              <span className="text-xs text-muted-foreground">Optional</span>
            </div>
            {enableDbUpdates && (
              <div className="space-y-2">
                {databaseUpdates.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Database update description..."
                      value={item}
                      onChange={(e) => {
                        const newItems = [...databaseUpdates]
                        newItems[index] = e.target.value
                        setDatabaseUpdates(newItems)
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDatabaseUpdates(databaseUpdates.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setDatabaseUpdates([...databaseUpdates, ""])}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="improvements"
                  checked={enableImprovements}
                  onCheckedChange={(checked) => setEnableImprovements(checked as boolean)}
                />
                <Label htmlFor="improvements" className="font-semibold cursor-pointer">
                Improvements
                </Label>
              </div>
              <span className="text-xs text-muted-foreground">Optional</span>
            </div>
            {enableImprovements && (
              <div className="space-y-2">
                {improvements.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Improvement description..."
                      value={item}
                      onChange={(e) => {
                        const newItems = [...improvements]
                        newItems[index] = e.target.value
                        setImprovements(newItems)
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setImprovements(improvements.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setImprovements([...improvements, ""])}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Bug Fixes & APIs */}
        <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="bug-fixes"
                  checked={enableBugFixes}
                  onCheckedChange={(checked) => setEnableBugFixes(checked as boolean)}
                />
                <Label htmlFor="bug-fixes" className="font-semibold cursor-pointer">
                Bug Fixes
                </Label>
              </div>
              <span className="text-xs text-muted-foreground">Optional</span>
            </div>
            {enableBugFixes && (
              <div className="space-y-2">
                {bugFixes.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Bug fix description..."
                      value={item}
                      onChange={(e) => {
                        const newItems = [...bugFixes]
                        newItems[index] = e.target.value
                        setBugFixes(newItems)
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setBugFixes(bugFixes.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setBugFixes([...bugFixes, ""])}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bug Fix
                </Button>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="apis"
                  checked={enableAPIs}
                  onCheckedChange={(checked) => setEnableAPIs(checked as boolean)}
                />
                <Label htmlFor="apis" className="font-semibold cursor-pointer">
                APIs
                </Label>
              </div>
              <span className="text-xs text-muted-foreground">Optional</span>
            </div>
            {enableAPIs && (
              <div className="space-y-4">
                {apiEndpoints.map((apiGroup, groupIndex) => (
                  <div key={groupIndex} className="border rounded-lg p-3 bg-muted/30">
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="API Name (e.g., Device API, User API)"
                        value={apiGroup.label}
                        onChange={(e) => {
                          const newApiEndpoints = [...apiEndpoints]
                          newApiEndpoints[groupIndex].label = e.target.value
                          setApiEndpoints(newApiEndpoints)
                        }}
                        className="font-medium"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setApiEndpoints(apiEndpoints.filter((_, i) => i !== groupIndex))}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2 ml-4">
                      {apiGroup.endpoints.map((endpoint, endpointIndex) => (
                        <div key={endpointIndex} className="flex gap-2">
                          <Input
                            placeholder="GET /api/endpoint/..."
                            value={endpoint}
                            onChange={(e) => {
                              const newApiEndpoints = [...apiEndpoints]
                              newApiEndpoints[groupIndex].endpoints[endpointIndex] = e.target.value
                              setApiEndpoints(newApiEndpoints)
                            }}
                            className="font-mono text-sm"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newApiEndpoints = [...apiEndpoints]
                              newApiEndpoints[groupIndex].endpoints = newApiEndpoints[groupIndex].endpoints.filter((_, i) => i !== endpointIndex)
                              setApiEndpoints(newApiEndpoints)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newApiEndpoints = [...apiEndpoints]
                          newApiEndpoints[groupIndex].endpoints.push("")
                          setApiEndpoints(newApiEndpoints)
                        }}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Endpoint
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setApiEndpoints([...apiEndpoints, { label: "", endpoints: [""] }])}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add API Group
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Changelog */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="changelog"
                checked={enableChangelog}
                onCheckedChange={(checked) => setEnableChangelog(checked as boolean)}
              />
              <Label htmlFor="changelog" className="font-semibold cursor-pointer">
                📝 Changelog
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Optional</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChangelogHistoryInput(!showChangelogHistoryInput)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add History
              </Button>
            </div>
          </div>
          
          {showChangelogHistoryInput && (
            <div className="mb-4 p-4 border rounded-lg bg-muted/30">
              <Label className="text-sm font-medium mb-2 block">
                Paste changelog history (format: [version] (date): description)
              </Label>
              <Textarea
                placeholder={`[0.0.1.20] (03/10/2025): Cross-system sync, DB + APIs, bug fixes
[0.0.1.19] (02/10/2025): Fixed authentication issues
[0.0.1.18] (01/10/2025): Added new API endpoints`}
                value={changelogHistoryText}
                onChange={(e) => setChangelogHistoryText(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
              />
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleParseChangelogHistory}>
                  Parse & Add
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setShowChangelogHistoryInput(false)
                    setChangelogHistoryText("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {enableChangelog && (
            <div className="space-y-2">
              {changelog.map((entry, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <Input
                    placeholder="Version"
                    value={entry.version}
                    onChange={(e) => {
                      const newChangelog = [...changelog]
                      newChangelog[index].version = e.target.value
                      setChangelog(newChangelog)
                    }}
                    className="col-span-3"
                  />
                  <Input
                    type="date"
                    value={entry.date}
                    onChange={(e) => {
                      const newChangelog = [...changelog]
                      newChangelog[index].date = e.target.value
                      setChangelog(newChangelog)
                    }}
                    className="col-span-3"
                  />
                  <Input
                    placeholder="Description"
                    value={entry.description}
                    onChange={(e) => {
                      const newChangelog = [...changelog]
                      newChangelog[index].description = e.target.value
                      setChangelog(newChangelog)
                    }}
                    className="col-span-5"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setChangelog(changelog.filter((_, i) => i !== index))}
                    className="col-span-1"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChangelog([...changelog, { version: "", date: "", description: "" }])}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Version
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
