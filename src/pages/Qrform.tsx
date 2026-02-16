import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase2";
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./Qrform.css";

export default function Qrform() {
    const { id } = useParams();

    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [note, setNote] = useState("");
    // const [images, setImages] = useState<File[]>([]);
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
            <div className="qrform-success">
                <div className="success-content">
                    <h2>✓ Thank You!</h2>
                    <p className="mess">Your response has been submitted successfully.</p>
                    <p className="mess">Scan the QR code again to view your submitted details.</p>
                </div>
            </div>
        );
    }

    // Show saved data if exists (from previous submission)
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

        // try {
        //     const storage = getStorage(); 
        //     const uploadedUrls: string[] = [];

        //     // Upload images if any
        //     for (let img of images) {
        //         const imgRef = ref(storage, `submissions/${id}/${Date.now()}_${img.name}`);
        //         await uploadBytes(imgRef, img);
        //         const url = await getDownloadURL(imgRef);
        //         uploadedUrls.push(url);
        //     }

            // Save to Firestore
            const docRef = doc(db, "submissions", id!);

            await setDoc(docRef, {
                name,
                contact,
                note,
                // images: uploadedUrls,
                submittedAt: Date.now(),
            });

            // Show success message and update saved data
            setIsSuccess(true);
            setJustSubmitted(true);
            setSavedData({
                name,
                contact,
                note,
                // images: uploadedUrls
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

                    {/* <div className="form-group">
                        <label>Upload Images</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setImages([...e.target.files!])}
                        />
                    </div> */}

                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                </form>
            </div>
        </div>
    );
}