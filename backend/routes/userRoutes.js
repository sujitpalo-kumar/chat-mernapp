const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getUsers } = require("../controllers/userController");

router.get("/", auth, getUsers);

module.exports = router;
