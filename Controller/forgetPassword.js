const Student = require('../Model/studentDataModel');;
const Admin = require('../Model/collageModel');
const ForgetPassword = require('../Model/passwordModel')
const Sib = require('sib-api-v3-sdk');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const e = require('express');


const generateAccessToken = (id, name, ispremiumuser) => {
    return jwt.sign({ userId: id, name: name , ispremiumuser }, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
  };

  exports.forgetPassword = async (req, res) => {
    try {
      const findEmail = req.body.email;
    //   const userId = req.user.userId; 

      console.log(findEmail, req.user)



    //   if(req.user.role == 'student'){
    //     user = await Student.findOne({ email: findEmail });
    //   } else if (req.user.role == 'admin'){
    //     user = await Admin.findById(userId);
    //   } else{
    //     return res.status(400).json({success: false, message: "invalid role"});
    //   }

    let user;
    
        user = await Student.findOne({ where: { email: findEmail }});

        if(user == null){
            user = await Admin.findOne({ where: { email: findEmail }});
        } else {
            return res.status(400).json({success: false, message: "invalid role"});
        }
    

    console.log(user, user.id, '|||||');

      if (user) {
        const id = uuid.v4();

        console.log(id, 'uuid')
        const forgetPasswordRequest = new ForgetPassword({
          id: id,
          userId: user.id,
          email: user.email,
          isactive: true,
        });
  
        await forgetPasswordRequest.save();
        console.log('done saving')
  
        const token = generateAccessToken(user.id, user.name, user.ispremiumuser);
  
        const client = Sib.ApiClient.instance

                const apiKey = client.authentications['api-key'];  
        
                apiKey.apiKey = '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'
        
                const tranEmailApi = new Sib.TransactionalEmailsApi(); 
        
                
                const sender = {
                    email: 'suteritesh@gmail.com'
                }
        
                const receiver = [{
                    email: findEmail
                }]
        
                const resetUrl = `http://localhost:7000/password/reset-password/${id}`
        
                tranEmailApi.sendTransacEmail({
                    sender, 
                    to: receiver,
                    subject: 'Password Reset Link',
                    textContent: `Here is your Password Reset Link: ${resetUrl}`,
                    htmlContent: `Click this link to reset your password: <a href="${resetUrl}"> ${resetUrl} </a>`
                })
    
            console.log('done sending msg')

                res.status(200).send({success: true, message: "Link successfully send to the Email Id"})

            } else {
                res.status(500).send({success: false, message: "Email Id not found"})
            }
        } catch (err) {
            console.log(err, ' error in forget backend');
            res.status(500).json({ success: false, message: err });
        }
  };


  exports.resetPasswordForm = async (req, res, next) => {
    try {
        const id = req.params.id;

        console.log(id, 'in the form')
    
        const forgetPasswordRequest = await ForgetPassword.findOne({ where: { id } });

        console.log(forgetPasswordRequest, 'got it')
    
        if (forgetPasswordRequest) {
        await forgetPasswordRequest.update({ isactive: false });
    
        res.status(200).header('Content-Type', 'text/html').send(`
            <html>
            <form action="/password/updatePassword/${id}" method="get">
                <label for="newpassword">Enter New password</label>
                <input name="newpassword" type="password" required></input>
                <button type="submit">reset password</button>
            </form>
            </html>
        `);

        console.log('response sended as html')
        } else {
        res.status(400).send(`<html><p>Invalid password reset link</p></html>`);
        }
    } catch (error) {
        console.log('Error in reset password backend', error);
        res.status(500).json({ success: false, message: error });
    } 
    };


exports.resetPassword = async (req, res) => {
    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;

        const forgotpasswordrequest = await ForgetPassword.findOne({ where: { id: resetpasswordid } });

        if (!forgotpasswordrequest) {
            return res.status(404).json({ error: 'No forgot password request found', success: false });
        }

        console.log(forgotpasswordrequest, 'kjkjsjslaklakslaksa')
        
        let user;

        user = await Student.findOne({
            where: {
                id: forgotpasswordrequest.userId,
                email: forgotpasswordrequest.email
            }
            });

        if(!user) {
        user = await Admin.findOne({
            where: {
                id: forgotpasswordrequest.userId,
                email: forgotpasswordrequest.email
            }
            });
        } 

        console.log(user, 'mmdmdmad');

        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err){
                console.log(err);
                throw new Error(err);
            }
            bcrypt.hash(newpassword, salt, function(err, hash) {
                if(err){
                    console.log(err);
                    throw new Error(err);
                }
                user.update({ password: hash }).then(() => {
                    forgotpasswordrequest.update({ active: false });
                    res.status(201).json({ success: true, message: 'Successfully updated the new password'})
                })
            });
        });
    }
    catch (error) {
        console.log('Error in reset password backend', error);
        res.status(500).json({ success: false, message: error });
    }
}
