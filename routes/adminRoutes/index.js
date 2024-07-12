const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/adminController");
const editController = require("../../controllers/editController");
const authMiddleware = require("../../middlewares/authMiddleware"); // Import auth middleware

// Admin login route
router.get("/login", (req, res) => {
  const error = req.flash("error")[0]; // Get the first error message
  res.render("admin/admin-login", { error });
});

// Admin authentication route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const { success, error, admin } = await adminController.authenticateAdmin(
      username,
      password
    );

    if (success) {
      req.session.regenerate((err) => {
        if (err) {
          console.error("Error regenerating session:", err);
          res.status(500).render("suspended");
        } else {
          req.session.admin = true;
          req.session.adminUsername = admin.username;

          // Set session expiration to 20 hours from now
          const sessionExpiration = 20 * 60 * 60 * 1000; // 20 hours in milliseconds
          req.session.cookie.expires = new Date(Date.now() + sessionExpiration);
          req.session.cookie.maxAge = sessionExpiration;

          res.redirect("/admin/dashboard");
        }
      });
    } else {
      req.flash("error", error);
      res.redirect("/admin/login");
    }
  } catch (error) {
    console.error("Error authenticating admin:", error);
    res.status(500).render("suspended");
  }
});

// Admin dashboard route with authentication middleware
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const posts = await adminController.getDashboardData();
    res.render("admin/admin-dashboard", { posts });
  } catch (error) {
    console.error("Error rendering admin dashboard:", error);
    res.status(500).render("suspended");
  }
});

// Route to show add aspirant form
router.get("/add-aspirant", async (req, res) => {
  try {
    const posts = await adminController.getPostTitles(); // Fetch post titles
    res.render("admin/add-aspirant", { posts });
  } catch (error) {
    console.error("Error fetching post titles:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Add aspirant route with authentication middleware
router.post("/add-aspirant", authMiddleware, async (req, res) => {
  await adminController.addAspirant(req, res);
});

// Delete aspirant route with authentication middleware
router.post(
  "/delete-aspirant/:postId/:aspirantId",
  authMiddleware,
  async (req, res) => {
    try {
      const { postId, aspirantId } = req.params;
      const result = await adminController.deleteAspirant(req, res); // Pass req and res to the controller method
      res.redirect("/admin/dashboard"); // Redirect to dashboard or wherever appropriate after deletion
    } catch (error) {
      console.error("Error deleting aspirant:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
);

// Admin dashboard overview route
router.get("/dashboard/overview", authMiddleware, async (req, res) => {
  try {
    const posts = await adminController.getDashboardData();
    const votedStudents = await adminController.getVotedStudents();
    res.render("admin/admin-overview", { posts, votedStudents });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Edit aspirant routes
router.get(
  "/edit-aspirant/:postId/:aspirantId",
  authMiddleware,
  editController.renderEditAspirantPage
);

router.post(
  "/edit-aspirant/:postId/:aspirantId",
  authMiddleware,
  editController.editAspirant
);

// Logout route
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).render("suspended");
    } else {
      res.redirect("/");
    }
  });
});

// Delete session route
router.post("/delete-session", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete session" });
    } else {
      res.json({ success: true });
    }
  });
});

module.exports = router;
