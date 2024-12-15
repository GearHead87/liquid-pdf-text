import { useState, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Search, Upload, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Highlight } from "./highlight";
import { useToast } from "@/hooks/use-toast";
// import { Toast } from '@/components/ui/use-toast'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface SearchResult {
	pageNumber: number;
	text: string;
	position: { top: number; left: number; width: number; height: number };
}

export default function PDFViewer() {
	const [file, setFile] = useState<File | null>(null);
	const [numPages, setNumPages] = useState<number>(0);
	const [searchTerm, setSearchTerm] = useState("");
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [currentResultIndex, setCurrentResultIndex] = useState<number>(-1);
	const [scale, setScale] = useState(1.0);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { toast } = useToast();

	const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setFile(file);
			setSearchResults([]);
			setCurrentResultIndex(-1);
			toast({
				title: "PDF Loaded",
				description: `Successfully loaded: ${file.name}`,
			});
		}
	};

	const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
		setNumPages(numPages);
	};

	const handleSearch = useCallback(async () => {
		if (!searchTerm) return;

		// In a real implementation, you would search through the PDF content
		// For this example, we'll simulate search results
		const mockResults: SearchResult[] = [
			{
				pageNumber: 1,
				text: searchTerm,
				position: { top: 100, left: 50, width: 100, height: 20 },
			},
			{
				pageNumber: 2,
				text: searchTerm,
				position: { top: 200, left: 100, width: 80, height: 20 },
			},
			{
				pageNumber: 3,
				text: searchTerm,
				position: { top: 150, left: 75, width: 90, height: 20 },
			},
		];
		setSearchResults(mockResults);
		setCurrentResultIndex(0);
		toast({
			title: "Search Results",
			description: `Found ${mockResults.length} results for "${searchTerm}"`,
		});
	}, [searchTerm]);

	const navigateResults = (direction: "next" | "prev") => {
		if (searchResults.length === 0) return;

		let newIndex = currentResultIndex;
		if (direction === "next") {
			newIndex = (currentResultIndex + 1) % searchResults.length;
		} else {
			newIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
		}
		setCurrentResultIndex(newIndex);
	};

	const handleZoom = (type: "in" | "out") => {
		setScale((prevScale) => {
			const newScale = type === "in" ? prevScale * 1.2 : prevScale / 1.2;
			return Math.max(0.5, Math.min(newScale, 2)); // Limit scale between 0.5 and 2
		});
	};

	return (
		<div className="flex h-screen">
			<div className="w-64 border-r bg-background p-4">
				<div className="space-y-4">
					<div className="flex gap-2">
						<Input
							type="file"
							accept=".pdf"
							onChange={onFileChange}
							className="hidden"
							ref={fileInputRef}
							id="pdf-upload"
						/>
						<Button
							variant="outline"
							className="w-full cursor-pointer"
							onClick={() => fileInputRef.current?.click()}
						>
							<Upload className="mr-2 h-4 w-4" />
							Upload PDF
						</Button>
					</div>
					<div className="flex gap-2">
						<Input
							type="text"
							placeholder="Search..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							onKeyPress={(e) => e.key === "Enter" && handleSearch()}
						/>
						<Button onClick={handleSearch}>
							<Search className="h-4 w-4" />
						</Button>
					</div>
					{searchResults.length > 0 && (
						<div className="flex justify-between">
							<Button onClick={() => navigateResults("prev")} size="sm">
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<span className="text-sm">
								{currentResultIndex + 1} of {searchResults.length}
							</span>
							<Button onClick={() => navigateResults("next")} size="sm">
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					)}
					<div className="flex justify-center gap-2">
						<Button onClick={() => handleZoom("out")} size="sm">
							<ZoomOut className="h-4 w-4" />
						</Button>
						<span className="text-sm self-center">{Math.round(scale * 100)}%</span>
						<Button onClick={() => handleZoom("in")} size="sm">
							<ZoomIn className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			<div className="flex-1 overflow-hidden">
				<ScrollArea className="h-full">
					{file ? (
						<Document
							file={file}
							onLoadSuccess={onDocumentLoadSuccess}
							onLoadError={() =>
								toast({
									title: "Error",
									description: "Failed to load PDF. Please try again.",
									variant: "destructive",
								})
							}
						>
							{Array.from(new Array(numPages), (el, index) => (
								<div key={`page_${index + 1}`} className="mb-4 relative">
									<Page
										pageNumber={index + 1}
										renderTextLayer={true}
										renderAnnotationLayer={true}
										className="border shadow-sm"
										scale={scale}
									/>
									{searchResults
										.filter((result) => result.pageNumber === index + 1)
										.map((result, i) => (
											<Highlight
												key={i}
												position={result.position}
												scale={scale}
												isActive={
													currentResultIndex ===
													searchResults.findIndex((r) => r === result)
												}
											/>
										))}
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
		</div>
	);
}
