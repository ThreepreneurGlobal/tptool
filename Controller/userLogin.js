// const User = require('../Model/userModel');
const jwt = require("jsonwebtoken");
const Bcrypt = require("bcrypt");
const Admin = require("../Model/collageModel");
const Student = require("../Model/studentDataModel");
const User = require("../Model/userModel");

const signupUser = async (req, res) => {
  const {
    name,
    email,
    collageId,
    twelfthPercentage,
    skills,
    image,
    role,
    phoneNumber,
    password,
  } = req.body;
  
  console.log(
    name,
    email,
    collageId,
    twelfthPercentage,
    skills,
    image,
    role,
    phoneNumber,
    password,
    "]]]]]]]]]"
  );
  try {
    const existingUser = await Student.findOne({ where: { email: email } });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    Bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        throw new Error("Something went wrong");
      }

      const newStudent = await Student.create({
        name,
        email,
        collageId,
        percentage,
        skills,
        role,
        image,
        mobile,
        password: hash,
      });

      res.status(201).json({
        message: "User created successfully",
        Student: newStudent,
      });
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error creating user" });
  }
};

const generateAccessToken = (userId, collegeAdmin, collegeId, role) => {
  return jwt.sign(
    { userId, collegeAdmin, collegeId, role },
    process.env.TOKEN_SECRET
  );
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password, "check in the loginUser");

    // Find user by email
    const user = await User.findOne({ where: { email: email } });

    console.log(user, 'oooooooo');
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Compare passwords
    Bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        throw new Error("Something Went Wrong");
      }

      if (result === true) {
        const role = user.role;
        const token = generateAccessToken(
          user.id,
          user.name,
          user.collegeId,
          role
        );

        console.log(token, 'hooooo');

        res.status(200).json({
          success: true,
          message: "User logged in successfully",
          token: token,
        });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Password not matched" });
      }
    });
  } catch (err) {
    console.log("Error logging in:", err);
    res.status(500).json({ success: false, message: "Error logging in" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const newPassword = password;

    const user = await User.findOne({ where: { collegeEmail: collegeEmail } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    Bcrypt.hash(newPassword, 1.0, async (err, hash) => {
      if (err) {
        throw new Error("Something went wrong");
      }

      user.password = hash;
      await user.save();

      res
        .status(200)
        .json({ success: true, message: "Password updated successfully" });
    });
  } catch (error) {
    console.error("Error updating password:", error);
    res
      .status(500)
      .json({ success: false, message: "Error updating password" });
  }
};

module.exports = {
  loginUser,
  signupUser,
  updatePassword,
};
