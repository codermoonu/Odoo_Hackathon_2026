
const express = require("express");

const {
  registerUser,
  loginUser,
  updateProfileImage,
} = require("../controllers/userController");

const upload = require("../middlewares/uploadMiddleware");
const protect = require("../middlewares/userMiddleware");

const router = express.Router();



router.post("/register", registerUser);


router.post("/login", loginUser);



router.put(
  "/profile-image",
  protect,
  upload.single("image"),
  updateProfileImage
);


module.exports = router;

