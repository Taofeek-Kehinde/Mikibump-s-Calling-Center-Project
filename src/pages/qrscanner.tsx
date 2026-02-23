import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScanner() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
  "reader",
  {
    fps: 10,
    qrbox: 250,
  },
  false
);
    scanner.render(
      (decodedText) => {
        alert("Scanned: " + decodedText);
        scanner.clear();
      },
      () => {}
    );

    return () => {
      scanner.clear();
    };
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Scan QR Code</h2>
      <div id="reader"></div>
    </div>
  );
}