import { useEffect, useRef } from "react";
import QrScanner from "qr-scanner";

export default function QRScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        alert("Scanned: " + result);
        scanner.stop(); // stop after scan
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    scanner.start().catch((err) => {
      console.error("Camera error:", err);
    });

    scannerRef.current = scanner;

    return () => {
      scanner.stop();
      scanner.destroy();
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Scan QR Code</h2>

        <video
          ref={videoRef}
          style={styles.video}
        ></video>

        <p style={styles.help}>
          Point camera at QR code and wait for scan.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    background: "#111",
    color: "#fff",
    borderRadius: "16px",
    padding: "20px",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center" as const,
    boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
  },
  title: {
    marginBottom: "12px",
  },
  video: {
    width: "100%",
    borderRadius: "12px",
  },
  help: {
    marginTop: "10px",
    color: "#aaa",
  },
};