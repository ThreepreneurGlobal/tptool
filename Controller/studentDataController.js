
const Student = require('../Model/studentDataModel');
const User = require('../Model/userModel');
const ExcelJS = require('exceljs');
const multer = require('multer');
const Recruiter = require('../Model/recruiterModel');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file');



const uploadExcel = async (req, res) => {

  try { 
    upload(req, res, async (err) => {
      if (err) {
        console.error('Error uploading Excel:', err);
        return res.status(500).json({ success: false, message: 'Error uploading Excel' });  
      }

      const file = req.file;

      console.log(file, 'check in control'); 

      if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer);

        const firstSheet = workbook.worksheets[0];

        if (!firstSheet) {
          return res.status(400).json({ success: false, message: 'No sheets found in Excel file' });
        }

        const data = [];
        const  headers = [];
        

        firstSheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            const rowData = {
              name: row.getCell('A').value,
              email: row.getCell('B').value,
              collageId: row.getCell('C').value,
              image: row.getCell('D').value,
              skills: row.getCell('E').value,
              twelfthPercentage: row.getCell('F').value,
              phoneNumber: row.getCell('G').value,
              role: row.getCell('H').value,
              certification: row.getCell('I').value,
              branch: row.getCell('J').value,
              enrollmentId: row.getCell('K').value,
              // year: row.getCell('L').value
            };

            data.push(rowData); 
          }
        });

        console.log(data, ']]]]]]]]]]]]]]]]');

        await User.bulkCreate(data);

        res.status(201).json({ success: true, message: 'Data uploaded successfully' });
      } catch (workbookError) {
        console.error('Error loading workbook:', workbookError);
        res.status(500).json({ success: false, message: 'Error loading Excel workbook' });
      }
    });
  } catch (error) {
    console.error('Error uploading Excel:', error);
    res.status(500).json({ success: false, message: 'Error uploading Excel' });
  }
};


const UploadIndivisualStudent = async(req, res) => {
  try {
    const {name, email, percentage, skills, image, role, mobile, enrollmentId, certification, branch, collegeId } = req.body;
    console.log(req.body, req.user, 'in the student')

    const existingUser = await User.findOne({ where: { email: email}})

    if(existingUser){
      console.log('in the existing user')
      return res.status(409).json({success: false, error: "Email already registered" });
    }

    const uploadToDb = await User.create({
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
      collegeId
    })

    res.status(201).json({ success: true, message: 'Student added successfully', student: uploadToDb});
  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Error'});
  }
}

 

const viewUploadedData = async (req, res) => {
  try {
    const { collageId } = req.user;
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 2; 

    if (!collageId) {
      return res.status(400).json({ success: false, message: 'CollageId is required' });
    }

    console.log(page, pageSize, 'in the loaded dara')
    const offset = (page - 1) * pageSize;

    const totalCount = await Student.count({
      where: { collageId },
    });

    const uploadedData = await Student.findAll({
      where: { collageId },
      limit: pageSize,
      offset,
    });

    res.status(200).json({ success: true, uploadedData: uploadedData, totalCount: totalCount, pageSize: pageSize });

  } catch (error) {
    console.error('Error getting file data:', error);
    res.status(500).json({ success: false, message: 'Error getting data from db' });
  }
};



const exportDataToExcel = async (req, res) => {
  try { 
    const { collageId } = req.user;

    console.log(collageId, ' checking id in export function');

    if (!collageId) {
      return res.status(400).json({ success: false, message: 'CollageId is required' });
    }

    const studentData = await Student.findAll({ where: { collageId } });

    if (!studentData || studentData.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found for the given CollageId' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Student Data');

    worksheet.addRow(['Name', 'Email', 'CollageId', 'Image', 'Skills', 'Twelfth Percentage', 'Phone Number']);

    studentData.forEach((student) => {
      const { name, email, collageId, image, skills, percentage, mobile } = student;
      worksheet.addRow([name, email, collageId, image, skills, percentage, mobile]);
    });
 
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=student_data.xlsx');

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    console.error('Error exporting data to Excel:', error);
    res.status(500).json({ success: false, message: 'Error exporting data to Excel' });
  }
};



const postContent = async (req, res) => {
    
  const { companyName, position, eligibility, details} = req.body;
  const {collageId} = req.user;

    console.log(req.body, collageId)

    try {
      const existingRecruiter = await Recruiter.findOne({ where: { companyName: companyName } });

      if (existingRecruiter) {
        return res.status(400).json({
            error: 'Recruiter already exists' 
        });
    } 

    const newRecruiter = await Recruiter.create({companyName, position, eligibility, details, uploader: collageId})

    res.status(201).json({
      message: 'Recruiter created successfully',
      Recruiter: newRecruiter,
  });

  } catch (err) {
    console.log(err);
    res.status(500).json({success: false, message: "Error in posting content"});
  }
}


const displayRecruiter = async (req, res) => {
  try { 
    const { collageId } = req.user;
    const page = req.query.page || 1; 
    const pageSize = 10; 

    if (!collageId) {
      return res.status(400).json({ success: false, message: 'something went wrong' });
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

    res.status(200).json({ success: true, uploadedData, totalCount: totalCount, pageSize: pageSize });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'Error in viewing content' });
  }
};


const deletePost = (async (req, res) => {
    try{
        const deleteId = req.params.studentId;
        const student_data = await Student.findOne({ where: {id: deleteId}})

        await student_data.destroy({where: { id: deleteId }})
      
        res.status(200).json({success: true})

    }
    catch(err) {
        console.log(err)
        res.status(400).json({error: 'id is missing'})
    }
})


const deleteRecruiter = (async (req, res) => {
  try{
      const deleteId = req.params.recruiterId;
      console.log(req.params)
      const recruiter = await Recruiter.findOne({ where: {id: deleteId}})

      await recruiter.destroy({where: { id: deleteId }})
    
      res.status(200).json({success: true})

  }
  catch(err) {
      console.log(err)
      res.status(400).json({error: 'id is missing'})
  }
})

module.exports = { 
  uploadExcel, 
  UploadIndivisualStudent,
  viewUploadedData,
  exportDataToExcel,
  postContent,
  displayRecruiter,
  deletePost,
  deleteRecruiter
};
