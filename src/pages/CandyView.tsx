import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase2";
import { speakChildVoice, stopSpeech } from '../utils/textToSpeech';
import './Candyview.css';

interface CandyData {
  name: string;
  relationship: "CHOCOLATE" | "LOLLIPOP";
  message: string;
  createdAt: number;
  unlockTime: number;
  expireTime: number;
}

function CandyView() {
  const { id } = useParams();
  const [candy, setCandy] = useState<CandyData | null>(null);
  const [locked, setLocked] = useState(true);
  const [expired, setExpired] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    const fetchCandy = async () => {
      if (!id) return;

      const snap = await getDoc(doc(db, "candies", id));

      if (snap.exists()) {
        const data = snap.data() as CandyData;
        setCandy(data);

        const now = Date.now();
        
        // Check if expired
        if (data.expireTime && now >= data.expireTime) {
          setExpired(true);
          setLocked(true);
        }
        // Check if unlocked
        else if (data.unlockTime && now >= data.unlockTime) {
          setLocked(false);
        }
      }
    };

    fetchCandy();

    // Cleanup on unmount
    return () => {
      stopSpeech();
    };
  }, [id]);

  // Update time remaining every second
  useEffect(() => {
    if (!candy || !locked) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = candy.unlockTime - now;

      if (remaining <= 0) {
        setLocked(false);
        setTimeRemaining("");
        clearInterval(interval);
      } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [candy, locked]);

  // Handle playing the message
  const handlePlayMessage = async () => {
    if (!candy?.message || isPlaying) return;

    setIsPlaying(true);
    try {
      await speakChildVoice(candy.message);
    } catch (error) {
      console.error("Error playing message:", error);
    }
    setIsPlaying(false);
  };

  if (!candy) return <h2 style={{ textAlign: "center", color: 'white' }}>Loading...</h2>;

  // Handle expired candy
  if (expired) {
    return (
      <div className="candy-page">
        <div className="candy-card">
          <h2 className="candy-title">TALK IN CANDY</h2>
          <div className="expired-message">
            <p>This candy has expired!</p>
            <p>The message is no longer available.</p>
          </div>
        </div>
      </div>
    );
  }

  const date = new Date(candy.createdAt);
  const formattedTime = date.toLocaleTimeString();
  const formattedDate = date.toDateString();

  return (
    <div className="candy-page">
      <div className="candy-card">

        <h2 className="candy-title">TALK IN CANDY</h2>

        <div
          className="candy-circle"
          style={{
            background:
              candy.relationship === "CHOCOLATE" ? "brown" : "orange"
          }}
        >
          {candy.relationship.toLowerCase()}
        </div>

        <p><strong>FOR:</strong> {candy.name}</p>
        <p><strong>TIME:</strong> {formattedTime}</p>
        <p><strong>DATE:</strong> {formattedDate}</p>

        {/* Show message when unlocked */}
        {!locked && candy.message && (
          <div className="message-content">
            <p className="message-text">"{candy.message}"</p>
          </div>
        )}

        {locked ? (
          <button 
            className="wait-btn"
            style={{ backgroundColor: "red" }}
          >
            {timeRemaining ? `WAIT ${timeRemaining}` : "WAIT FOR CANDY"}
          </button>
        ) : (
          <button 
            className="wait-btn"
            style={{ backgroundColor: "green" }}
            onClick={handlePlayMessage}
            disabled={isPlaying}
          >
            {isPlaying ? "PLAYING..." : "TAP TO LISTEN"}
          </button>
        )}

        <p className="expire-text">
          (DISAPPEARS AFTER 15 HOURS)
        </p>

      </div>
    </div>
  );

}

export default CandyView;
