document.addEventListener("DOMContentLoaded", () => {
  const footer = document.querySelector("footer");
  if (!footer) return; // Guard: skip if no footer on page

  const currentYear = new Date().getFullYear();

  // Matches any 4-digit year starting with "20" (e.g. 2024, 2025)
  // \b word boundaries prevent partial matches in larger numbers
  const yearRegex = /\b20\d{2}\b/g;

  // Replace all matched years in footer HTML with current year
  footer.innerHTML = footer.innerHTML.replace(yearRegex, currentYear);
});
