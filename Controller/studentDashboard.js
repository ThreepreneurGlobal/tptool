const Recruiter = require("../Model/recruiterModel");
const Student = require("../Model/studentDataModel");

const displayProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    console.log(userId, " checking id");

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "something went wrong" });
    }

    const student = await Student.findAll({
      where: { id: userId },
      attributes: [
        "name",
        "email",
        "phoneNumber",
        "role",
        "collageId",
        "skills",
      ],
    });

    res.status(200).json({ success: true, student });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ success: false, message: "Error in viewing content" });
  }
};

const displayReruiter = async (req, res) => {
  try {
    const { collageId } = req.user;

    console.log(req.user, " checking id");

    if (!collageId) {
      return res
        .status(400)
        .json({ success: false, message: "something went wrong" });
    }

    const uploadedData = await Recruiter.findAll({
      where: { uploader: collageId },
    });
    res.status(200).json({ success: true, uploadedData });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ success: false, message: "Error in viewing content" });
  }
};

const editProfile = async (req, res) => {
  try {
    const editId = req.user.userId;
    const { name, email, phoneNumber, skills } = req.body;

    console.log(editId, req.user, req.body);

    const editProfile = await Student.findOne({
      where: {
        id: editId,
      },
    });

    if (!editProfile) {
      return res
        .status(400)
        .json({ success: false, message: "Student Id not present" });
    } else {
      let data = await editProfile.update({
        name: name,
        email: email,
        phoneNumber: phoneNumber,
        skills: skills,
      });

      res
        .status(200)
        .json({ success: true, message: "successfuly updated profile", data });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

module.exports = {
  displayProfile,
  displayReruiter,
  editProfile,
};
