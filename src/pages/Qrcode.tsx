import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase2";
import "./Qrcode.css";

export default function Qrcode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    const qrUrl = `${window.location.origin}/qrform/${id}`;
    
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

  // Original page (no ID) - show instructions
  return (
    <div className="qr-wrap">
      <h1>Generate Talkin QR</h1>
      <p className="qr-info">
        Go to the <strong>MAKE IT TALK</strong> page to create your personalized QR code with voice notes or text-to-speech!
      </p>
      <button className="home-btn" onClick={() => navigate('/users')}>
        Create Your QR
      </button>
    </div>
  );
}
