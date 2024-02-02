const Student = require("../Model/studentDataModel");
const User = require("../Model/userModel");
const ExcelJS = require("exceljs");
const multer = require("multer");
const Recruiter = require("../Model/recruiterModel");
const { Op } = require("sequelize");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single("file");

const uploadExcel = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        console.error("Error uploading Excel:", err);
        return res
          .status(500)
          .json({ success: false, message: "Error uploading Excel" });
      }

      const file = req.file;

      const { userId } = req.user;
      console.log(file, req.user, "check in control");

      const collageIdToBeUse = await User.findOne({
        where: {
          id: userId,
        },
      });

      const collegeId = collageIdToBeUse.collegeId;

      if (!file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }

      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer);

        const firstSheet = workbook.worksheets[0];

        if (!firstSheet) {
          return res
            .status(400)
            .json({ success: false, message: "No sheets found in Excel file" });
        }

        const data = [];
        const headers = [];

        firstSheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            const rowData = {
              name: row.getCell("A").value,
              email: row.getCell("B").value,
              collegeId: collegeId,
              image: row.getCell("C").value,
              skills: row.getCell("D").value,
              percentage: row.getCell("E").value,
              mobile: row.getCell("F").value,
              role: row.getCell("G").value,
              certification: row.getCell("H").value,
              branch: row.getCell("I").value,
              enrollmentId: row.getCell("J").value,
              year: row.getCell("K").value,
              status: true,
            };

            data.push(rowData);
          }
        });

        console.log(data, "]]]]]]]]]]]]]]]]");

        await User.bulkCreate(data);

        res
          .status(201)
          .json({ success: true, message: "Data uploaded successfully" });
      } catch (workbookError) {
        console.error("Error loading workbook:", workbookError);
        res
          .status(500)
          .json({ success: false, message: "Error loading Excel workbook" });
      }
    });
  } catch (error) {
    console.error("Error uploading Excel:", error);
    res.status(500).json({ success: false, message: "Error uploading Excel" });
  }
};

const UploadIndivisualStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      percentage,
      skills,
      image,
      role,
      mobile,
      enrollmentId,
      certification,
      branch,
      year,
      collegeId,
    } = req.body;
    console.log(req.body, req.user, "in the student");

    const existingUser = await User.findOne({ where: { email: email } });

    if (existingUser) {
      console.log("in the existing user");
      return res
        .status(409)
        .json({ success: false, error: "Email already registered" });
    }

    const skillsArray = skills.split(",").map((skill) => skill.trim());

    const skillsString = JSON.stringify(skillsArray);

    const uploadToDb = await User.create({
      name,
      email,
      percentage,
      skills: skillsString,
      image,
      role,
      enrollmentId,
      certification,
      branch,
      mobile,
      year,
      collegeId,
      status: true,
    });

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      student: uploadToDb,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Error" });
  }
};

const viewUploadedData = async (req, res) => {
  try {
    const { userId } = req.user;
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 5;
    const { branch, year, sortBy, sortOrder } = req.query;

    const findCollegeId = await User.findOne({ where: { id: userId } });
    const collegeId = findCollegeId.collegeId;

    if (!collegeId) {
      return res
        .status(400)
        .json({ success: false, message: "CollegeId is required" });
    }

    const offset = (page - 1) * pageSize;

    let whereClause = { collegeId, role: "student" };

    if (branch) {
      whereClause.branch = branch;
    }
    if (year) {
      whereClause.year = year;
    }

    let order = [];
    if (sortBy && sortOrder) {
      // Push the sorting order into the order array
      order.push([sortBy, sortOrder.toUpperCase()]);
    }

    const totalCount = await User.count({ where: whereClause });

    let uploadedData;

    if (branch || year) {
      uploadedData = await User.findAll({
        where: whereClause,
        order,
        limit: pageSize,
        offset,
      });
    } else {
      uploadedData = await User.findAll({
        where: { collegeId, role: "student" },
        order,
        limit: pageSize,
        offset,
      });
    }

    res.status(200).json({ success: true, uploadedData, totalCount, pageSize });
  } catch (error) {
    console.error("Error getting file data:", error);
    res
      .status(500)
      .json({ success: false, message: "Error getting data from db" });
  }
};

const searchUsersByName = async (req, res) => {
  try {
    const { userId } = req.user;
    const { searchQuery } = req.query;

    const findCollegeId = await User.findOne({ where: { id: userId } });
    const collegeId = findCollegeId.collegeId;

    if (!collegeId) {
      return res
        .status(400)
        .json({ success: false, message: "CollegeId is required" });
    }

    const whereClause = {
      collegeId,
      role: "student",
      name: { [Op.like]: `%${searchQuery}%` },
    };

    const totalCount = await User.count({ where: whereClause });

    const searchedUsers = await User.findAll({
      where: whereClause,
    });

    res.status(200).json({ success: true, searchedUsers, totalCount });
  } catch (error) {
    console.error("Error searching users by name:", error);
    res
      .status(500)
      .json({ success: false, message: "Error searching users by name" });
  }
};

const exportDataToExcel = async (req, res) => {
  try {
    const { collageId } = req.user;

    console.log(collageId, " checking id in export function");

    if (!collageId) {
      return res
        .status(400)
        .json({ success: false, message: "CollageId is required" });
    }

    const studentData = await Student.findAll({ where: { collageId } });

    if (!studentData || studentData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No data found for the given CollageId",
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Student Data");

    worksheet.addRow([
      "Name",
      "Email",
      "CollageId",
      "Image",
      "Skills",
      "Twelfth Percentage",
      "Phone Number",
    ]);

    studentData.forEach((student) => {
      const { name, email, collageId, image, skills, percentage, mobile } =
        student;
      worksheet.addRow([
        name,
        email,
        collageId,
        image,
        skills,
        percentage,
        mobile,
      ]);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=student_data.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    console.error("Error exporting data to Excel:", error);
    res
      .status(500)
      .json({ success: false, message: "Error exporting data to Excel" });
  }
};

const postContent = async (req, res) => {
  const { companyName, position, eligibility, details } = req.body;
  const { collageId } = req.user;

  console.log(req.body, collageId);

  try {
    const existingRecruiter = await Recruiter.findOne({
      where: { companyName: companyName },
    });

    if (existingRecruiter) {
      return res.status(400).json({
        error: "Recruiter already exists",
      });
    }

    const newRecruiter = await Recruiter.create({
      companyName,
      position,
      eligibility,
      details,
      uploader: collageId,
    });

    res.status(201).json({
      message: "Recruiter created successfully",
      Recruiter: newRecruiter,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ success: false, message: "Error in posting content" });
  }
};

const displayRecruiter = async (req, res) => {
  try {
    const { collageId } = req.user;
    const page = req.query.page || 1;
    const pageSize = 10;

    if (!collageId) {
      return res
        .status(400)
        .json({ success: false, message: "something went wrong" });
    }

    const offset = (page - 1) * pageSize;

    const totalCount = await Recruiter.count({
      where: { uploader: collageId },
    });

    const uploadedData = await Recruiter.findAll({
      where: { uploader: collageId },
      limit: pageSize,
      offset,
    });

    res.status(200).json({
      success: true,
      uploadedData,
      totalCount: totalCount,
      pageSize: pageSize,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ success: false, message: "Error in viewing content" });
  }
};

const deletePost = async (req, res) => {
  try {
    const deleteId = req.params.studentId;
    const student_data = await Student.findOne({ where: { id: deleteId } });

    await student_data.destroy({ where: { id: deleteId } });

    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "id is missing" });
  }
};

const deleteRecruiter = async (req, res) => {
  try {
    const deleteId = req.params.recruiterId;
    console.log(req.params);
    const recruiter = await Recruiter.findOne({ where: { id: deleteId } });

    await recruiter.destroy({ where: { id: deleteId } });

    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "id is missing" });
  }
};

module.exports = {
  uploadExcel,
  UploadIndivisualStudent,
  viewUploadedData,
  searchUsersByName,
  exportDataToExcel,
  postContent,
  displayRecruiter,
  deletePost,
  deleteRecruiter,
};
