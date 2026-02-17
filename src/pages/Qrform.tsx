import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase2";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./Qrform.css";

interface SubmissionData {
    name: string;
    contact: string;
    note: string;
    images: string[];
    submittedAt: number;
}

export default function Qrform() {
    const { id } = useParams();

    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [note, setNote] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [savedData, setSavedData] = useState<SubmissionData | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

    // Check if submission exists
    useEffect(() => {
        const checkQR = async () => {
            if (!id) return;

            try {
                const docRef = doc(db, "submissions", id);
                const snap = await getDoc(docRef);

                if (snap.exists()) {
                    const data = snap.data() as SubmissionData;
                    setSavedData(data);
                }
            } catch (error) {
                console.error("Error checking submission:", error);
            } finally {
                setIsChecking(false);
            }
        };

        checkQR();
    }, [id]);

    // Clean up image preview URLs when component unmounts or images change
    useEffect(() => {
        return () => {
            imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreviewUrls]);

    // Handle image selection and create preview URLs
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setImages(selectedFiles);
            
            // Create preview URLs
            const previews = selectedFiles.map(file => URL.createObjectURL(file));
            setImagePreviewUrls(previews);
        }
    };

    if (isChecking) {
        return (
            <div className="qrform-container">
                <div className="qrform-card">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // Show saved submission immediately if exists
    if (savedData) {
        return (
            <div className="qrform-container">
                <div className="qrform-card">
                    <h2>Previous Submission</h2>
                    <div className="submission-details">
                        <p><strong>NAME:</strong> {savedData.name}</p>
                        <p><strong>CONTACT:</strong> {savedData.contact}</p>
                        <p><strong>NOTE:</strong> {savedData.note}</p>
                        <p><strong>SUBMITTED:</strong> {new Date(savedData.submittedAt).toLocaleString()}</p>
                    </div>

                    {savedData.images && savedData.images.length > 0 && (
                        <div className="images-section">
                            <h3>Uploaded Images</h3>
                            <div className="images-preview">
                                {savedData.images.map((url: string, idx: number) => (
                                    <div key={idx} className="image-item">
                                        <img 
                                            src={url} 
                                            alt={`Uploaded ${idx + 1}`} 
                                            style={{ 
                                                maxWidth: '200px', 
                                                maxHeight: '200px', 
                                                margin: '5px',
                                                objectFit: 'cover',
                                                borderRadius: '4px',
                                                border: '1px solid #ddd'
                                            }}
                                            onError={(e) => {
                                                console.error(`Failed to load image ${idx}:`, url);
                                                e.currentTarget.style.display = 'none';
                                            }}
                                            onLoad={() => console.log(`Image ${idx} loaded successfully`)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(!savedData.images || savedData.images.length === 0) && (
                        <p className="no-images">No images uploaded</p>
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

            // Upload images if any
            if (images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    const img = images[i];
                    try {
                        // Create a unique filename with timestamp and original name
                        const timestamp = Date.now();
                        const safeFileName = img.name.replace(/[^a-zA-Z0-9.]/g, '_');
                        const fileName = `${timestamp}_${i}_${safeFileName}`;
                        const imgRef = ref(storage, `submissions/${id}/${fileName}`);
                        
                        // Upload with metadata
                        await uploadBytes(imgRef, img, {
                            contentType: img.type
                        });
                        
                        // Get the download URL
                        const url = await getDownloadURL(imgRef);
                        uploadedUrls.push(url);
                        console.log(`Image ${i} uploaded successfully:`, url);
                    } catch (uploadError) {
                        console.error(`Error uploading image ${i}:`, uploadError);
                    }
                }
            }

            const docRef = doc(db, "submissions", id!);

            // Save data to Firestore
            await setDoc(docRef, {
                name,
                contact,
                note,
                images: uploadedUrls,
                submittedAt: Date.now(),
            });

            // Set the saved data to show the submission
            setSavedData({
                name,
                contact,
                note,
                images: uploadedUrls,
                submittedAt: Date.now(),
            });
            
            setIsSuccess(true);
            
            // Clean up preview URLs
            imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
            setImagePreviewUrls([]);

        } catch (err) {
            console.error("Error submitting form:", err);
            alert("Error submitting form. Please check your connection and try again.");
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
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label>Contact *</label>
                        <input
                            type="tel"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label>Note</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label>Upload Images</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={isSubmitting}
                        />
                        
                        {/* Show image previews before upload */}
                        {imagePreviewUrls.length > 0 && (
                            <div className="image-previews">
                                <p>Preview ({imagePreviewUrls.length} images selected):</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                                    {imagePreviewUrls.map((url, idx) => (
                                        <img
                                            key={idx}
                                            src={url}
                                            alt={`Preview ${idx + 1}`}
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                objectFit: 'cover',
                                                borderRadius: '4px',
                                                border: '1px solid #ddd'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        className="submit-btn" 
                        disabled={isSubmitting || !name || !contact}
                    >
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                </form>

                {isSuccess && (
                    <div className="success-message">
                        Form submitted successfully!
                    </div>
                )}
            </div>
        </div>
    );
}