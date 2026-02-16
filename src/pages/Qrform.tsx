import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase2";
import "./Qrform.css";

export default function Qrform() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const ref = doc(db, "submissions", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setData(snap.data());
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const ref = doc(db, "submissions", id!);
      await setDoc(ref, {
        name,
        contact,
        note,
        createdAt: Date.now(),
      });

      setData({ name, contact, note });

      setTimeout(() => window.close(), 2000);

    } catch (err) {
      console.error(err);
      setError("This QR has already been filled.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔒 SHOW SAVED MESSAGE
  if (data) {
    return (
      <div className="qrform-container">
        <div className="qrform-card">
          <h2>Talkin Candy Message</h2>
          <p><b>NAME:</b> {data.name}</p>
          <p><b>CONTACT:</b> {data.contact}</p>
          <p><b>NOTE:</b> {data.note}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="qrform-container">
      <div className="qrform-card">
        <h2>Talkin Candy Form</h2>
        {error && <p style={{color:"red"}}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" required />
          <input value={contact} onChange={e=>setContact(e.target.value)} placeholder="Contact" required />
          <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Note" />
          <button className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}