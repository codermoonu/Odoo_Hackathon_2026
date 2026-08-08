const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const cloudinary = require("../config/cloudinary");

/* =========================================================
   REGISTER USER
========================================================= */

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,

        // IMPORTANT FOR ADMIN LOGIN
        role: user.role,
        organization: user.organization,
        isActive: user.isActive,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      message: error.message || "Registration failed",
    });
  }
};


/* =========================================================
   LOGIN USER
========================================================= */

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message:
          "Your account access has been disabled. Contact your organization admin.",
      });
    }

    user.lastLoginAt = new Date();

    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,

        // IMPORTANT
        role: user.role,
        organization: user.organization,
        isActive: user.isActive,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: error.message || "Login failed",
    });
  }
};


/* =========================================================
   UPDATE PROFILE IMAGE - CLOUDINARY
========================================================= */

const updateProfileImage = async (req, res) => {
  try {
    /* -----------------------------------------
       1. Check if an image was uploaded
    ----------------------------------------- */

    if (!req.file) {
      return res.status(400).json({
        message: "Please select a profile image",
      });
    }


    /* -----------------------------------------
       2. Get logged-in user
    ----------------------------------------- */

    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }


    /* -----------------------------------------
       3. Upload image to Cloudinary
    ----------------------------------------- */

    const uploadResult = await new Promise(
      (resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder: "wayflo/profile-images",
              resource_type: "image",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

        uploadStream.end(req.file.buffer);
      }
    );


    /* -----------------------------------------
       4. Delete old Cloudinary image
       if the user already has one
    ----------------------------------------- */

    if (
      user.image &&
      user.image.includes("res.cloudinary.com")
    ) {
      try {
        const imageUrl = user.image;

        const uploadMarker = "/upload/";

        const uploadIndex =
          imageUrl.indexOf(uploadMarker);

        if (uploadIndex !== -1) {
          let publicId =
            imageUrl.substring(
              uploadIndex + uploadMarker.length
            );

          // Remove version number
          publicId = publicId.replace(
            /^v\d+\//,
            ""
          );

          // Remove file extension
          publicId = publicId.replace(
            /\.[^/.]+$/,
            ""
          );

          await cloudinary.uploader.destroy(
            publicId
          );
        }
      } catch (deleteError) {
        console.error(
          "Could not delete old Cloudinary image:",
          deleteError.message
        );
      }
    }


    /* -----------------------------------------
       5. Save new Cloudinary URL in MongoDB
    ----------------------------------------- */

    user.image = uploadResult.secure_url;

    await user.save();


    /* -----------------------------------------
       6. Send updated user to frontend
    ----------------------------------------- */

    res.status(200).json({
      message: "Profile picture updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,

        // Keep these available to frontend
        role: user.role,
        organization: user.organization,
        isActive: user.isActive,
      },
    });

  } catch (error) {
    console.error(
      "Profile image upload error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Failed to update profile picture",
    });
  }
};


/* =========================================================
   UPDATE PROFILE NAME
========================================================= */

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.name = name.trim();

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,

        role: user.role,
        organization: user.organization,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error(
      "Profile update error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


/* =========================================================
   UPDATE PASSWORD
========================================================= */

const updatePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message:
          "Current and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          "New password must be at least 6 characters",
      });
    }

    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message:
          "Current password is incorrect",
      });
    }

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(
      newPassword,
      salt
    );

    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(
      "Password update error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  registerUser,
  loginUser,
  updateProfileImage,
  updateProfile,
  updatePassword,
};