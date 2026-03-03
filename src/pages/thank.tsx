import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHandPointRight } from "react-icons/fa";
 import "./thank.css";
 
export default function Thank() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0f1b3d] to-[#102a4c] px-4 relative">

      {/* Top Right */}
      <div className="absolute top-5 right-5 flex items-center gap-3">
        <FaHandPointRight className="text-red-500 text-xl sm:text-2xl animate-bounce" />
        <button
          onClick={() => navigate("/")}
          className="bg-red-500 text-white px-5 py-2 sm:px-6 sm:py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition duration-300"
        >
          HOME
        </button>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl text-white font-semibold tracking-wide mb-4">
          TALKING CANDY
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-lg sm:text-xl md:text-2xl text-orange-400 font-medium"
        >
          Thank You
        </motion.p>
      </motion.div>
    </div>
  );
}