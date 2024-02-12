const College = require("../Model/collageModel");
const User = require("../Model/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const onboardCollege = async (req, res) => {
  try {
    const { name, email, mobile, collegeId, role, imgUrl, password } = req.body;

    console.log(req.body, req.user, " inthe admin onboard");

    const existingUser = await User.findOne({ where: { collegeId } });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "College with the same collageId already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      mobile,
      role,
      imgUrl,
      password: hashedPassword,
      collegeId,
      status: 1,
    });

    const token = generateAccessToken(
      newUser.id,
      newUser.name,
      newUser.collegeId,
      newUser.role
    );

    res.status(201).json({
      success: true,
      message: "successfully login",
      college: newUser,
      token,
    });
  } catch (error) {
    console.error("Error onboarding college:", error);
    res
      .status(500)
      .json({ success: false, message: "Error onboarding college" });
  }
};

const collageDetails = async (req, res) => {
  try {
    const {
      name,
      telephone,
      address,
      city,
      state,
      regNo,
      pincode,
      logo,
      departments,
      types,
      location,
      description,
    } = req.body;

    console.log(req.body);

    const existingCollage = await College.findOne({ where: { name } });

    if (existingCollage) {
      return res.status(400).json({
        success: false,
        message: "College with the same name already exists",
      });
    }

    const departmentsArray = departments.split(",").map((department) => department.trim());
    // const departmentsString = JSON.stringify(departmentsArray);

    const typeArray = types.split(",").map((type) => type.trim());


    console.log(typeArray, "in the types of collage");

    const newCollage = await College.create({
      name,
      telephone,
      address,
      city,
      state,
      regNo,
      pincode,
      logo,
      department: departmentsArray,
      type: typeArray,
      category: "Collage",
      location,
      description,
      status: true,
    });

    const token = generateAccessToken(
      newCollage.id,
      newCollage.name,
      newCollage.collegeId,
      newCollage.role
    );

    res.status(200).json({
      success: true,
      message: "successfully uploaded Collage details",
      college: newCollage,
      token,
    });
  } catch (error) {
    console.error("Error storing college:", error);
    res.status(500).json({ success: false, message: "Error storing college details" });
  }
};


// const SaveUsers = async(req, res) => {
//   try {
//     const { name, email, percentage, skills, image, role, mobile, enrollmentId, certification, branch, year, collegeId } = req.body;

//     console.log(req.body, req.user, "in the student");

//     const existingUser = await User.findOne({ where: { email: email } });
//     const existinOrg = await College.findOne({ where: { name: name } });

//     if (existingUser) {
//       console.log("in the existing user");
//       return res.status(409).json({ success: false, error: "Email already registered" });
//     };

//     const uploadToOrg = await College.;
//   } catch {
//     res.status(500).json({ success: false, message: "Error storing college details" });
//   }
// };


const generateAccessToken = (userId, collegeAdmin, collegeId, role) => {
  return jwt.sign(
    { userId, collegeAdmin, collegeId, role },
    process.env.TOKEN_SECRET 
  );
};


const getColleges = async (req, res) => {
  try {
    const { collageId } = req.query;
    const { role } = req.user;

    console.log(req.query, req.user, "check in get collages");

    let colleges;

    if ( role == "superUser" ) {
      colleges = await User.findAll();
    } else {
      colleges = await User.findAll({
        where: { collageId: collageId, role: "student" },
      });
    };

    res.status(200).json({ success: true, colleges });
  } catch (error) {
    console.error("Error getting colleges:", error);
    res.status(500).json({ success: false, message: "Error getting colleges" });
  }
};

module.exports = { onboardCollege, getColleges, collageDetails };
