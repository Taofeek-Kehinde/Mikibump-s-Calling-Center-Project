import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { v4 as uuidv4 } from "uuid";
import "./Qrcode.css";

export default function Qrcode() {
  const [numQRs, setNumQRs] = useState(1); // number of QR codes to generate
  const [qrList, setQrList] = useState<{ id: string; url: string }[]>([]);

  // Generate QR codes
  const generateQRBatch = () => {
    const tempList: { id: string; url: string }[] = [];

    for (let i = 0; i < numQRs; i++) {
      const id = uuidv4().slice(0, 8);
      const link = `${window.location.origin}/qrform/${id}`;
      tempList.push({ id, url: link });
    }

    setQrList(tempList);
  };

  // Print a single QR card
  const printQR = (qrId: string) => {
    const qrElement = document.getElementById(qrId);
    if (!qrElement) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #fff;
            }
            .qr-box {
              text-align: center;
            }
            .qr-box p {
              color: #000;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          ${qrElement.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="qr-wrap">
      <h1>Generate Smart QR</h1>

      <div className="form-group">
        <label>Number of QR Codes</label>
        <input
          type="number"
          min={1}
          value={numQRs}
          onChange={(e) => setNumQRs(parseInt(e.target.value))}
        />
      </div>

      <button onClick={generateQRBatch}>Generate QR</button>

      <div className="qr-container">
        {qrList.map((qr, index) => (
          <div key={index} className="qr-box" id={`qr-${index}`}>
            <QRCodeCanvas value={qr.url} size={220} />
            <p><b>ID:</b> {qr.id}</p>
            <p>Scan to set message</p>

            <button
              onClick={() => printQR(`qr-${index}`)}
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                fontSize: "0.9rem",
                background: "#ff4f87",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Print QR
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}