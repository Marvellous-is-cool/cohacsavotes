const connection = require("../models/connection");
const postAspirantController = require("./postAspirantController");

async function authenticateStudent(matric, password) {
  const sql = "SELECT * FROM students WHERE matric = ? AND password = ?";
  try {
    const [rows] = await connection.execute(sql, [matric, password]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error authenticating student:", error);
    throw error;
  }
}

async function getPostsAndAspirants() {
  const sqlPosts = "SELECT * FROM posts ORDER BY id ASC";
  const sqlAspirants = `
    SELECT a.*, pa.post_id 
    FROM aspirants a 
    JOIN post_aspirants pa ON a.id = pa.aspirant_id
  `;
  try {
    const [posts] = await connection.execute(sqlPosts);
    const [aspirants] = await connection.execute(sqlAspirants);

    const postsWithAspirants = posts.map((post) => {
      post.aspirants = aspirants.filter(
        (aspirant) => aspirant.post_id === post.id
      );
      return post;
    });

    return postsWithAspirants;
  } catch (error) {
    console.error("Error fetching posts and aspirants:", error);
    throw error;
  }
}

async function toggleVote(aspirantId, studentId) {
  const sqlCheckVote =
    "SELECT * FROM votes WHERE student_id = ? AND aspirant_id = ?";
  const sqlVote = "INSERT INTO votes (student_id, aspirant_id) VALUES (?, ?)";
  const sqlUnvote =
    "DELETE FROM votes WHERE student_id = ? AND aspirant_id = ?";

  try {
    const [existingVote] = await connection.execute(sqlCheckVote, [
      studentId,
      aspirantId,
    ]);
    if (existingVote.length > 0) {
      await connection.execute(sqlUnvote, [studentId, aspirantId]);
    } else {
      await connection.execute(sqlVote, [studentId, aspirantId]);
    }
  } catch (error) {
    console.error("Error toggling vote:", error);
    throw error;
  }
}

async function getPostById(id) {
  try {
    const [post] = await connection.execute(
      "SELECT * FROM posts WHERE id = ?",
      [id]
    );
    if (!post.length) {
      throw new Error("Post not found");
    }

    const aspirants = await postAspirantController.getAspirantsForPost(id);

    return { post: post[0], aspirants };
  } catch (error) {
    console.error("Error fetching post details:", error);
    throw new Error("Error fetching post details");
  }
}

async function incrementVote(aspirantId) {
  const sql = "UPDATE aspirants SET votes = votes + 1 WHERE id = ?";

  try {
    await connection.execute(sql, [aspirantId]);
  } catch (error) {
    console.error("Error incrementing vote:", error);
    throw error;
  }
}

async function getVoteCounts() {
  const sql = `
    SELECT a.full_name AS name, a.votes 
    FROM aspirants a 
    ORDER BY a.id
  `;

  try {
    const [rows] = await connection.execute(sql);
    return rows;
  } catch (error) {
    console.error("Error fetching vote counts:", error);
    throw error;
  }
}

async function changePassword(studentId, newPassword) {
  const sql = "UPDATE students SET password = ? WHERE id = ?";
  try {
    await connection.execute(sql, [newPassword, studentId]);
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
}

async function setVoteStatus(studentId, voteStatus) {
  const sql = "UPDATE students SET vote_status = ? WHERE id = ?";
  try {
    // Ensure voteStatus is either true (1) or false (0)
    const statusValue = voteStatus ? 1 : 0;
    await connection.execute(sql, [statusValue, studentId]);
  } catch (error) {
    console.error("Error setting vote status:", error);
    throw error;
  }
}

module.exports = {
  authenticateStudent,
  getPostsAndAspirants,
  toggleVote,
  getPostById,
  incrementVote,
  getVoteCounts,
  changePassword,
  setVoteStatus,
};
