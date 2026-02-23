import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScanner() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    scanner.render(
      (decodedText) => {
        alert("Scanned: " + decodedText);
        scanner.clear();
      },
      (_errorMessage) => {
        // ignore errors (optional)
      }
    );

    return () => {
      scanner.clear();
    };
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Scan QR Code</h2>
      <div id="reader" style={styles.reader}></div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    textAlign: "center" as const,
  },
  title: {
    marginBottom: "10px",
  },
  reader: {
    width: "100%",
    maxWidth: "400px",
    margin: "0 auto",
  },
};