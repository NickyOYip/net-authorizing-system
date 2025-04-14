import { Document, Page, pdfjs } from 'react-pdf';
import { useState } from 'react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    '../../node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

function PdfViewer() {
    const [numPages, setNumPages] = useState();
    const [pageNum, setPageNum] = useState(1);
    const [pdfUrl, setPdfUrl] = useState("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
    const [pdfError, setPdfError] = useState();

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setPageNum(1);
        console.log("onDocumentLoadSuccess done")
    }

    function onDocumentLoadError(error) {
        console.error('PDF load error:', error);
        setPdfError('Failed to load PDF document');
      }

    function changePage(offset) {
        setPageNum(prevPageNum => prevPageNum + offset);
        console.log("changePage done")
    }

    function previousPage() {
        changePage(-1);
    }

    function nextPage() {
        changePage(1);
    }

    return (
        <div>
            <div>
                <div className="pdf-container">
                    <Document
                        file={pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={<div>Loading PDF...</div>}
                        error={<div>Failed to load PDF.</div>}
                    >
                        {pageNum &&
                            <Page
                                pageNum={pageNum}
                                width={800}
                                loading={<div>Loading page...</div>}
                            />}
                    </Document>
                </div>

                <div className="page-controls">
                    <button
                        disabled={pageNum <= 1}
                        onClick={previousPage}
                        className="btn bg-gradient-dark mb-0"
                        style={{ width: "fit-content", marginLeft: "15px", alignSelf: "end" }}
                    >
                        Previous
                    </button>
                    <span>
                        Page {pageNum} of {numPages || '--'}
                    </span>
                    <button
                        disabled={pageNum >= (numPages || 0)}
                        onClick={nextPage}
                        className="btn bg-gradient-dark mb-0"
                        style={{ width: "fit-content", marginLeft: "15px", alignSelf: "end" }}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>


    )
}
export default PdfViewer;
