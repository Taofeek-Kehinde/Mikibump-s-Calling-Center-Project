import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase2";

function CandyDetails() {
  const { id } = useParams();
  const [candy, setCandy] = useState<any>(null);

  useEffect(() => {
    const fetchCandy = async () => {
      const docRef = doc(db, "candies", id!);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCandy(docSnap.data());
      }
    };
    fetchCandy();
  }, [id]);

  if (!candy) return <p>Loading...</p>;

  const now = Date.now();
  const unlocked = now >= candy.unlockTime;

  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <h1 style={{ fontSize: "30px" }}>{candy.relationship}</h1>
      <h2>Name: {candy.name}</h2>
      <p>Sent At: {new Date(candy.createdAt).toLocaleString()}</p>

      <div style={{ margin: "20px auto", width: "200px", borderRadius: "50%", padding: "20px", background: candy.relationship === "CHOCOLATE" ? "chocolate" : "yellow", boxShadow: "0 5px 15px rgba(0,0,0,0.3)" }}>
        <img src={candy.spotifyLink ? "https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg" : ""} alt="Candy QR" width="150" height="150" style={{ borderRadius: "50%" }}/>
      </div>

      {unlocked ? (
        <a href={candy.spotifyLink} target="_blank" rel="noopener noreferrer">
          <button>🎵 Play Your Song</button>
        </a>
      ) : (
        <p>⏳ Wait 15 minutes for the song to unlock...</p>
      )}
    </div>
  );
}

export default CandyDetails;