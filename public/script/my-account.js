$(document).ready(function () {
  $("#change-password-form").on("submit", function (e) {
    e.preventDefault();

    const newPassword = $("#new-password").val();

    $.ajax({
      url: "/api/change-password", // Your API endpoint
      method: "POST",
      data: { newPassword },
      success: function (response) {
        alert("Password updated successfully!");
      },
      error: function (error) {
        console.error("Error updating password:", error);
        alert("Failed to update password. Please try again.");
      },
    });
  });
});
