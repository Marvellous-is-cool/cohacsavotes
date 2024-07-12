const connection = require("../models/connection"); // Update the path based on your file structure
const uploadFile = require("../helpers/uploadFile"); // Update the path based on your file structure

const getAspirantById = async (aspirantId) => {
  try {
    const [aspirant] = await connection.execute(
      "SELECT * FROM aspirants WHERE id = ?",
      [aspirantId]
    );
    return aspirant[0];
  } catch (error) {
    console.error("Error fetching aspirant by ID:", error);
    throw error;
  }
};

const updateAspirant = async (aspirantId, editedDetails) => {
  try {
    // Fetch the existing aspirant details for photo URL
    const [existingAspirant] = await connection.execute(
      "SELECT * FROM aspirants WHERE id = ?",
      [aspirantId]
    );

    // Update aspirant details in the database
    const updateQuery = `
        UPDATE aspirants
        SET
          nickname = ?,
          level = ?,
          photo_url = ?,
          votes = ?
        WHERE id = ?
      `;

    // Upload photo if provided, or use the existing one
    editedDetails.photo_url = editedDetails.photo
      ? (await uploadFile(editedDetails.photo, editedDetails)).photo
      : existingAspirant[0].photo_url;

    const values = [
      editedDetails.nickname,
      editedDetails.level,
      editedDetails.photo_url,
      editedDetails.votes,
      aspirantId,
    ];

    await connection.execute(updateQuery, values);

    console.log(`Aspirant with ID ${aspirantId} updated successfully.`);
  } catch (error) {
    console.error("Error updating aspirant:", error);
    throw error;
  }
};

const renderEditAspirantPage = async (req, res) => {
  try {
    // Fetch the necessary data (e.g., aspirant details) based on req.params
    const aspirantId = req.params.aspirantId;
    const aspirant = await getAspirantById(aspirantId);

    res.render("admin/edit-aspirant", { aspirant }); // Corrected template path
  } catch (error) {
    console.error("Error rendering edit page:", error);
    req.flash("error", "Error rendering edit page. Please try again.");
    res.redirect("/admin/dashboard");
  }
};

const editAspirant = async (req, res) => {
  try {
    // Get the edited aspirant details from the form submission
    const aspirantId = req.params.aspirantId;
    const editedDetails = req.body;

    // Update the aspirant details in the database
    await updateAspirant(aspirantId, editedDetails);

    req.flash("success", "Aspirant updated successfully.");
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Error updating aspirant:", error);
    req.flash("error", "Error updating aspirant. Please try again.");
    res.redirect("/admin/dashboard");
  }
};

module.exports = { updateAspirant, renderEditAspirantPage, editAspirant };
