import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { pdfjs } from 'react-pdf'
import PdfViewer from './PdfViewer';
const Record = () => {
    const location = useLocation();
    const address = location.state || {};
    const [loading, setLoading] = useState(false);


    return (
        //address type === broadcast/public
        <div className="col-lg-12" >
            <div className='row  row-eq-height' style={{ diaplay: 'flex', justifyContent: "space-between" }}>
                <div className="col-md-6 col-mt-4 card" style={{ width: '50%', height: '80vh', padding: '30px' }}>
                    <h5>Document Title:</h5>
                    <h6>cert.title</h6>
                    <br />
                    <h5>Contract Address:</h5>
                    <h6>cert.contractAddress</h6>
                    <br />
                    <h5>Version:</h5>
                    <h6>cert.version</h6>
                    <br />
                    <h5>Type:</h5>
                    <h6>cert.type</h6>{/** should be the type of contract */}
                    <br />
                    <h5>Status:</h5>
                    <h6>cert.status</h6>{/**Active or Inactive */}
                    
                    <div className='row' style={{ width: "fit-content", marginLeft: "15px", alignSelf: "end" }}>
                        <button herf='cert.pdfLink' className="btn bg-gradient-dark mb-0"
                            style={{ width: "fit-content", marginLeft: "15px", alignSelf: "end" }}
                        >
                            Download JSON file
                        </button>
                        <button herf='cert.pdfLink' className="btn bg-gradient-dark mb-0"
                            style={{ width: "fit-content", marginLeft: "15px", alignSelf: "end" }}
                        >
                            Download PDF
                        </button>
                    </div>
                </div>

                <div className="col-md-6 col-mt-4 card"
                    style={{ width: '50%', height: '80vh', padding: '30px' }}
                > <PdfViewer />
                    <div>
                        Please download the PDF by clicking the Download button if the viewer has failed.
                    </div>
                </div>

            </div>
        </div>

    );
}

export default Record;
