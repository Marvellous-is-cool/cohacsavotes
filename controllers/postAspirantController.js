// postAspirantController.js

const db = require("../models/connection");

// Function to get aspirants for a specific post
async function getAspirantsForPost(postId) {
  const sql = `
    SELECT aspirants.*, post_aspirants.post_id
    FROM aspirants
    JOIN post_aspirants ON aspirants.id = post_aspirants.aspirant_id
    WHERE post_aspirants.post_id = ?;
  `;

  try {
    const [results] = await db.execute(sql, [postId]);

    return results;
  } catch (error) {
    console.error("Error executing query in postAspirantController.js:", error);
    throw error;
  }
}

// Function to link a aspirant to an post
function linkAspirantToPost(aspirantId, postId) {
  const sql = "INSERT INTO post_aspirants (aspirant_id, post_id) VALUES (?, ?)";

  return new Promise((resolve, reject) => {
    db.query(sql, [aspirantId, postId], (err, results) => {
      if (err) {
        console.error(" Error linking aspirant to post:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Function to unlink a aspirant from all posts
async function unlinkAspirantFromAllPosts(aspirantId) {
  const sql = "DELETE FROM post_aspirants WHERE aspirant_id = ?";

  try {
    const [results] = await db.execute(sql, [aspirantId]);

    return results;
  } catch (err) {
    console.error(" Error unlinking aspirant from all posts:", err);
    throw err; // Re-throw the error to let the calling function handle it
  }
}

// Function to get posts for a specific aspirant
async function getAspirantWithPost(aspirantId) {
  const sql = `
      SELECT a.full_name, p.title as postTitle
      FROM aspirants a
      JOIN post_aspirants pa ON a.id = pa.aspirant_id
      JOIN posts p ON pa.post_id = p.id
      WHERE a.id = ?;
  `;

  try {
    const [results] = await db.execute(sql, [aspirantId]);
    return results[0];
  } catch (error) {
    console.error("Error fetching aspirant with post:", error);
    throw error;
  }
}

async function getAspirantsForPost(postId) {
  const sql = `
    SELECT aspirants.*, post_aspirants.post_id
    FROM aspirants
    JOIN post_aspirants ON aspirants.id = post_aspirants.aspirant_id
    WHERE post_aspirants.post_id = ?;
  `;

  try {
    const [results] = await db.execute(sql, [postId]);

    return results;
  } catch (error) {
    console.error("Error executing query in postAspirantController.js:", error);
    throw error;
  }
}

module.exports = {
  getAspirantsForPost,
  linkAspirantToPost,
  unlinkAspirantFromAllPosts,
  // getPostsForAspirant,
  getAspirantsForPost,
  getAspirantWithPost,
  // Add other functions as needed...
};
