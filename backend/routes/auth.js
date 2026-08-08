
const express = require("express");

const {
  registerUser,
  loginUser,
  updateProfileImage,
  updateProfile,
  updatePassword,
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

router.put("/profile", protect, updateProfile);

router.put("/password", protect, updatePassword);


module.exports = router;

