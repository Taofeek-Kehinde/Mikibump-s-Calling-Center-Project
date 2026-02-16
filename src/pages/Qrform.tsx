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

  const [savedData, setSavedData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true); 

 
  useEffect(() => {
    const checkQR = async () => {
      if (!id) return;

      const ref = doc(db, "submissions", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setSavedData(snap.data()); 
      }

      setIsChecking(false);
    };

    checkQR();
  }, [id]);

  if (isChecking) {
    return null; 
  }


  if (savedData) {
    return (
      <div className="qrform-container">
        <div className="qrform-card">
          <h2>TALK IN CANDY</h2>
          <p><b>NAME:</b> {savedData.name}</p>
          <p><b>CONTACT:</b> {savedData.contact}</p>
          <p><b>NOTE:</b> {savedData.note}</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) return;

    setIsSubmitting(true);

    try {
      const ref = doc(db, "submissions", id!);

      await setDoc(ref, {
        name,
        contact,
        note,
        submittedAt: Date.now(),
      });

    //   setIsSuccess(true);

    //   setTimeout(() => {
    //     window.close();
    //   }, 2000);

    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="qrform-success">
        <div className="success-content">
          <h2>✓ Thank You!</h2>
          <p className="mess">Your response has been submitted successfully.</p>
          {/* <p className="close-message">This window will close automatically...</p> */}
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
              required
            />
          </div>

          <div className="form-group">
            <label>Contact *</label>
            <input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
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