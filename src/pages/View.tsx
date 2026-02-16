import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./View.css";

export default function View() {
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem(id!);
    if (data) {
      setMessage(data);
      setSaved(true);
    }
  }, [id]);

  const saveMessage = () => {
    if (!message) return alert("Enter a message");
    localStorage.setItem(id!, message);
    setSaved(true);
  };

  return (
    <div className="view-wrap">
      {!saved ? (
        <>
          <h2>Set Message (First Scan Only)</h2>
          <textarea
            placeholder="Enter your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={saveMessage}>Save</button>
        </>
      ) : (
        <>
          <h2>Message</h2>
          <p>{message}</p>
        </>
      )}
    </div>
  );
}