// headerScript.js

function toggleMenu() {
  const menuOverlay = document.getElementById("menuOverlay");
  menuOverlay.style.display =
    menuOverlay.style.display === "none" ? "flex" : "none";
}
document.addEventListener("DOMContentLoaded", function () {
  const timerElement = document.getElementById("timer");
  const endTime = new Date().getTime() + 16 * 60 * 60 * 1000; // 16 hours from now

  function updateTimer() {
    const now = new Date().getTime();
    const timeLeft = endTime - now;

    if (timeLeft >= 0) {
      const hours = Math.floor(
        (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      timerElement.textContent = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else {
      clearInterval(timerInterval);
      timerElement.textContent = "00:00:00";
      // You can add additional logic here for when the timer ends
    }
  }

  const timerInterval = setInterval(updateTimer, 1000);
  updateTimer(); // Initial call to display the timer immediately
});
