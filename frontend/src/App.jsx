import { useState } from 'react'
import { downloadPost } from './api'
import ImageSelectionModal from './components/ImageSelectionModal'

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!url) return

    setLoading(true)
    setError(null)
    setData(null)

    try {
      const result = await downloadPost(url)
      setData(result)
      setIsModalOpen(true) // Auto open modal on success
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadImages = async (selectedImages) => {
    // Download each image
    for (let i = 0; i < selectedImages.length; i++) {
      const imageUrl = selectedImages[i];
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `insta - ${data.owner} -${Date.now()} -${i + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);

        // Small delay to prevent browser blocking multiple downloads
        if (i < selectedImages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (err) {
        console.error('Download failed for image:', imageUrl, err);
        // Continue to next image
      }
    }
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Decorative Background Elements */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-nb-blue border-4 border-black shadow-hard hidden md:block rotate-12"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-nb-pink border-4 border-black shadow-hard rounded-full hidden md:block -rotate-6"></div>

      {/* Main Container */}
      <main className="relative w-full max-w-2xl">

        {/* Title Section */}
        <div className="text-center mb-10 relative z-10">
          <h1 className="text-6xl md:text-8xl font-head text-black drop-shadow-[4px_4px_0px_#fff] tracking-tighter uppercase leading-none">
            INSTA<br />
            <span className="text-nb-pink text-stroke">RIPPER</span>
          </h1>
          <div className="inline-block bg-black text-white font-bold px-4 py-1 mt-4 rotate-2 border-2 border-white shadow-hard transform hover:scale-110 transition-transform cursor-default">
            V.2.0 STEALTH MODE
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border-4 border-black shadow-hard-lg p-6 md:p-10 relative z-20">
          {/* Badge */}
          <div className="absolute -top-6 -right-4 bg-nb-green border-4 border-black px-6 py-2 shadow-hard rotate-3 animate-pulse">
            <span className="font-head text-xl">NO LOGIN!</span>
          </div>

          <div className="flex flex-col gap-8">
            {/* Input Group */}
            <div className="group w-full">
              <label className="block font-['Archivo_Black'] text-xl mb-2 uppercase tracking-wide">
                Target URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://instagram.com/p/..."
                  value={url} // Keep React State
                  onChange={(e) => setUrl(e.target.value)} // Keep React Logic
                  className="w-full h-16 px-6 text-xl border-4 border-black bg-gray-50 focus:outline-none focus:bg-[#FFDE00]/20 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400 font-bold"
                />
                {/* Icon inside Input */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
              </div>
              {error && (
                <p className="mt-2 text-red-600 font-bold font-head uppercase text-sm animate-bounce">
                  Error: {error}
                </p>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={handleSubmit}
              id="downloadBtn"
              disabled={loading || !url}
              className="w-full h-20 text-3xl font-head uppercase tracking-wide bg-nb-yellow border-4 border-black shadow-hard hover:bg-yellow-300 hover:-translate-y-1 hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-4 disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full"></div>
                  <span>PROCESSING...</span>
                </>
              ) : (
                <>
                  <span>RIP IT NOW</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Decoration */}
        <div className="mt-8 border-y-4 border-black bg-white py-2 marquee-container shadow-hard rotate-1">
          <div className="marquee-content font-head text-lg">
            DOWNLOAD HIGH QUALITY • NO WATERMARK • ANONYMOUS • SUPER FAST • DOWNLOAD HIGH QUALITY • NO WATERMARK • ANONYMOUS • SUPER FAST •
          </div>
        </div>
      </main>

      <ImageSelectionModal
        isOpen={isModalOpen}
        images={data?.images || []}
        onClose={() => setIsModalOpen(false)}
        onDownload={handleDownloadImages}
      />
    </>
  )
}

export default App
