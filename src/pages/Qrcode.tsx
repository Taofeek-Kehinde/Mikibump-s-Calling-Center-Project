import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { v4 as uuidv4 } from "uuid";
import "./Qrcode.css";

export default function Qrcode() {
  const [numQRs, setNumQRs] = useState(1); // number of QR codes to generate
  const [qrList, setQrList] = useState<{ id: string; url: string }[]>([]);

  const generateQRBatch = () => {
    const tempList: { id: string; url: string }[] = [];

    for (let i = 0; i < numQRs; i++) {
      const id = uuidv4().slice(0, 8);
      const link = `${window.location.origin}/qrform/${id}`;
      tempList.push({ id, url: link });
    }

    setQrList(tempList);
  };

  return (
    <div className="qr-wrap">
      <h1>Generate Smart QR</h1>

      <div className="form-groups">
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
          <div key={index} className="qr-box">
            {/* Assign unique ID for canvas so we can export it */}
            <QRCodeCanvas id={`qr-${index}`} value={qr.url} size={220} />
            <p><b>ID:</b> {qr.id}</p>
            <p>Scan to set message</p>

            {/* Save / Print button */}
            <button
              onClick={() => {
                const canvas = document.getElementById(`qr-${index}`) as HTMLCanvasElement;
                if (canvas) {
                  const image = canvas.toDataURL("image/png");
                  const link = document.createElement("a");
                  link.href = image;
                  link.download = `QR-${qr.id}.png`;
                  link.click();
                }
              }}
            >
              Save / Print QR
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}