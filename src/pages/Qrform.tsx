import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase2";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./Qrform.css";

export default function Qrform() {
    const { id } = useParams();

    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [note, setNote] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [savedData, setSavedData] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [, setIsSuccess] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    // Check if submission exists
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

    if (isChecking) return null;

    // Show saved submission immediately if exists
    if (savedData) {
        return (
            <div className="qrform-container">
                <div className="qrform-card">
                    <h2>Previous Submission</h2>
                    <p><b>NAME:</b> {savedData.name}</p>
                    <p><b>CONTACT:</b> {savedData.contact}</p>
                    <p><b>NOTE:</b> {savedData.note}</p>

                    {savedData.images && savedData.images.length > 0 && (
                        <div className="images-preview">
                            {savedData.images.map((url: string, idx: number) => (
                                <img key={idx} src={url} alt={`Uploaded ${idx}`} style={{ maxWidth: 200, margin: 5 }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Handle new submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !contact) {
            alert("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);

        try {
            const storage = getStorage();
            const uploadedUrls: string[] = [];

            for (let img of images) {
                const imgRef = ref(storage, `submissions/${id}/${Date.now()}_${img.name}`);
                await uploadBytes(imgRef, img);
                const url = await getDownloadURL(imgRef);
                uploadedUrls.push(url);
            }

            const docRef = doc(db, "submissions", id!);

            // Save or merge data
            await setDoc(docRef, {
                name,
                contact,
                note,
                images: uploadedUrls,
                submittedAt: Date.now(),
            });

            setSavedData({
                name,
                contact,
                note,
                images: uploadedUrls,
            });
            setIsSuccess(true);

        } catch (err) {
            console.error(err);
            alert("Error submitting form. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
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
                        <label>Upload Images</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setImages([...e.target.files!])}
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