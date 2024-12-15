import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import Toolbar from "./components/Toolbar";
import TextLayer from "./components/TextLayer";
import DrawingLayer from "./components/DrawingLayer";

function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [tool, setTool] = useState<"text" | "draw">("text");
  const [color, setColor] = useState("#000000");

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setError(null);
    } else {
      setPdfFile(null);
      setError("Please select a valid PDF file.");
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Enhanced PDF Viewer</h1>
      <input
        type="file"
        onChange={handleFileChange}
        accept="application/pdf"
        className="mb-4 p-2 border border-gray-300 rounded"
        aria-label="Select PDF file"
      />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {pdfFile && (
        <div className="w-full max-w-4xl">
          <Toolbar
            tool={tool}
            setTool={setTool}
            color={color}
            setColor={setColor}
          />
          <div className="w-full h-[600px] overflow-auto border border-gray-300 shadow-lg">
            <TransformWrapper>
              <TransformComponent>
                <Document
                  file={pdfFile}
                  onLoadSuccess={onDocumentLoadSuccess}
                  error={<div>Failed to load PDF file.</div>}
                  className="flex justify-center"
                >
                  <Page
                    pageNumber={pageNumber}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  >
                    <TextLayer tool={tool} />
                    <DrawingLayer tool={tool} color={color} />
                  </Page>
                </Document>
              </TransformComponent>
            </TransformWrapper>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPageNumber(pageNumber - 1)}
              disabled={pageNumber <= 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            <p>
              Page {pageNumber} of {numPages}
            </p>
            <button
              onClick={() => setPageNumber(pageNumber + 1)}
              disabled={pageNumber >= (numPages || 0)}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

