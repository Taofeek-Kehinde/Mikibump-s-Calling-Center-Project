import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase2";
import "./Qrform.css";

export default function Qrform() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [savedData, setSavedData] = useState<any>(null);

  // 🔍 Load existing data for this QR
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const ref = doc(db, "submissions", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setSavedData(snap.data());
      }
    };
    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) return alert("Please fill in required fields");

    setIsSubmitting(true);
    try {
      const ref = doc(db, "submissions", id!);

      await setDoc(ref, {
        name,
        contact,
        note,
        submittedAt: Date.now()
      });

      setSavedData({ name, contact, note });
      setIsSuccess(true);

      setTimeout(() => {
        window.close();
      }, 2000);

    } catch (error) {
      console.error("Error submitting form:", error);
      alert("This QR has already been filled.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔒 SHOW SAVED DATA INSTEAD OF FORM
  if (savedData) {
    return (
      <div className="qrform-container">
        <div className="qrform-card">
          <h2>Talkin Candy Message</h2>
          <p><b>NAME:</b> {savedData.name}</p>
          <p><b>CONTACT:</b> {savedData.contact}</p>
          <p><b>NOTE:</b> {savedData.note}</p>
        </div>
      </div>
    );
  }

  // 🎉 SUCCESS MESSAGE
  if (isSuccess) {
    return (
      <div className="qrform-success">
        <div className="success-content">
          <h2>✓ Thank You!</h2>
          <p>Your response has been submitted successfully.</p>
          <p className="close-message">This window will close automatically...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="qrform-container">
      <div className="qrform-card">
        <h2>Talkin Candy Form</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label>Contact *</label>
            <input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="form-group">
            <label>Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}