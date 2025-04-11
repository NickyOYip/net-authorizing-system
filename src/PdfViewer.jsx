import React, { useState, useEffect } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import './pdf-viewer.css';

const PdfViewer = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/files/document.pdf'); //location to fetch the pdf
        if (!response.ok) throw new Error('Failed to fetch PDF');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        console.error(err);
        setPdfUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();
  }, []);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div className="pdf-viewer-page">
      <div className="card viewer-container">
        <h4 className="text-center mb-4">📄 PDF Viewer</h4>

        {loading && <div className="loading-message">Loading PDF...</div>}

        {!loading && pdfUrl ? (
          <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
            <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} />
          </Worker>
        ) : (
          !loading && <div className="error-message">Failed to load PDF.</div>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
