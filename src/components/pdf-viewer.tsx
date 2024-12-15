import { useState, useCallback, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Search, Upload, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface SearchResult {
	pageNumber: number;
	text: string;
	position: {
		top: number;
		left: number;
		width: number;
		height: number;
	};
}

interface HighlightProps {
	position: { top: number; left: number; width: number; height: number };
	scale: number;
	isActive: boolean;
}

function Highlight({ position, scale, isActive }: HighlightProps) {

	return (
		<div
			style={{
				position: "absolute",
				top: position.top * scale,
				left: position.left * scale,
				width: position.width * scale,
				height: position.height * scale,
				backgroundColor: isActive ? "rgba(255, 255, 0, 0.5)" : "rgba(255, 255, 0, 0.3)",
				pointerEvents: "none",
				transition: "background-color 0.3s ease",
				zIndex: 10,
			}}
		/>
	);
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
	const scrollContainerRef = useRef<HTMLDivElement>(null);

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
		if (!searchTerm || !file) return;

		const pdf = await pdfjs.getDocument(URL.createObjectURL(file)).promise;
		const newResults: SearchResult[] = [];

		for (let i = 1; i <= pdf.numPages; i++) {
			const page = await pdf.getPage(i);
			const viewport = page.getViewport({ scale: scale }); // Use the current scale

			const textContent = await page.getTextContent();

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			textContent.items.forEach((item: any) => {
				const itemText = item.str.toLowerCase();
				if (itemText.includes(searchTerm.toLowerCase())) {
					const [x, y] = item.transform.slice(4, 6); // Extract x and y positions
					const width = item.width;
					const height = item.height;

					newResults.push({
						pageNumber: i,
						text: item.str,
						position: {
							// Subtract 'y' and 'height' to align with the HTML coordinate system
							top: viewport.height - y - height,
							left: x,
							width,
							height,
						},
					});
				}
			});
		}

		setSearchResults(newResults);
		setCurrentResultIndex(newResults.length > 0 ? 0 : -1);

		toast({
			title: "Search Results",
			description: `Found ${newResults.length} results for "${searchTerm}"`,
		});
	}, [searchTerm, file, scale, toast]);

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
			return Math.max(0.5, Math.min(newScale, 2));
		});

		// Re-run the search to update highlight positions
		handleSearch();
	};

	useEffect(() => {
		if (currentResultIndex >= 0 && scrollContainerRef.current) {
			const result = searchResults[currentResultIndex];
			const pageElement = document.getElementById(`page_${result.pageNumber}`);
			if (pageElement) {
				pageElement.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}
	}, [currentResultIndex, searchResults]);

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

			<div className="flex-1 overflow-hidden" ref={scrollContainerRef}>
				<ScrollArea className="h-full">
					{file ? (
						<Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
							{Array.from(new Array(numPages), (_, index) => (
								<div
									key={`page_${index + 1}`}
									id={`page_${index + 1}`}
									className="mb-4 relative"
								>
									<Page
										pageNumber={index + 1}
										renderTextLayer={false}
										renderAnnotationLayer={false}
										className="border shadow-sm"
										scale={scale} // Ensure this matches the current scale
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
