import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase2";
import './Candyview.css';

interface CandyData {
  name: string;
  relationship: "CHOCOLATE" | "LOLLIPOP";
  spotifyLink: string;
  createdAt: number;
  unlockTime: number;
}

function CandyView() {
  const { id } = useParams();
  const [candy, setCandy] = useState<CandyData | null>(null);
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    const fetchCandy = async () => {
      if (!id) return;

      const snap = await getDoc(doc(db, "candies", id));

      if (snap.exists()) {
        const data = snap.data() as CandyData;
        setCandy(data);

        if (Date.now() >= data.unlockTime) {
          setLocked(false);
        }
      }
    };

    fetchCandy();
  }, [id]);

  if (!candy) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

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

        {locked ? (
          <button className="wait-btn">
            WAIT FOR YOUR CANDY SONG
          </button>
        ) : (
          <a
            href={candy.spotifyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="wait-btn"
            style={{background: "green"}}
          >
            OPEN YOUR CANDY TREAT 🎵
          </a>
        )}

      </div>
    </div>
  );
}

export default CandyView;