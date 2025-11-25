import { useState, useEffect } from 'react';

const ImageSelectionModal = ({ isOpen, images, onClose, onDownload }) => {
    const [selectedIndices, setSelectedIndices] = useState([]);

    useEffect(() => {
        if (isOpen && images.length > 0) {
            // Default select all
            setSelectedIndices(images.map((_, i) => i));
        }
    }, [isOpen, images]);

    if (!isOpen) return null;

    const getProxyUrl = (originalUrl) => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        return `${apiUrl}/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
    };

    const toggleSelection = (index) => {
        setSelectedIndices(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const handleSelectAll = () => {
        if (selectedIndices.length === images.length) {
            setSelectedIndices([]);
        } else {
            setSelectedIndices(images.map((_, i) => i));
        }
    };

    const handleDownloadClick = async () => {
        const selectedImages = images.filter((_, i) => selectedIndices.includes(i));
        // Use proxy URLs for download to avoid CORS
        const proxyUrls = selectedImages.map(url => getProxyUrl(url));
        onDownload(proxyUrls);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={onClose}></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl bg-white border-4 border-black shadow-hard-xl flex flex-col max-h-[90vh] animate-[bounce_0.2s_ease-out]">

                {/* Header */}
                <div className="bg-nb-blue border-b-4 border-black p-4 flex justify-between items-center select-none">
                    <h2 className="text-2xl font-head uppercase truncate">EVIDENCE FOUND ({images.length})</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white border-4 border-black hover:bg-nb-pink hover:text-white transition-colors font-head text-xl flex items-center justify-center"
                    >
                        X
                    </button>
                </div>

                {/* Toolbar */}
                <div className="px-4 py-2 bg-gray-100 border-b-4 border-black flex items-center justify-end">
                    <button
                        onClick={handleSelectAll}
                        className="text-sm font-bold font-head uppercase hover:text-nb-pink transition-colors underline"
                    >
                        {selectedIndices.length === images.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>

                {/* Image Grid */}
                <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((img, index) => {
                            const isSelected = selectedIndices.includes(index);
                            return (
                                <div
                                    key={index}
                                    onClick={() => toggleSelection(index)}
                                    className={`relative group cursor-pointer border-4 border-black shadow-hard transition-all ${isSelected ? 'border-nb-green' : 'hover:-translate-y-1 hover:shadow-hard-lg'}`}
                                >
                                    <div className={`aspect-square overflow-hidden bg-white ${isSelected ? 'opacity-90' : ''}`}>
                                        <img
                                            src={getProxyUrl(img)}
                                            alt={`Post ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=Error'; }}
                                        />
                                    </div>

                                    {/* Selection Overlay */}
                                    {isSelected && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="bg-nb-green border-4 border-black p-2 shadow-hard rotate-12">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t-4 border-black bg-white flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-nb-yellow border-2 border-black"></div>
                        <span className="font-bold text-sm font-head">SELECTED: {selectedIndices.length}</span>
                    </div>
                    <button
                        onClick={handleDownloadClick}
                        disabled={selectedIndices.length === 0}
                        className="w-full md:w-auto px-8 py-3 bg-nb-pink text-white font-head uppercase border-4 border-black shadow-hard hover:bg-red-500 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                    >
                        Download Selected
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageSelectionModal;
