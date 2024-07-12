const express = require("express");
const router = express.Router();
const clientController = require("../../controllers/clientController");
const postAspirantController = require("../../controllers/postAspirantController");
const authMiddleware = require("../../middlewares/authMiddleware");



module.exports = router;
