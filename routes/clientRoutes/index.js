const express = require("express");
const router = express.Router();
const clientController = require("../../controllers/clientController");
const authMiddleware = require("../../middlewares/authMiddleware");
const postAspirantController = require("../../controllers/postAspirantController");
const voteNow = require("./voteNow");

// Render the login page with an optional error message
router.get("/", (req, res) => {
  const error = req.flash("error")[0];
  res.render("index", { error });
});

// Handle the login form submission
router.post("/login", async (req, res) => {
  const { matric, password } = req.body;

  try {
    const student = await clientController.authenticateStudent(
      matric,
      password
    );

    if (student) {
      req.session.student = student;
      res.redirect("/welcome");
    } else {
      req.flash("error", "Invalid matric number or password.");
      res.redirect("/");
    }
  } catch (error) {
    console.error("Error during student authentication:", error);
    res.status(500).render("suspended");
  }
});

// Render the welcome page after successful login
router.get("/welcome", authMiddleware, async (req, res) => {
  try {
    const student = req.session.student;

    res.render("welcome", { student });
  } catch (error) {
    console.error("Error rendering welcome page:", error);
    res.status(500).render("suspended");
  }
});

// Render the main page after successful login
router.get("/main", authMiddleware, async (req, res) => {
  try {
    const posts = await clientController.getPostsAndAspirants();
    res.render("main", { posts });
  } catch (error) {
    console.error("Error rendering main page:", error);
    res.status(500).render("suspended");
  }
});

// Handle the vote submission
router.post("/voteNow", authMiddleware, async (req, res) => {
  const selectedAspirants = req.body.choices;
  const studentId = req.session.student.id; // Assuming you store student id in session

  try {
    // Increment vote for each selected aspirant
    await Promise.all(
      selectedAspirants.map((aspirantId) => {
        return clientController.incrementVote(aspirantId);
      })
    );

    // Update vote_status to true (1) for the user
    await clientController.setVoteStatus(studentId, true);

    res.redirect("/voteNowSuccess");
  } catch (error) {
    console.error("Error during voting:", error);
    res.redirect("/confirm-choice?error=Voting failed. Please try again.");
  }
});

// Route to update vote status
router.post("/setVoteStatus", authMiddleware, async (req, res) => {
  const { voteStatus } = req.body;
  const studentId = req.session.student.id; // Assuming you store student id in session

  try {
    await clientController.setVoteStatus(studentId, voteStatus);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error setting vote status:", error);
    res.status(500).json({ error: "Failed to update vote status" });
  }
});

// Route to render the success page
router.get("/voteNowSuccess", authMiddleware, (req, res) => {
  res.render("voteNowSuccess");
});

// Render the vote confirmation page
router.get("/confirm-votes", authMiddleware, (req, res) => {
  res.render("confirm-choice");
});

// Render the live vote page
router.get("/live", authMiddleware, (req, res) => {
  res.render("live");
});

// Fetch post details by post ID
router.get("/api/aspirant/:id", authMiddleware, async (req, res) => {
  try {
    const post = await postAspirantController.getAspirantWithPost(
      req.params.id
    );
    res.json(post);
  } catch (error) {
    console.error("Error fetching post details:", error);
    res.status(500).json({ error: "Failed to fetch post details" });
  }
});

// Fetch live vote counts
router.get("/api/vote-counts", async (req, res) => {
  try {
    const voteCounts = await clientController.getVoteCounts();
    res.json(voteCounts);
  } catch (error) {
    console.error("Error fetching vote counts:", error);
    res.status(500).json({ error: "Failed to fetch vote counts" });
  }
});

// Render the My Account page
router.get("/my-account", authMiddleware, async (req, res) => {
  const student = req.session.student;
  res.render("my-account", { student });
});

// change password
router.post("/api/change-password", authMiddleware, async (req, res) => {
  const studentId = req.session.student.id;
  const { newPassword } = req.body;

  try {
    await clientController.changePassword(studentId, newPassword);
    res.json({ success: true });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// bye
router.get("/bye", async (req, res) => {
  try {
    res.render("bye");
  } catch (error) {
    console.error("Error rendering index:", error);
    res.status(500).send("Internal Server Error");
    res.render("bye");
  }
});

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
