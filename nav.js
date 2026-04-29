document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  toggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
});