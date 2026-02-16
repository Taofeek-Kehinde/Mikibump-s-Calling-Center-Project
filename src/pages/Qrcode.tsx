import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { v4 as uuidv4 } from "uuid";
import "./Qrcode.css";
export default function Qrcode() {
  const [batchId, setBatchId] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  const generateQR = () => {
    const id = uuidv4().slice(0, 8);
    const link = `${window.location.origin}/qrform/${id}`;

    setBatchId(id);
    setQrUrl(link);
  };

  return (
    <div className="qr-wrap">
      <h1>Generate Smart QR</h1>
      <button onClick={generateQR}>Generate QR</button>

      {qrUrl && (
        <div className="qr-box">
          <QRCodeCanvas value={qrUrl} size={220} />
          <p><b>ID:</b> {batchId}</p>
          <p>Scan to set message</p>
        </div>
      )}
    </div>
  );
}