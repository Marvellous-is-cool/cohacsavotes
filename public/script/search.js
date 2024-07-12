document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const postsContainer = document.getElementById("postsContainer");
  const positions = postsContainer.querySelectorAll(".position");
  let noResultsMessage = null;

  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();
    let noResults = true;

    positions.forEach((position) => {
      let positionHasMatch = false;
      const aspirantCards = position.querySelectorAll(".aspirant-card");

      aspirantCards.forEach(function (card) {
        const name = card.getAttribute("data-name");
        const post = card.getAttribute("data-post");

        if (name.includes(searchTerm) || post.includes(searchTerm)) {
          card.style.display = "block";
          positionHasMatch = true;
          noResults = false;
        } else {
          card.style.display = "none";
        }
      });

      if (positionHasMatch) {
        position.style.display = "block";
        AOS.refresh(); // Refresh AOS to apply animations to newly displayed elements
      } else {
        position.style.display = "none";
      }
    });

    // Show or update the no results message
    if (noResults) {
      if (!noResultsMessage) {
        noResultsMessage = document.createElement("p");
        noResultsMessage.classList.add("mt-3", "text-danger");
        postsContainer.appendChild(noResultsMessage);
      }
      noResultsMessage.innerText = `No aspirant or post with the name "${searchTerm}" found.`;
    } else {
      // Remove the no results message if it exists
      if (noResultsMessage) {
        noResultsMessage.remove();
        noResultsMessage = null;
      }
    }
  });
});
