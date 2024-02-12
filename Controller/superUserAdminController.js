
const jwt = require('jsonwebtoken');

const generateAccessToken = (email, role) => {
  return jwt.sign({ email, role}, process.env.TOKEN_SECRET);
};

const loginSuperUser = (req, res) => {
    try { 
      const { email, password, role = 'superUser' } = req.body;

      console.log(req.body, 'innt the main admin')
  
      if (email === 'ritesh@gmail.com' && password === '12345') {

        const token = generateAccessToken(email, role);

        res.status(200).json({ success: true, message: 'Super user logged in successfully', token: token });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      } 
    } catch (error) {
      console.error('Error logging in super user:', error);
      res.status(500).json({ success: false, message: 'Error logging in super user' });
    }
  };
  
  module.exports = { loginSuperUser };