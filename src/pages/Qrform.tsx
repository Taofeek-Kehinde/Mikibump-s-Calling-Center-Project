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

  // 🔍 Check if this QR already has data
  useEffect(() => {
    const loadData = async () => {
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

    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) return alert("Please fill required fields");

    setIsSubmitting(true);

    try {
      const ref = doc(db, "submissions", id!);
      await setDoc(ref, {
        name,
        contact,
        note,
        createdAt: Date.now(),
      });

      setIsSuccess(true);
      setIsLocked(true);

      // ⏳ Auto close after 2 seconds
      setTimeout(() => {
        window.close();
      }, 2000);

    } catch (err) {
      console.error(err);
      alert("Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🎉 SUCCESS SCREEN
  if (isSuccess) {
    return (
      <div className="qrform-success">
        <div className="success-content">
          <h2>✓ Thank You!</h2>
          <p>Your response has been saved.</p>
          <p className="close-message">
            This window will close automatically...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="qrform-container">
      <div className="qrform-card">
        <h2>Talkin Candy Form</h2>

        {isLocked && (
          <p className="locked-text">
            This QR has already been filled.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            disabled={isLocked}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
          />

          <input
            type="tel"
            value={contact}
            disabled={isLocked}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Contact"
            required
          />

          <textarea
            value={note}
            disabled={isLocked}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note"
          />

          {!isLocked && (
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Submit"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}