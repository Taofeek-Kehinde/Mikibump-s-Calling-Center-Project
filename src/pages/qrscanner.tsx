import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import QrScanner from "qr-scanner";

export default function QRScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [hasCamera, setHasCamera] = useState(true);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const processScannedResult = (text: string) => {
    if (text) {
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
      setScanResult(text);
      setIsScanning(false);
      
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
      
      // Navigate to the scanned URL (e.g., /qrform/:id)
      navigate(text);
    }
  };

  const startScanner = async () => {
    if (!videoRef.current) return;
    
    setError(null);
    setScanResult(null);
    setIsScanning(true);

    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
    }

    const scanner = new QrScanner(
      videoRef.current,
      (result: string | QrScanner.ScanResult) => {
        const text = typeof result === "string" ? result : (result as unknown as { data?: string }).data || "";
        processScannedResult(text);
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    try {
      await scanner.start();
      scannerRef.current = scanner;
      setHasCamera(true);
    } catch (err: unknown) {
      console.error("Camera error:", err);
      setHasCamera(false);
      const error = err as Error;
      if (error.name === 'NotAllowedError') {
        setError("Camera permission denied. Please allow camera access to scan QR codes.");
      } else if (error.name === 'NotFoundError') {
        setError("No camera found on this device. Please use the upload option below.");
      } else if (error.name === 'NotReadableError') {
        setError("Camera is already in use by another application. Try using the upload option.");
      } else {
        setError("Unable to access camera. Please use the upload option below.");
      }
    }
  };

  // Scan QR code from uploaded image
  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setError(null);

    try {
      // Scan the image for QR code
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
      });
      
      if (result?.data) {
        processScannedResult(result.data);
      } else {
        setError("No QR code found in the image. Please try another image.");
      }
    } catch (err) {
      console.error("Image scan error:", err);
      setError("Could not find a QR code in this image. Please try a clearer image.");
    } finally {
      setIsProcessingImage(false);
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [navigate]);

  useEffect(() => {
    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      }
    };
  }, []);

  const handleRestart = () => {
    startScanner();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Scan QR Code</h2>

        {/* Image Upload Button */}
        <div style={styles.uploadSection}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={styles.fileInput}
            id="qr-image-input"
          />
          <button 
            style={styles.uploadButton} 
            onClick={triggerFileInput}
            disabled={isProcessingImage}
          >
            {isProcessingImage ? "Scanning..." : "📁 Upload QR Image"}
          </button>
          <p style={styles.uploadHelp}>
            Upload a QR code image from your device
          </p>
        </div>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerText}>OR</span>
        </div>

        {!hasCamera || error ? (
          <div style={styles.errorContainer}>
            {error && <p style={styles.error}>{error}</p>}
            <button style={styles.button} onClick={startScanner}>
              Try Camera Again
            </button>
          </div>
        ) : (
          <>
            <div style={styles.videoContainer}>
              <video
                ref={videoRef}
                style={styles.video}
                playsInline
                muted
              ></video>
              {isScanning && (
                <div style={styles.scanOverlay}>
                  <div style={styles.scanRegion}></div>
                </div>
              )}
            </div>

            {scanResult ? (
              <div style={styles.resultContainer}>
                <p style={styles.resultLabel}>Scanned Result:</p>
                <p style={styles.resultText}>{scanResult}</p>
                <button style={styles.button} onClick={handleRestart}>
                  Scan Again
                </button>
              </div>
            ) : (
              <p style={styles.help}>
                Point camera at QR code and wait for scan.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: "20px",
    minHeight: "100vh",
    background: "#000",
  },
  card: {
    background: "#111",
    color: "#fff",
    borderRadius: "16px",
    padding: "20px",
    width: "100%",
    maxWidth: "500px",
    textAlign: "center" as const,
    boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
  },
  title: {
    marginBottom: "20px",
    fontSize: "24px",
  },
  uploadSection: {
    marginBottom: "20px",
  },
  fileInput: {
    display: "none",
  },
  uploadButton: {
    background: "#6366f1",
    color: "#fff",
    border: "none",
    padding: "16px 24px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold" as const,
    cursor: "pointer",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  uploadHelp: {
    color: "#888",
    fontSize: "12px",
    marginTop: "10px",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "20px 0",
  },
  dividerText: {
    color: "#666",
    padding: "0 10px",
    fontSize: "14px",
  },
  videoContainer: {
    position: "relative" as const,
    width: "100%",
    borderRadius: "12px",
    overflow: "hidden" as const,
    background: "#000",
  },
  video: {
    width: "100%",
    display: "block",
    borderRadius: "12px",
  },
  scanOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none" as const,
  },
  scanRegion: {
    width: "60%",
    height: "60%",
    border: "3px solid #00ff00",
    borderRadius: "12px",
  },
  help: {
    marginTop: "20px",
    color: "#aaa",
    fontSize: "14px",
  },
  errorContainer: {
    padding: "20px",
    background: "#1a1a1a",
    borderRadius: "12px",
  },
  error: {
    color: "#ff6b6b",
    marginBottom: "15px",
    fontSize: "14px",
  },
  resultContainer: {
    marginTop: "20px",
    padding: "20px",
    background: "#1a1a1a",
    borderRadius: "12px",
  },
  resultLabel: {
    color: "#00ff00",
    marginBottom: "10px",
    fontSize: "14px",
  },
  resultText: {
    color: "#fff",
    fontSize: "16px",
    wordBreak: "break-all" as const,
    marginBottom: "20px",
  },
  button: {
    background: "#00ff00",
    color: "#000",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold" as const,
    cursor: "pointer",
  },
};
