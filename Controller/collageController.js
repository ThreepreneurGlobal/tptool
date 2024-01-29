
const College = require('../Model/collageModel');
const User = require('../Model/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');



const onboardCollege = async (req, res) => {
  try {
    const { name, email, mobile, collegeId, role, imgUrl, password } = req.body;

    console.log(req.body, req.user, ' inthe admin onboard')

    const existingUser = await User.findOne({ where: { collegeId } });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'College with the same collageId already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      mobile,
      role,
      imgUrl,
      password: hashedPassword, 
      collegeId
    });

    const token = generateAccessToken(newUser.id, newUser.name, newUser.collageId, newUser.role);

    res.status(201).json({ success: true, message: 'successfully login', college: newUser, token });
  } catch (error) {
    console.error('Error onboarding college:', error);
    res.status(500).json({ success: false, message: 'Error onboarding college' });
  }
};


const collageDetails = async(req, res) => {
  try {

    const {collageName, telephone, address, city, state, regNo} = req.body;

    console.log(req.body)

    const existingCollage = await College.findOne({ where: { collageName } });

    if(existingCollage){
      return res.status(400).json({ success: false, message: 'College with the same name already exists' });
    }

    const newCollage = await College.create({
      collageName,
      telephone,
      address,
      city,
      state,
      regNo
    });

    const token = generateAccessToken(newCollage.id, newCollage.name, newCollage.collageId, newCollage.role);

    res.status(200).json({ success: true, message: 'successfully uploaded Collage details', college: newCollage, token})

  } catch(error) {
    console.error('Error storing college:', error);
    res.status(500).json({ success: false, message: 'Error storing college details' });
  }
}


const generateAccessToken = (userId, college, collageId, role) => {
  return jwt.sign({ userId, college, collageId, role }, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"); 
};



const getColleges = async (req, res) => {
    try {
        const {role, collageId} = req.query

        console.log(role, collageId, "check in get collages")
        
        let colleges

        if(role == 'superUser' && collageId == 'Null') {
            colleges = await User.findAll(); 
        } else {
            colleges = await User.findAll({ where: { collageId: collageId, role: 'student' } });
        }

        res.status(200).json({ success: true, colleges });

    } catch (error) {
        console.error('Error getting colleges:', error);
        res.status(500).json({ success: false, message: 'Error getting colleges' });
    }
};

module.exports = { onboardCollege, getColleges, collageDetails}; 




