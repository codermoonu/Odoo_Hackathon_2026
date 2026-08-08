const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const cloudinary = require("../config/cloudinary");


const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};



const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

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
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};


const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select a profile image",
      });
    }

  
    const userId = req.user._id || req.user.id;

    
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

  
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
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
    });


    if (
      user.image &&
      user.image.includes("res.cloudinary.com")
    ) {
      try {
        const imageUrl = user.image;


        const uploadMarker = "/upload/";

        const uploadIndex = imageUrl.indexOf(uploadMarker);

        if (uploadIndex !== -1) {
          let publicId = imageUrl.substring(
            uploadIndex + uploadMarker.length
          );

   

          publicId = publicId.replace(
            /^v\d+\//,
            ""
          );

          
          publicId = publicId.replace(
            /\.[^/.]+$/,
            ""
          );

          await cloudinary.uploader.destroy(publicId);
        }
      } catch (deleteError) {
    
        console.error(
          "Could not delete old Cloudinary image:",
          deleteError.message
        );
      }
    }


    user.image = uploadResult.secure_url;

    await user.save();


    res.status(200).json({
      message: "Profile picture updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
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

module.exports = {
  registerUser,
  loginUser,
  updateProfileImage,
};
