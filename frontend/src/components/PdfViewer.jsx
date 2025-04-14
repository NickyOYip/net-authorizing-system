import {Document,Page} from 'react-pdf';
import { useState } from 'react';

function PdfViewer(){
    const [numPages,setNumPages]=useState();
    const [pageNum,setPageNum]=useState();
    function onDocumentLoadSuccess ({numPages}){
        setNumPages(numPages);
    }
    const pdf = "https://pdfobject.com/pdf/sample.pdf";

    return(
        <div>
           <Document file = {pdf} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={pageNum}/>
           </Document>
           <p>Page {pageNum} of {numPages}</p>
        </div>

    )
}
export default PdfViewer;
