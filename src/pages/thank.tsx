import { useNavigate } from "react-router-dom";
import { FaHandPointRight } from "react-icons/fa";
import "./thank.css";

export default function Thank() {
  const navigate = useNavigate();

  return (
    <div className="thank-container">
      
      {/* Top Right */}
      <div className="top-right">
        <FaHandPointRight className="hand-icon" />
        <button onClick={() => navigate("/")} className="home-btn">
          HOME
        </button>
      </div>

      {/* Center Content */}
      <div className="content">
        <h1 className="title">TALKING CANDY</h1>
        <p className="subtitle">Thank You</p>
      </div>

    </div>
  );
}