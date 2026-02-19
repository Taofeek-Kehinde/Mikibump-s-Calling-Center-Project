import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase2";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandPointRight } from "@fortawesome/free-solid-svg-icons";
import "./Qrform.css";
import { showAlert } from "../utils/showAlert";

export default function Qrform() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [url, setUrl] = useState("");
    const [name, setName] = useState("");
     const [note, setNote] = useState("");
    const [contact, setContact] = useState("");
    const [savedData, setSavedData] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [] = useState(false);
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
                    <p className="mess">LET CANDY DO THE TALKIN.</p>
                </div>

                {/* HOME button at top-right */}
                <motion.button
                    className="cany-home-btn"
                    onClick={() => navigate('/dashboard')}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Open Cany Form"
                    style={{
                        position: "absolute",
                        top: 20,
                        right: 20,
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        backgroundColor: "red",
                        border: "none",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    }}
                >
                    {/* ADD THIS ONLY */}
                    <span
                        style={{
                            position: "absolute",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            color: "#fff",
                            textTransform: "uppercase",
                            pointerEvents: "none",
                        }}
                    >
                        HOME
                    </span>

                    {/* YOUR HAND ICON (UNCHANGED) */}
                    <FontAwesomeIcon
                        icon={faHandPointRight}
                        className="lefthands"
                        style={{
                            fontSize: "1.6rem",
                            color: "red",
                            animation: "hand-point 1.2s ease-in-out infinite",
                            transformOrigin: "center",
                            marginRight: "120px",
                            position: "absolute",
                            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.12))",
                        }}
                    />
                </motion.button>

            </div>
        );
    }

    if (savedData) {
        return (
            <div className="qrform-container">
                <motion.button
                    className="cany-home-btn"
                    onClick={() => navigate('/dashboard')}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Open Cany Form"
                    style={{
                        position: "fixed",   // ← ONLY change (was absolute)
                        top: 20,
                        right: 20,
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        backgroundColor: "red",
                        border: "none",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                        zIndex: 9999,
                    }}
                >
                    <span
                        style={{
                            position: "absolute",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            color: "#fff",
                            textTransform: "uppercase",
                            pointerEvents: "none",
                        }}
                    >
                        HOME
                    </span>

                    <FontAwesomeIcon
                        icon={faHandPointRight}
                        className="lefthands"
                        style={{
                            fontSize: "1.6rem",
                            color: "red",
                            animation: "hand-point 1.2s ease-in-out infinite",
                            transformOrigin: "center",
                            marginRight: "120px",
                            position: "absolute",
                            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.12))",
                        }}
                    />
                </motion.button>

                <div className="qrform-card">
                    <h2>TALK IN CANDY</h2>
                    {savedData.name && <p><b>NAME:</b> {savedData.name}</p>}

                    {savedData.note && (
                        <p><b>NOTE:</b> {savedData.note}</p>
                    )}

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

                    {savedData.contact && (
                        <button
                            className="whatsapp-btn"
                            onClick={() =>
                                window.open(
                                    `https://wa.me/${savedData.contact}?text=Hello ${savedData.name}`,
                                    "_blank"
                                )
                            }
                        >
                            CHAT ON WHATSAPP
                        </button>
                    )}
                    


                    {savedData.url && (
                        <button
                            className="url-btn"
                            onClick={() => window.open(savedData.url, "_blank")}
                        >
                            VISIT LINK
                        </button>
                    )}
                </div>
            </div>
        );
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || isSubmitting) return;

        if (!name.trim() || !contact.trim()) {
            showAlert("Name and WhatsApp number are required.");
            return;
        }

        if (contact.length < 10) {
            showAlert("Enter a valid WhatsApp number with country code.");
            return;
        }

        setIsSubmitting(true);

        try {
            const docRef = doc(db, "submissions", id);
            const snap = await getDoc(docRef);

            if (snap.exists()) {
                setSavedData(snap.data());
                return;
            }


            const payload: any = {
                submittedAt: Date.now(),
            };

            payload.name = name.trim();
            payload.contact = contact.trim();

            if (note.trim()) payload.note = note.trim();
            if (url.trim()) payload.url = url.trim();

            await setDoc(docRef, payload);

            setIsSuccess(true);
            setSavedData(payload);
        } catch (err) {
            console.error(err);
            alert("Submission failed");
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="qrform-container">
            <div className="qrform-card">
                <h2>TALK IN CANDY</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name *</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
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
                        <label>WhatsApp Number *</label>
                        <input
                            type="tel"
                            placeholder="Enter number with country code, e.g. 2348119825334"
                            value={contact}
                            onChange={(e) => setContact(e.target.value.replace(/\D/g, ""))}
                        />

                    </div>

                    <div className="form-group">
                        <label>paste link</label>
                        <input
                            type="url"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>


                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "CANDY IT"}
                    </button>
                </form>
            </div>
        </div>
    );
}