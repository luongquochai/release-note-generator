"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface ReleaseNotePreviewProps {
  markdown: string
}

export function ReleaseNotePreview({ markdown }: ReleaseNotePreviewProps) {
  const [activeTab, setActiveTab] = useState("markdown")
  const [copied, setCopied] = useState(false)

  const handleCopyMarkdown = async () => {
    if (!markdown) return

    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true) 
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const renderMarkdown = (md: string) => {
    if (!md) return ""

    // Split into lines for processing
    const lines = md.split('\n')
    let html = ''
    let inList = false
    let inTable = false
    let tableRows: string[] = []
    let listItems: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmedLine = line.trim()

      // Handle headers
      if (trimmedLine.startsWith('# ')) {
        if (inList) {
          html += `<ul class="list-disc ml-6 mb-4 space-y-1">${listItems.join('')}</ul>`
          listItems = []
          inList = false
        }
        let headerContent = trimmedLine.slice(2)
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
        html += `<h1 class="text-3xl font-bold mb-4 pb-2 border-b">${headerContent}</h1>\n`
        continue
      }
      if (trimmedLine.startsWith('## ')) {
        if (inList) {
          html += `<ul class="list-disc ml-6 mb-4 space-y-1">${listItems.join('')}</ul>`
          listItems = []
          inList = false
        }
        let headerContent = trimmedLine.slice(3)
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
        html += `<h2 class="text-2xl font-semibold mt-6 mb-3">${headerContent}</h2>\n`
        continue
      }
      if (trimmedLine.startsWith('### ')) {
        if (inList) {
          html += `<ul class="list-disc ml-6 mb-4 space-y-1">${listItems.join('')}</ul>`
          listItems = []
          inList = false
        }
        let headerContent = trimmedLine.slice(4)
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
        html += `<h3 class="text-xl font-semibold mt-4 mb-2">${headerContent}</h3>\n`
        continue
      }

      // Handle horizontal rules
      if (trimmedLine === '---') {
        if (inList) {
          html += `<ul class="list-disc ml-6 mb-4 space-y-1">${listItems.join('')}</ul>`
          listItems = []
          inList = false
        }
        html += `<hr class="my-6 border-border" />\n`
        continue
      }

      // Handle tables
      if (line.includes('|')) {
        if (inList) {
          html += `<ul class="list-disc ml-6 mb-4 space-y-1">${listItems.join('')}</ul>`
          listItems = []
          inList = false
        }
        tableRows.push(line)
        inTable = true
        continue
      } else if (inTable) {
        // End of table
        html += renderTable(tableRows)
        tableRows = []
        inTable = false
      }

      // Handle list items (including sublists with indentation)
      if (line.match(/^\s*- /) || line.match(/^\s*\d+\. /)) {
        if (!inList) {
          inList = true
        }
        
        // Count indentation level (number of spaces before the bullet)
        const indentMatch = line.match(/^(\s*)/)
        const indentLevel = indentMatch ? Math.floor(indentMatch[1].length / 2) : 0
        
        let listContent = line.replace(/^\s*[-*+] |^\s*\d+\. /, '')
        // Process bold, italic, and code in list items
        listContent = listContent
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm">$1</code>')
        
        // Add appropriate margin based on indent level using inline styles
        const marginLeft = indentLevel > 0 ? `${16 + (indentLevel * 20)}px` : '16px'
        listItems.push(`<li style="margin-left: ${marginLeft}">${listContent}</li>`)
        continue
      } else if (inList) {
        // End of list
        html += `<ul class="list-disc ml-6 mb-4 space-y-1">${listItems.join('')}</ul>`
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
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm">$1</code>')

      html += `<p class="mb-2">${processedLine}</p>\n`
    }

    // Close any remaining lists or tables
    if (inList && listItems.length > 0) {
      html += `<ul class="list-disc ml-6 mb-4 space-y-1">${listItems.join('')}</ul>`
    }
    if (inTable && tableRows.length > 0) {
      html += renderTable(tableRows)
    }

    return html
  }

  const renderTable = (rows: string[]): string => {
    if (rows.length === 0) return ''

    let tableHTML = '<table class="w-full border-collapse my-4">\n'
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
          const processedCell = cell
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm">$1</code>')
          tableHTML += `<th class="border border-border px-3 py-2 bg-muted font-semibold text-left">${processedCell}</th>`
        })
        tableHTML += '</tr></thead><tbody>\n'
        isHeader = false
      } else {
        tableHTML += '<tr>'
        cells.forEach(cell => {
          const processedCell = cell
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm">$1</code>')
          tableHTML += `<td class="border border-border px-3 py-2">${processedCell}</td>`
        })
        tableHTML += '</tr>\n'
      }
    }

    tableHTML += '</tbody></table>\n'
    return tableHTML
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Preview</CardTitle>
            <CardDescription>View your release note in markdown or HTML</CardDescription>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="markdown">Markdown</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="markdown" className="h-full m-0">
            {markdown ? (
              <div className="relative h-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 z-10 bg-transparent"
                  onClick={handleCopyMarkdown}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                <div
                  className="prose prose-sm max-w-none dark:prose-invert p-4 h-full overflow-y-auto scrollbar-thin"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg mb-2">No content yet</p>
                  <p className="text-sm">Fill in the form and click "Generate" to see the preview</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="html" className="h-full m-0">
            {markdown ? (
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg mb-2">No content yet</p>
                  <p className="text-sm">Fill in the form and click "Generate" to see the preview</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
