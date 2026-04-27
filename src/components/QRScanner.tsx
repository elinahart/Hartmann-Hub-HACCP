import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Loader2 } from 'lucide-react';
import { Button } from './ui/LightUI';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose, isOpen }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsInitializing(true);
      // Timeout to ensure the DOM element is rendered
      const timer = setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            formatsToSupport: [
              Html5QrcodeSupportedFormats.QR_CODE,
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39
            ]
          },
          /* verbose= */ false
        );

        scanner.render(
          (decodedText) => {
            onScan(decodedText);
            scanner.clear().then(() => {
              onClose();
            }).catch(err => console.error("Failed to clear scanner", err));
          },
          (errorMessage) => {
            // parse error, ignore it.
          }
        );

        scannerRef.current = scanner;
        setIsInitializing(false);
      }, 300);

      return () => {
        document.body.style.overflow = '';
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(err => console.error("Failed to clear scanner on unmount", err));
        }
      };
    }
  }, [isOpen, onScan, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed top-0 left-0 w-full h-[100dvh] z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-white w-full max-h-[90dvh] md:max-h-[85dvh] max-w-md rounded-3xl flex flex-col overflow-hidden relative shadow-2xl">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <h3 className="font-black text-gray-800 uppercase tracking-wider">Scanner un code</h3>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 flex flex-col min-h-0 bg-gray-50 p-4">
          <style>{`
            #qr-reader {
              border: none !important;
              display: flex;
              flex-direction: column;
              height: 100%;
              width: 100%;
            }
            #qr-reader__dashboard_section_csr {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 8px;
              padding: 8px 0;
            }
            #qr-reader__dashboard_section_swaplink {
              text-decoration: none !important;
              color: #6366f1 !important;
              font-weight: bold !important;
              margin-top: 8px;
              display: inline-block;
            }
            #qr-reader__dashboard_section_csr button {
              background: #6366f1 !important;
              color: white !important;
              border: none !important;
              padding: 10px 16px !important;
              border-radius: 12px !important;
              font-weight: bold !important;
              font-family: inherit !important;
              cursor: pointer;
            }
            #qr-reader__dashboard_section_csr select {
              padding: 10px !important;
              border-radius: 12px !important;
              max-width: 100% !important;
              border: 1px solid #e5e7eb !important;
              font-family: inherit !important;
              font-weight: 600 !important;
            }
            #qr-reader__camera_selection {
              max-width: 90% !important;
            }
            #qr-reader video {
              object-fit: cover !important;
              border-radius: 16px !important;
              width: 100% !important;
              max-height: 50vh !important;
            }
          `}</style>
          
          {isInitializing && (
            <div className="flex flex-col items-center justify-center flex-1 gap-4">
              <Loader2 className="animate-spin text-crousty-purple" size={40} />
              <p className="text-sm font-bold text-gray-500">Initialisation de la caméra...</p>
            </div>
          )}
          
          <div className={`w-full flex-1 flex flex-col justify-start rounded-2xl overflow-y-auto no-scrollbar ${isInitializing ? 'hidden' : 'block'}`}>
             <div id="qr-reader" className="w-full"></div>
             <div className="mt-6 text-center shrink-0">
               <p className="text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-xl shadow-sm inline-block">
                 Scannez un QR code ou un code-barres au centre du cadre.
               </p>
             </div>
          </div>
        </div>
        
        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          <Button variant="secondary" onClick={onClose} className="w-full">Fermer le scanner</Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
