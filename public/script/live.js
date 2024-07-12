$(document).ready(function () {
  function fetchVoteCounts() {
    $.ajax({
      url: "/api/vote-counts", // Your API endpoint
      method: "GET",
      success: function (data) {
        const voteCountDiv = $("#vote-count");
        voteCountDiv.empty();
        data.forEach((aspirant) => {
          voteCountDiv.append(`
              <div class="col-md-4 mb-4">
                <div class="card animate__animated animate__fadeIn">
                  <div class="card-body">
                    <h5 class="card-title">${aspirant.name}</h5>
                    <p class="vote-count">${aspirant.votes} votes</p>
                  </div>
                </div>
              </div>
            `);
        });
      },
      error: function (error) {
        console.error("Error fetching vote counts:", error);
      },
    });
  }

  fetchVoteCounts();
  setInterval(fetchVoteCounts, 5000); // Refresh every 5 seconds
});
