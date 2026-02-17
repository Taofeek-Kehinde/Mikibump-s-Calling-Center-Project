import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase2";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandPointRight } from "@fortawesome/free-solid-svg-icons";
import "./Qrform.css";

export default function Qrform() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [url, setUrl] = useState("");
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [note, setNote] = useState("");
    const [savedData, setSavedData] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [, setJustSubmitted] = useState(false);
    const [isChecking, setIsChecking] = useState(true);


    useEffect(() => {
        const checkQR = async () => {
            if (!id) return;

            const docRef = doc(db, "submissions", id);
            const snap = await getDoc(docRef);

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

    // Show success message right after submission
  if (isSuccess) {
    return (
        <div className="qrform-success" style={{ position: "relative" }}>
            <div className="success-content">
                <h2>✓ Thank You!</h2>
                <p className="mess">Your response has been submitted successfully.</p>
            </div>

            {/* HOME button at top-right */}
            <motion.button
                className="cany-btns"
                onClick={() => navigate('/form')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Open Cany Form"
                style={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                }}
            >
                <FontAwesomeIcon
                    icon={faHandPointRight}
                    className="lefthand"
                    style={{ marginRight: "0px" }}
                />
                HOME
            </motion.button>
        </div>
    );
}

if (savedData) {
    return (
        <div className="qrform-container">
            <div className="qrform-card">
                <h2>TALK IN CANDY</h2>
                <p><b>NAME:</b> {savedData.name}</p>
                <p><b>CONTACT:</b> {savedData.contact}</p>
                <p><b>NOTE:</b> {savedData.note}</p>

                {savedData.images && savedData.images.length > 0 && (
                    <div className="images-preview">
                        {savedData.images.map((url: string, idx: number) => (
                            <img
                                key={idx}
                                src={url}
                                alt={`Uploaded ${idx}`}
                                style={{ maxWidth: 200, margin: 5 }}
                            />
                        ))}
                    </div>
                )}

   
                {savedData.url && (
                    <p>
                        <b>URL:</b>{" "}
                        <a href={savedData.url} target="_blank" rel="noopener noreferrer">
                            {savedData.url}
                        </a>
                    </p>
                )}
            </div>
        </div>
    );
}
    const handleSubmit = async (e: React.FormEvent) => {
        // Prevent default first to stop page refresh
        e.preventDefault();

        // Validate required fields
        if (!name || !contact) {
            alert("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);


        // Save to Firestore
        const docRef = doc(db, "submissions", id!);

        await setDoc(docRef, {
            name,
            contact,
            note,
             url,
            submittedAt: Date.now(),
        });

        // Show success message and update saved data
        setIsSuccess(true);
        setJustSubmitted(true);
        setSavedData({
            name,
            contact,
            note,
            url,
        });

        // } catch (err) {
        //     console.error(err);
        //     alert("Error submitting form. Please try again.");
        // } finally {
        //     setIsSubmitting(false);
        // }
    };


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

                    <div className="form-group">
                        <label>Social Media / URL</label>
                        <input
                            type="url"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
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