import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "./View.css";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase2";

export default function View() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const docRef = doc(db, "submissions", id);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
          setData(snap.data());
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Create audio element when data is loaded
  useEffect(() => {
    if (data?.audioUrl && !audioRef.current) {
      const audio = new Audio(data.audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        console.error('Audio error:', audio.error);
        setIsPlaying(false);
      };
      audioRef.current = audio;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [data]);

  const togglePlayback = () => {
    if (!data?.audioUrl || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((error) => {
        console.error('Playback failed:', error);
      });
      setIsPlaying(true);
    }
  };

  const talkToMe = () => {
    if (!data?.whatsappNumber) return;
    
    const message = encodeURIComponent(`Listen to my TALKIN CANDY message!`);
    const whatsappUrl = `https://wa.me/${data.whatsappNumber.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="view-wrap">
        <p>Loading...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="view-wrap">
        <h2>No message found</h2>
      </div>
    );
  }

  return (
    <div className="view-wrap">
      <h1 className="talkin-heading">TALKIN CANDY</h1>
      
      {data.audioUrl && (
        <div className="audio-player">
          <button 
            className="play-audio-btn" 
            onClick={togglePlayback}
          >
            {isPlaying ? '⏸ Stop Audio' : '▶ Play Audio Message'}
          </button>
        </div>
      )}

      {data.link && (
        <div className="link-section">
          <p className="check-this-out">Check this out:</p>
          <a 
            href={data.link.startsWith('http') ? data.link : `https://${data.link}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="custom-link"
          >
            {data.link}
          </a>
        </div>
      )}

      <button className="talk-to-me-btn" onClick={talkToMe}>
        📱 Talk to me on WhatsApp
      </button>
    </div>
  );
}
