const DownloadFileButton = ({ file }) => {
    const handleDownload = () => {

        const url = URL.createObjectURL(file);
        const link = document.createElement('a');


        link.href = url;
        link.download = file.name || 'downloaded-file';

        document.body.appendChild(link);
        link.click();


        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    };

    return (
        <button
            onClick={handleDownload}
            style={{
                marginRight: "10px",
                marginleft: "0",
                padding: '8px',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                justifySelf: 'right',
                background: "#1976d2",
            }}
        >
            Download {file.name || 'File'}
        </button>
    );
};

export default DownloadFileButton;