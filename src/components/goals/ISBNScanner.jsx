import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'

export default function ISBNScanner({ onDetected, onClose }) {
  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const [error, setError] = useState(null)
  const [scanning, setScanning] = useState(true)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader

    reader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
      if (result) {
        const text = result.getText()
        // Accept ISBN-13 (978/979 prefix) or ISBN-10
        const isISBN = /^(978|979)\d{10}$/.test(text) || /^\d{9}[\dX]$/.test(text)
        if (isISBN) {
          setScanning(false)
          onDetected(text)
        }
      }
      if (err && !(err instanceof NotFoundException)) {
        console.warn('Scanner error:', err)
      }
    }).catch(e => {
      setError(e.message?.includes('Permission') || e.message?.includes('permission')
        ? 'Camera permission denied. Please allow camera access and try again.'
        : 'Camera not available on this device.')
    })

    return () => {
      try { reader.reset() } catch {}
    }
  }, [onDetected])

  return (
    <div className="fixed inset-0 bg-black z-[80] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4 bg-black/80">
        <p className="text-white font-bold text-base">Scan Book Barcode</p>
        <button onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-xl">
          ✕
        </button>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Scan overlay */}
        {scanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Dimmed areas */}
            <div className="absolute inset-0 bg-black/50" />
            {/* Scan window */}
            <div className="relative w-72 h-36 z-10">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-primary rounded-tl-md" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand-primary rounded-tr-md" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand-primary rounded-bl-md" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-primary rounded-br-md" />
              {/* Scan line */}
              <div className="absolute left-2 right-2 top-1/2 h-0.5 bg-brand-primary/80 animate-pulse" />
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="bg-white rounded-2xl p-6 text-center max-w-xs">
              <p className="text-4xl mb-3">📷</p>
              <p className="text-sm font-semibold text-text-pri mb-2">Camera unavailable</p>
              <p className="text-xs text-text-sec mb-4">{error}</p>
              <button onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold">
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hint */}
      {scanning && !error && (
        <div className="bg-black/80 px-4 py-5 text-center">
          <p className="text-white/80 text-sm">Point at the barcode on the back of the book</p>
          <p className="text-white/40 text-xs mt-1">ISBN-13 or ISBN-10 supported</p>
        </div>
      )}
    </div>
  )
}
