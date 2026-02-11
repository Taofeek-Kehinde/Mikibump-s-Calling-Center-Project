// Custom professional alert
export function showAlert(message: string, type: "success" | "error" = "success") {
  const alertBox = document.createElement("div");
  alertBox.textContent = message;
  alertBox.style.position = "fixed";
  alertBox.style.top = "20px";
  alertBox.style.right = "20px";
  alertBox.style.padding = "15px 20px";
  alertBox.style.fontFamily = "Poppins, sans-serif";
  alertBox.style.fontSize = "14px";
  alertBox.style.fontWeight = "500";
  alertBox.style.color = "#333";
  alertBox.style.textShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
  alertBox.style.background = "#fff";
  alertBox.style.borderLeft = "5px solid " + (type === "error" ? "#f44336" : "#4CAF50");
  alertBox.style.borderRadius = "8px";
  alertBox.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  alertBox.style.zIndex = "9999";
  alertBox.style.opacity = "0";
  alertBox.style.transform = "translateX(100%)";
  alertBox.style.transition = "all 0.4s ease";

  document.body.appendChild(alertBox);

  requestAnimationFrame(() => {
    alertBox.style.opacity = "1";
    alertBox.style.transform = "translateX(0)";
  });

  setTimeout(() => {
    alertBox.style.opacity = "0";
    alertBox.style.transform = "translateX(100%)";
    setTimeout(() => alertBox.remove(), 400);
  }, 3000);
}
