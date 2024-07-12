const connection = require("../models/connection");
const uploadFile = require("../helpers/uploadFile");
const postAspirantController = require("./postAspirantController");

const adminController = {
  // Get admin dashboard data
  getDashboardData: async () => {
    try {
      const [posts] = await connection.query(
        "SELECT * FROM posts ORDER BY title ASC"
      );

      const postsWithAspirants = await Promise.all(
        posts.map(async (post) => {
          const [aspirants] = await connection.query(
            `
          SELECT a.*
          FROM aspirants a
          INNER JOIN post_aspirants pa ON a.id = pa.aspirant_id
          WHERE pa.post_id = ?
        `,
            [post.id]
          );

          return { ...post, aspirants };
        })
      );

      return postsWithAspirants;
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
      throw new Error("Internal Server Error");
    }
  },

  // Get post titles for dropdown
  getPostTitles: async () => {
    try {
      const [posts] = await connection.query("SELECT id, title FROM posts");
      return posts;
    } catch (error) {
      console.error("Error fetching post titles:", error);
      throw new Error("Internal Server Error");
    }
  },

  // Authenticate admin
  authenticateAdmin: async (username, password) => {
    try {
      const [admin] = await connection.query(
        "SELECT * FROM admins WHERE username = ? AND password = ?",
        [username.toLowerCase(), password]
      );

      const result = {
        success: admin.length > 0,
        error: admin.length > 0 ? null : "Incorrect username or password",
        admin: admin.length > 0 ? admin[0] : null,
      };

      return result;
    } catch (error) {
      console.error("Error authenticating admin:", error);
      throw new Error("Internal Server Error");
    }
  },

  // Add aspirant
  addAspirant: async (req, res) => {
    const { aspirantName, aspirantLevel, postId } = req.body; // Renamed from selectedPostId to postId

    try {
      // Check if aspirantName is provided
      if (!aspirantName) {
        console.error("Aspirant name is missing.");
        res.status(400).send("Aspirant name is required.");
        return;
      }

      console.log("Request body:", req.body);

      // Upload aspirant photo
      const aspirantData = await uploadFile(
        req.files.aspirantPhoto,
        { name: aspirantName },
        "photo"
      );
      console.log("Aspirant photo uploaded:", aspirantData);

      // Insert aspirant into 'aspirants' table
      const [insertedAspirant] = await connection.query(
        "INSERT INTO aspirants (full_name, level, photo_url) VALUES (?, ?, ?)",
        [aspirantName, aspirantLevel, aspirantData.photo]
      );
      console.log("Aspirant added to 'aspirants' table:", insertedAspirant);

      // Check insertedAspirant.insertId
      if (!insertedAspirant || !insertedAspirant.insertId) {
        throw new Error("Failed to retrieve inserted aspirant ID.");
      }

      // Insert aspirant into 'post_aspirants' table
      await connection.query(
        "INSERT INTO post_aspirants (aspirant_id, post_id) VALUES (?, ?)",
        [insertedAspirant.insertId, postId]
      );

      req.flash("success", "Aspirant added successfully.");
      res.redirect("/admin/dashboard");
    } catch (error) {
      console.error("Error adding aspirant:", error);

      if (error.code === "ER_DUP_ENTRY") {
        res
          .status(400)
          .send("Aspirant with the same name already exists for this post.");
      } else {
        res.status(500).send("Internal Server Error");
      }
    }
  },

  // Delete aspirant
  deleteAspirant: async (req, res) => {
    const { postId, aspirantId } = req.params; // Retrieve postId and aspirantId from req.params

    try {
      // Delete aspirant from post_aspirants table
      await connection.query(
        "DELETE FROM post_aspirants WHERE post_id = ? AND aspirant_id = ?",
        [postId, aspirantId]
      );

      // Fetch aspirant's photo_url to delete associated photo file
      const [aspirant] = await connection.query(
        "SELECT photo_url FROM aspirants WHERE id = ?",
        [aspirantId]
      );

      if (aspirant.length > 0) {
        const photoUrl = aspirant[0].photo_url;
        await connection.query("DELETE FROM aspirants WHERE id = ?", [
          aspirantId,
        ]);

        // Delete photo file from uploads directory
        const fs = require("fs");
        const path = require("path");
        const photoPath = path.join("uploads", photoUrl);
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }

        req.flash("success", "Aspirant updated successfully.");
        res.redirect("/admin/dashboard");
      }
    } catch (error) {
      console.error("Error deleting aspirant:", error);
      throw new Error("Internal Server Error");
    }
  },

  // Get students who have voted
  getVotedStudents: async () => {
    try {
      const [students] = await connection.query(
        "SELECT id, matric, full_name FROM students WHERE vote_status = 1 ORDER BY id ASC"
      );
      return students;
    } catch (error) {
      console.error("Error fetching students who have voted:", error);
      throw new Error("Internal Server Error");
    }
  },
};

module.exports = adminController;
