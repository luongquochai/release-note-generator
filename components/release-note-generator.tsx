"use client"

import { useState } from "react"
import { ReleaseNoteForm } from "./release-note-form"
import { ReleaseNotePreview } from "./release-note-preview"
import { Button } from "@/components/ui/button"
import { FileDown, FileText, Copy, Eye, EyeOff, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import type { ReleaseNoteData } from "@/lib/types"

export function ReleaseNoteGenerator() {
  const [formData, setFormData] = useState<ReleaseNoteData | null>(null)
  const [markdown, setMarkdown] = useState("")
  const [showPreview, setShowPreview] = useState(true)
  const [formKey, setFormKey] = useState(0)
  const { toast } = useToast()

  const handleGenerate = (data: ReleaseNoteData) => {
    setFormData(data)
    const md = generateMarkdown(data)
    setMarkdown(md)
    toast({
      title: "Markdown Generated",
      description: "Your release note has been generated successfully.",
    })
  }

  const handleClearContent = () => {
    setFormData(null)
    setMarkdown("")
    setFormKey((prev) => prev + 1)
    toast({
      title: "Content Cleared",
      description: "All content has been cleared.",
    })
  }

  const handleCopyContent = async () => {
    if (!markdown) {
      toast({
        title: "No content",
        description: "Please generate markdown first.",
        variant: "destructive",
      })
      return
    }

    try {
      await navigator.clipboard.writeText(markdown)
      toast({
        title: "Copied!",
        description: "Content copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy content to clipboard.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadMarkdown = () => {
    if (!markdown) {
      toast({
        title: "No content",
        description: "Please generate markdown first.",
        variant: "destructive",
      })
      return
    }

    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${formData?.service || "release-note"}_${formData?.version || "v1"}.md`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded",
      description: "Markdown file downloaded successfully.",
    })
  }

  const handleDownloadWord = async () => {
    if (!markdown) {
      toast({
        title: "No content",
        description: "Please generate markdown first.",
        variant: "destructive",
      })
      return
    }

    const html = await convertMarkdownToHTML(markdown)
    const fullHTML = createWordDocument(html)

    const blob = new Blob([fullHTML], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${formData?.service || "release-note"}_${formData?.version || "v1"}.doc`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded",
      description: "Word document downloaded successfully.",
    })
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Release Note Generator</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Create professional release notes with markdown preview and Word export
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={handleClearContent} disabled={!markdown}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showPreview ? "Hide" : "Show"} Preview
              </Button>
              {/* <Button variant="outline" size="sm" onClick={handleCopyContent} disabled={!markdown}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button> */}
              <Button variant="outline" size="sm" onClick={handleDownloadMarkdown} disabled={!markdown}>
                <FileText className="h-4 w-4 mr-2" />
                .md
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadWord} disabled={!markdown}>
                <FileDown className="h-4 w-4 mr-2" />
                .docx
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-4 overflow-hidden">
        <div className={`grid gap-4 h-full ${showPreview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
          <div className="h-full overflow-hidden">
            <ReleaseNoteForm key={formKey} onGenerate={handleGenerate} />
          </div>

          {showPreview && (
            <div className="h-full overflow-hidden">
              <ReleaseNotePreview markdown={markdown} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function generateMarkdown(data: ReleaseNoteData): string {
  const lines: string[] = []

  lines.push(`# ${data.service} - Release Note`)
  lines.push("")
  lines.push(`📅 Release Date: ${formatDate(data.date)}`)
  lines.push(`🧩 Service: ${data.service}`)
  lines.push(`📦 Version: ${data.version}`)
  lines.push(`📞 Contact: ${data.contacts}`)
  lines.push("\n---\n")

  if (data.overview) {
    lines.push("## 🔍 Overview")
    lines.push(data.overview)
    lines.push("")
  }

  if (data.documentChanges && data.documentChanges.length > 0) {
    lines.push("## 📄 Document Changes")
    lines.push("| Document | Date | Owner | Version |")
    lines.push("|----------|------|-------|---------|")
    data.documentChanges.forEach((doc) => {
      lines.push(`| ${doc.name} | ${formatDate(doc.date)} | ${doc.owner} | ${doc.version} |`)
    })
    lines.push("")
  }

  const hasUpdates =
    (data.databaseUpdates && data.databaseUpdates.length > 0) ||
    (data.improvements && data.improvements.length > 0) ||
    (data.bugFixes && data.bugFixes.length > 0) ||
    (data.apis && data.apis.length > 0 && data.apis.some(api => api.label.trim() && api.endpoints.some(ep => ep.trim())))

  if (hasUpdates) {
    lines.push("## ⚙️ Updates")

    if (data.databaseUpdates && data.databaseUpdates.length > 0) {
      lines.push("### Database")
      data.databaseUpdates.forEach((item) => lines.push(`- ${item}`))
      lines.push("")
    }

    if (data.improvements && data.improvements.length > 0) {
      lines.push("### Improvements")
      data.improvements.forEach((item) => lines.push(`- ${item}`))
      lines.push("")
    }

    if (data.bugFixes && data.bugFixes.length > 0) {
      lines.push("### Bug Fixes")
      data.bugFixes.forEach((item) => lines.push(`- ${item}`))
      lines.push("")
    }

    if (data.apis && data.apis.length > 0) {
      lines.push("### APIs")
      data.apis.forEach((apiGroup) => {
        if (apiGroup.label.trim() && apiGroup.endpoints.some(ep => ep.trim())) {
          lines.push(`- **${apiGroup.label}**`)
          apiGroup.endpoints.forEach((endpoint) => {
            if (endpoint.trim()) {
              lines.push(`  - ${endpoint}`)
            }
          })
        }
      })
      lines.push("")
    }
  }

  if (data.changelog && data.changelog.length > 0) {
    lines.push("## 🚀 Changelog")
    data.changelog.forEach((change) => {
      lines.push(`- **[${change.version}] (${formatDate(change.date)})**: ${change.description}`)
    })
    lines.push("")
  }

  return lines.join("\n")
}

function formatDate(date: string): string {
  if (!date) return ""
  try {
    const d = new Date(date)
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
  } catch {
    return date
  }
}

async function convertMarkdownToHTML(markdown: string): Promise<string> {
  // Remove icons for DOCX compatibility
  let cleanMarkdown = markdown
    .replace(/📅\s*/g, "")
    .replace(/🧩\s*/g, "")
    .replace(/📦\s*/g, "")
    .replace(/📞\s*/g, "")
    .replace(/📄\s*/g, "")
    .replace(/⚙️\s*/g, "")
    .replace(/🚀\s*/g, "")
    .replace(/🔍\s*/g, "")

  // Split into lines for better processing
  const lines = cleanMarkdown.split('\n')
  let html = ''
  let inList = false
  let listItems: string[] = []
  let inTable = false
  let tableRows: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    // Handle headers
    if (trimmedLine.startsWith('# ')) {
      if (inList) {
        html += `<ul>${listItems.join('')}</ul>`
        listItems = []
        inList = false
      }
      if (inTable) {
        html += renderTableForWord(tableRows)
        tableRows = []
        inTable = false
      }
      html += `<h1>${trimmedLine.slice(2)}</h1>\n`
      continue
    }
    if (trimmedLine.startsWith('## ')) {
      if (inList) {
        html += `<ul>${listItems.join('')}</ul>`
        listItems = []
        inList = false
      }
      if (inTable) {
        html += renderTableForWord(tableRows)
        tableRows = []
        inTable = false
      }
      html += `<h2>${trimmedLine.slice(3)}</h2>\n`
      continue
    }
    if (trimmedLine.startsWith('### ')) {
      if (inList) {
        html += `<ul>${listItems.join('')}</ul>`
        listItems = []
        inList = false
      }
      if (inTable) {
        html += renderTableForWord(tableRows)
        tableRows = []
        inTable = false
      }
      html += `<h3>${trimmedLine.slice(4)}</h3>\n`
      continue
    }

    // Handle horizontal rules
    if (trimmedLine === '---') {
      if (inList) {
        html += `<ul>${listItems.join('')}</ul>`
        listItems = []
        inList = false
      }
      if (inTable) {
        html += renderTableForWord(tableRows)
        tableRows = []
        inTable = false
      }
      html += `<hr />\n`
      continue
    }

    // Handle tables
    if (line.includes('|')) {
      if (inList) {
        html += `<ul>${listItems.join('')}</ul>`
        listItems = []
        inList = false
      }
      tableRows.push(line)
      inTable = true
      continue
    } else if (inTable) {
      // End of table
      html += renderTableForWord(tableRows)
      tableRows = []
      inTable = false
    }

    // Handle list items
    if (line.match(/^\s*- /)) {
      if (!inList) {
        inList = true
      }
      let listContent = line.replace(/^\s*[-*+] /, '')
      listContent = listContent
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
      listItems.push(`<li>${listContent}</li>`)
      continue
    } else if (inList) {
      // End of list
      html += `<ul>${listItems.join('')}</ul>`
      listItems = []
      inList = false
    }

    // Handle empty lines
    if (trimmedLine === '') {
      if (!inList && !inTable) {
        html += '<br />\n'
      }
      continue
    }

    // Handle regular paragraphs
    let processedLine = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
    html += `<p>${processedLine}</p>\n`
  }

  // Close any remaining lists or tables
  if (inList && listItems.length > 0) {
    html += `<ul>${listItems.join('')}</ul>`
  }
  if (inTable && tableRows.length > 0) {
    html += renderTableForWord(tableRows)
  }

  return html
}

function renderTableForWord(rows: string[]): string {
  if (rows.length === 0) return ''

  let tableHTML = '<table>\n'
  let isHeader = true

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const cells = row.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim())

    if (i === 1 && row.includes('---')) {
      // This is the separator row, skip it
      continue
    }

    if (isHeader) {
      tableHTML += '<thead><tr>'
      cells.forEach(cell => {
        tableHTML += `<th>${cell}</th>`
      })
      tableHTML += '</tr></thead><tbody>\n'
      isHeader = false
    } else {
      tableHTML += '<tr>'
      cells.forEach(cell => {
        tableHTML += `<td>${cell}</td>`
      })
      tableHTML += '</tr>\n'
    }
  }

  tableHTML += '</tbody></table>\n'
  return tableHTML
}

function createWordDocument(html: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Release Note</title>
  <style>
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 2cm;
      line-height: 1.6;
      color: #1a1a1a;
    }
    h1 { 
      font-size: 28px;
      border-bottom: 3px solid #000;
      padding-bottom: 12px;
      margin-bottom: 24px;
      font-weight: 700;
    }
    h2 { 
      font-size: 22px;
      border-bottom: 2px solid #666;
      padding-bottom: 8px;
      margin-top: 32px;
      margin-bottom: 16px;
      font-weight: 600;
    }
    h3 { 
      font-size: 18px;
      margin-top: 24px;
      margin-bottom: 12px;
      font-weight: 600;
    }
    p { margin: 12px 0; }
    table { 
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    th, td { 
      border: 1px solid #ccc;
      padding: 10px;
      text-align: left;
    }
    th { 
      background-color: #f5f5f5;
      font-weight: 600;
    }
    ul, ol { 
      margin: 12px 0;
      padding-left: 32px;
    }
    li { margin: 6px 0; }
    code { 
      background-color: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    hr {
      border: none;
      border-top: 1px solid #ddd;
      margin: 24px 0;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`
}
