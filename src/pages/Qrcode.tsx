import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase2";
import { v4 as uuidv4 } from "uuid";
import "./Qrcode.css";

export default function Qrcode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Batch QR generation states
  const [numQRs, setNumQRs] = useState(1);
  const [customUrl, setCustomUrl] = useState("");
  const [qrList, setQrList] = useState<{ id: string; url: string }[]>([]);

  useEffect(() => {
    const checkSubmission = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "submissions", id);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          setSubmissionData(snap.data());
        }
      } catch (err) {
        console.error("Error checking submission:", err);
      } finally {
        setLoading(false);
      }
    };

    checkSubmission();
  }, [id]);

  // Download QR code function
  const downloadQR = () => {
    const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
    if (canvas) {
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `QR-${id}.png`;
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="qr-wrap">
        <p>Loading...</p>
      </div>
    );
  }

  // If we have an ID from the URL (submission was just made)
  if (id && submissionData) {
    const qrUrl = `${window.location.origin}/view/${id}`;
    
    return (
      <div className="qr-wrap">
        <h1>YOUR QR CODE IS READY!</h1>
        
        <div className="qr-success-box">
          <div className="qr-box">
            <QRCodeCanvas id="qr-canvas" value={qrUrl} size={250} />
            <p><b>ID:</b> {id}</p>
          </div>

          <div className="submission-details">
            <h3>Your Submission:</h3>
            <p><b>WhatsApp:</b> {submissionData.whatsappNumber}</p>
            {submissionData.link && <p><b>Link:</b> {submissionData.link}</p>}
            <p><b>Content Type:</b> {submissionData.contentMode === 'voice' ? 'Voice Note' : 'Text to Speech'}</p>
          </div>

          <button className="download-btn" onClick={downloadQR}>
            Download QR Code
          </button>

          <button className="home-btn" onClick={() => navigate('/users')}>
            Create Another
          </button>

          <p className="qr-instructions">
            Print this QR code and stick it on your product, flyer, gift, or anywhere!
          </p>
        </div>
      </div>
    );
  }

  // Generate batch QR codes
  const generateQRBatch = async () => {
    const tempList: { id: string; url: string }[] = [];
    const { setDoc, doc } = await import("firebase/firestore");

    for (let i = 0; i < numQRs; i++) {
      const uniqueId = uuidv4().slice(0, 8);
      // QR code points to the View page where users can listen to voice note or text to speech
      const link = `${window.location.origin}/view/${uniqueId}${customUrl ? `?customUrl=${encodeURIComponent(customUrl)}` : ''}`;
      
      // Create a placeholder document in Firestore with the custom URL
      if (customUrl) {
        try {
          await setDoc(doc(db, "submissions", uniqueId), {
            id: uniqueId,
            customUrl: customUrl,
            link: customUrl,
            whatsappNumber: '',
            contentMode: 'voice',
            audioUrl: null,
            createdAt: Date.now(),
          });
        } catch (err) {
          console.error("Error creating placeholder:", err);
        }
      }
      
      tempList.push({ id: uniqueId, url: link });
    }

    setQrList(tempList);
  };

  // Download QR code for batch
  const downloadBatchQR = (index: number, qrId: string) => {
    const canvas = document.getElementById(`qr-${index}`) as HTMLCanvasElement;
    if (canvas) {
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `QR-${qrId}.png`;
      link.click();
    }
  };

  // Original page (no ID) - show batch QR generation
  return (
    <div className="qr-wrap">
      <h1>Generate Talkin QR</h1>

      <div className="form-groups">
        <label>Number of QR Codes</label>
        <input
          type="number"
          min={1}
          value={numQRs}
          onChange={(e) => setNumQRs(parseInt(e.target.value))}
        />
      </div>

      <div className="form-groups">
        <label>Enter URL (Optional)</label>
        <input
          type="url"
          placeholder="https://example.com"
          value={customUrl}
          onChange={(e) => setCustomUrl(e.target.value)}
          className="url-input"
        />
      </div>

      <button onClick={generateQRBatch}>Generate QR</button>

      <div className="qr-container">
        {qrList.map((qr, index) => (
          <div key={index} className="qr-box">
            <QRCodeCanvas id={`qr-${index}`} value={qr.url} size={220} />
            <p><b>ID:</b> {qr.id}</p>
            <p>Scan to set message</p>

            <button
              onClick={() => downloadBatchQR(index, qr.id)}
            >
              Save / Print QR
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
