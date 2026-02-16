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
  const [isLocked, setIsLocked] = useState(false);

  // 🔍 Check if QR already has data
  useEffect(() => {
    const checkExisting = async () => {
      if (!id) return;
      const ref = doc(db, "submissions", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setName(data.name);
        setContact(data.contact);
        setNote(data.note || "");
        setIsLocked(true);
      }
    };

    checkExisting();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) {
      alert("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const ref = doc(db, "submissions", id!);
      await setDoc(ref, {
        name,
        contact,
        note,
        submittedAt: Date.now()
      });

      setIsSuccess(true);
      setIsLocked(true);

      // close ONLY after success
      setTimeout(() => {
        window.close();
      }, 2000);

    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              disabled={isLocked}
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
              disabled={isLocked}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="form-group">
            <label>Note</label>
            <textarea
              value={note}
              disabled={isLocked}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>

          {!isLocked && (
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}