const Collage = require("../Model/collageModel");
const User = require("../Model/userModel");
const ExcelJS = require("exceljs");
const multer = require("multer");
const Recruiter = require("../Model/recruiterModel");
const { Op } = require("sequelize");
const { Company } = require("sib-api-v3-sdk");

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

        
        firstSheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            const skillsArray = row.getCell("D").value.split(",").map(skill => skill.trim());
            const rowData = {
              name: row.getCell("A").value,
              email: row.getCell("B").value,
              collegeId: collegeId,
              image: row.getCell("C").value,
              skills: skillsArray,
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

    console.log(skillsArray, 'jkbekfgkhkdsyd')

    const uploadToDb = await User.create({
      name,
      email,
      percentage,
      skills: skillsArray,
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



const updateCollegeDetails = async (req, res) => {
  try {
    const { collegeId, address, location, telephone, logo, departments, description } = req.body;

    const college = await Collage.findByPk(collegeId);

    if (!college) {
      return res.status(404).json({ success: false, message: "College not found" });
    }

    console.log(req.body, 'int the update');
    
    const departmentsArray = departments.split(",").map((department) => department.trim());

    if(address){
      college.address = address;
    }
    if(telephone){
      college.telephone = telephone;
    }
    if(logo){
      college.logo = logo;
    }
    if(departmentsArray){
      college.department = departmentsArray;
    }
    if(location){
      college.location = location;
    }
    if(description){
      college.description = description;
    };

    await college.save();

    res.status(200).json({ success: true, message: "College details updated successfully", college });
  } catch (error) {
    console.error("Error updating college details:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



const viewUploadedData = async (req, res) => {
  try {
    const { userId } = req.user;
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 20;
    const { branch, year, sortBy, sortOrder } = req.query;

    const findCollegeId = await User.findOne({ where: { id: userId } });
    const collegeId = findCollegeId.collegeId;

    if (!collegeId) {
      return res
        .status(400)
        .json({ success: false, message: "CollegeId is required" });
    }

    const offset = (page - 1) * pageSize;

    let whereClause = { collegeId, role: "student", status: true };

    console.log(whereClause, 'llkanakja')

    if (branch) {
      whereClause.branch = branch;
    };

    if (year) {
      whereClause.year = year;
    };

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
        where: { collegeId, role: "student", status: true },
        order,
        limit: pageSize,
        offset,
      });
    }

    console.log(uploadedData, 'keviyeqdvqekdb')

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
    const { userId } = req.user;

    const findCollegeId = await User.findOne({ where: { id: userId } });
    const collegeId = findCollegeId.collegeId;

    console.log(collegeId, " checking id in export function");

    if (!collegeId) {
      return res
        .status(400)
        .json({ success: false, message: "CollageId is required" });
    }

    const studentData = await User.findAll({ where: { collegeId } });

    if (!studentData || studentData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No data found for the given CollageId",
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Student Data");

    worksheet.addRow([
        "name",
        "email",
        "percentage",
        "skills",
        "image",
        "role",
        "enrollmentId",
        "certification",
        "branch",
        "mobile",
        "year",
        "collegeId"
    ]);

    studentData.forEach((student) => {
      const { name, email, percentage, skills, image, role, enrollmentId, certification, branch, mobile, year, collegeId } = student;
      worksheet.addRow([
        name,
        email,
        percentage,
        skills,
        image,
        role,
        enrollmentId,
        certification,
        branch,
        mobile,
        year,
        collegeId
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


const postRecruiter = async (req, res) => {

  const { companyName, position, eligibility, description, address , state, city } = req.body;
  const { collegeId } = req.user;

  console.log(req.body, collegeId);

  try {
    const existingRecruiter = await Collage.findOne({
      where: { name: companyName },
    });

    if (existingRecruiter) {
      return res.status(400).json({
        error: "Recruiter already exists",
      });
    };

    const newRecruiter = await Collage.create({
      name: companyName,
      address,
      position,
      eligibility,
      description,
      state,
      city,
      uploader: collegeId,
      status: true,
      category: "Company"
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
  };
};


const displayRecruiter = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const page = req.query.page || 1;
    const pageSize = 10;

    console.log(req.user, 'chrck in recruiter')
    if (!collegeId) {
      return res
        .status(400)
        .json({ success: false, message: "something went wrong" });
    }

    const offset = (page - 1) * pageSize;

    const totalCount = await Collage.count({
      where: { uploader: collegeId, category: "Company",status: true },
    });

    const uploadedData = await Collage.findAll({
      where: { uploader: collegeId, category: "Company", status: true},
      limit: pageSize,
      offset,
    });

    console.log(uploadedData, 'sajjds');

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


const deleteStudent = async (req, res) => {
  try {
    const deleteId = req.params.studentId;
    const student_data = await User.findOne({ where: { id: deleteId } });

    console.log(req.params, student_data, req.query);
    // await student_data.destroy({ where: { id: deleteId } });
    student_data.status = 0;
    console.log(deleteId, student_data, 'in the delete student');
    
    await student_data.save();

    res.status(200).json({ success: true, response: student_data }); 

  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "id is missing" });
  }
};


const deleteRecruiter = async (req, res) => {
  try {
    const deleteId = req.params.recruiterId;
    console.log(req.params);
    const recruiter = await Collage.findOne({ where: { id: deleteId } });

    recruiter.status = 0;

    await recruiter.save();

    res.status(200).json({ success: true, response: recruiter });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "id is missing" });
  }
};


module.exports = {
  uploadExcel,
  UploadIndivisualStudent,
  viewUploadedData,
  updateCollegeDetails,
  searchUsersByName,
  exportDataToExcel,
  postRecruiter,
  displayRecruiter,
  deleteStudent,
  deleteRecruiter,
};
 