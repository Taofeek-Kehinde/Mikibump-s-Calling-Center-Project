import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScanner() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

   scanner.render(
  (decodedText) => {
    alert("Scanned: " + decodedText);
    scanner.clear();
  },
  () => {
    
  }
);

    return () => {
      scanner.clear();
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Scan QR Code</h2>
        <div id="reader" style={styles.reader}></div>
        <p style={styles.help}>
          Point your camera at a QR code and wait.
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
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center" as const,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  title: {
    marginBottom: "12px",
  },
  reader: {
    width: "100%",
  },
  help: {
    marginTop: "10px",
    color: "#555",
  },
};