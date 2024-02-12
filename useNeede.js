// // middleware/auth.js

// // const authenticateSuperAdmin = (req, res, next) => {
// //     try {
// //       const { role } = req.user;
  
// //       if (role === 'superAdmin') {
// //         next();
// //       } else {
// //         res.status(403).json({ success: false, message: 'Permission denied' });
// //       }
// //     } catch (error) {
// //       console.error('Error in authentication middleware:', error);
// //       res.status(500).json({ success: false, message: 'Internal server error' });
// //     }
// //   };


// const jwt = require('jsonwebtoken');

// const authenticateSuperAdmin = (req, res, next) => {
//   try {
//     // Get the JWT token from the request headers
//     const token = req.headers.Authorization;

//     if (!token) {
//       return res.status(401).json({ success: false, message: 'Unauthorized: Missing token' });
//     }

//     // Verify the JWT token
//     jwt.verify(token, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', (err, decoded) => {
//       if (err) {
//         return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
//       }

//       // Check if the decoded user has the 'superAdmin' role
//       if (decoded.role === 'superAdmin') {
//         // Attach the decoded user information to the request object
//         req.user = decoded;
//         next();
//       } else {
//         res.status(403).json({ success: false, message: 'Forbidden: Insufficient role' });
//       }
//     });
//   } catch (error) {
//     console.error('Error in authentication middleware:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };


  
// //   const authenticateAdmin = (req, res, next) => {
// //     try {

// //         // req.user to be use
// //       const { role } = req.body;
  
// //       if (role === 'admin') {
// //         next();
// //       } else {
// //         res.status(403).json({ success: false, message: 'Permission denied' });
// //       }
// //     } catch (error) {
// //       console.error('Error in authentication middleware:', error);
// //       res.status(500).json({ success: false, message: 'Internal server error' });
// //     }
// //   };


//   const authenticateAdmin = (req, res, next) => {
//     try {
//       // Get the JWT token from the request headers
//       const token = req.headers.authorization;
  
//       if (!token) {
//         return res.status(401).json({ success: false, message: 'Unauthorized: Missing token' });
//       }
  
//       // Verify the JWT token
//       jwt.verify(token, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', (err, decoded) => {
//         if (err) {
//           return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
//         }
  
//         // Check if the decoded user has the 'admin' role
//         if (decoded.role === 'admin') {
//           // Attach the decoded user information to the request object
//           req.user = decoded;
//           next();
//         } else {
//           res.status(403).json({ success: false, message: 'Forbidden: Insufficient role' });
//         }
//       });
//     } catch (error) {
//       console.error('Error in authentication middleware:', error);
//       res.status(500).json({ success: false, message: 'Internal server error' });
//     }
//   };


  
//   const authenticateStudent = (req, res, next) => {
//     try {
//       const { role } = req.user;
  
//       if (role === 'student') {
//         next();
//       } else {
//         res.status(403).json({ success: false, message: 'Permission denied' });
//       }
//     } catch (error) {
//       console.error('Error in authentication middleware:', error);
//       res.status(500).json({ success: false, message: 'Internal server error' });
//     }
//   };
  
//   module.exports = { 
//     authenticateSuperAdmin, 
//     authenticateAdmin, 
//     authenticateStudent 
// };
  

// student dataController ??

