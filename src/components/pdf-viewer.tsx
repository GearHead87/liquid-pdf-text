import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Search, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

export default function PDFViewer() {
  const [file, setFile] = useState<File | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ pageNumber: number; text: string }>>([])
  const [selectedResult, setSelectedResult] = useState<number | null>(null)

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFile(file)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const handleSearch = async () => {
    // In a real implementation, this would search through the PDF content
    // For now, we'll simulate search results
    const mockResults = [
      { pageNumber: 1, text: "Found text on page 1..." },
      { pageNumber: 2, text: "Found text on page 2..." },
    ]
    setSearchResults(mockResults)
  }

  return (
    <div className="flex h-screen">
      {/* Left sidebar for search results */}
      <div className="w-64 border-r bg-background p-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="file"
              accept=".pdf"
              onChange={onFileChange}
              className="hidden"
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload">
              <Button variant="outline" className="w-full cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Upload PDF
              </Button>
            </label>
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-120px)]">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className={`cursor-pointer rounded-lg p-3 mb-2 ${
                  selectedResult === index ? 'bg-primary/10' : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedResult(index)}
              >
                <p className="text-sm font-medium">Page {result.pageNumber}</p>
                <p className="text-sm text-muted-foreground">{result.text}</p>
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 p-4">
        <ScrollArea className="h-full">
          {file ? (
            <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
              {Array.from(new Array(numPages), (el, index) => (
                <div key={`page_${index + 1}`} className="mb-4">
                  <Page
                    pageNumber={index + 1}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="border shadow-sm"
                  />
                </div>
              ))}
            </Document>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Upload a PDF to get started
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Context viewer overlay */}
      {selectedResult !== null && (
        <div className="fixed bottom-4 right-4 w-80 rounded-lg border bg-background p-4 shadow-lg">
          <h3 className="mb-2 font-semibold">Context View</h3>
          <p className="text-sm text-muted-foreground">
            {searchResults[selectedResult].text}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2"
            onClick={() => setSelectedResult(null)}
          >
            ×
          </Button>
        </div>
      )}
    </div>
  )
}

