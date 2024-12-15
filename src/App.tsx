import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FaSearch, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import './PDFViewer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.min.mjs`;

const PDFViewer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [searchText, setSearchText] = useState('');
  const [highlightedResults, setHighlightedResults] = useState<{
    pageIndex: number;
    boundingBoxes: { left: number; top: number; width: number; height: number }[];
  }[]>([]);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] || null);
    setHighlightedResults([]);
    setCurrentHighlightIndex(0);
  };

  const handleSearch = async () => {
    if (!file) return;

    const pdf = await pdfjs.getDocument(file).promise;
    const highlightedResults: { pageIndex: number; boundingBoxes: { left: number; top: number; width: number; height: number }[] }[] = [];

    for (let pageIndex = 0; pageIndex < pdf.numPages; pageIndex++) {
      const page = await pdf.getPage(pageIndex + 1);
      const textContent = await page.getTextContent();
      const searchMatches = textContent.items.flatMap((item, index) => {
        if (item.str.includes(searchText)) {
          const { transform, width, height } = item;
          return { left: transform[4], top: transform[5], width, height };
        }
        return [];
      });

      if (searchMatches.length > 0) {
        highlightedResults.push({ pageIndex, boundingBoxes: searchMatches });
      }
    }

    setHighlightedResults(highlightedResults);
    setCurrentHighlightIndex(0);
  };

  const handlePreviousHighlight = () => {
    setCurrentHighlightIndex((index) => Math.max(index - 1, 0));
  };

  const handleNextHighlight = () => {
    setCurrentHighlightIndex((index) =>
      Math.min(index + 1, highlightedResults.length - 1)
    );
  };

  return (
    <div className="pdf-viewer">
      <div className="toolbar">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="file-input"
        />
        <div className="search-container">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
            placeholder="Search PDF"
          />
          <button onClick={handleSearch} className="search-button">
            <FaSearch />
          </button>
        </div>
        {highlightedResults.length > 0 && (
          <div className="highlight-navigation">
            <button
              onClick={handlePreviousHighlight}
              className="navigation-button"
              disabled={currentHighlightIndex === 0}
            >
              <FaAngleLeft />
            </button>
            <span>
              {currentHighlightIndex + 1} / {highlightedResults.length}
            </span>
            <button
              onClick={handleNextHighlight}
              className="navigation-button"
              disabled={currentHighlightIndex === highlightedResults.length - 1}
            >
              <FaAngleRight />
            </button>
          </div>
        )}
      </div>
      {file && (
        <Document file={file}>
          {Array.from(new Array(file.numPages), (_, index) => index + 1).map((pageNumber) => (
            <Page
              key={pageNumber}
              pageNumber={pageNumber}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              onRenderSuccess={(page) => {
                const pageHighlights = highlightedResults.find(
                  (result) => result.pageIndex === pageNumber - 1
                );
                if (pageHighlights) {
                  page.canvas.getContext('2d')?.save();
                  pageHighlights.boundingBoxes.forEach((box) => {
                    page.canvas
                      .getContext('2d')
                      ?.fillRect(box.left, box.top, box.width, box.height);
                  });
                  page.canvas.getContext('2d')?.restore();
                }
              }}
            />
          ))}
        </Document>
      )}
    </div>
  );
};

export default PDFViewer;