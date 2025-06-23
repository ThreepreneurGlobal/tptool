
const studentAccount = ({ name, email, password, link }) => {
  return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>futryoAI Account is Ready</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 30px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background-color: #004aad; padding: 20px; text-align: center; color: #ffffff;">
                      <h1 style="margin: 0; font-size: 24px;">Your futryoAI Account is Ready</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px;">
                      <p style="font-size: 16px; color: #333;">Dear <strong>${name}</strong>,</p >

                      <p style="font-size: 16px; color: #333;">
                        We’re pleased to inform you that your futryoAI portal account has been successfully created.
                        You can now log in and access all placement-related features.
                      </p>

                      <h3 style="font-size: 18px; color: #004aad; margin-top: 30px;">Your Login Details</h3>
                      <table cellpadding="10" cellspacing="0" style="margin: 10px 0 30px 0; font-size: 16px; color: #333;">
                        <tr>
                          <td><strong>Email:</strong></td>
                          <td>${email}</td>
                        </tr>
                        <tr>
                          <td><strong>Password:</strong></td>
                          <td>${password}</td>
                        </tr>
                      </table>

                      // <p style="font-size: 16px; color: #333;">
                      //   Please log in and change your password after first login for security reasons.
                      // </p>

                      <p style="text-align: center; margin: 30px 0;">
                        <a href="${link}" style="display: inline-block; background-color: #004aad; color: #ffffff; padding: 12px 25px; font-size: 16px; border-radius: 5px; text-decoration: none;">Login to Portal</a>
                      </p>

                      <p style="font-size: 14px; color: #555;">If you face any issues, feel free to contact the T&P Cell.</p>

                      <p style="font-size: 16px; color: #333;">Best regards,<br><strong>futryoAI</strong></p>
                    </td >
                  </tr >
            <tr>
                <td style="background-color: #eeeeee; text-align: center; padding: 15px; font-size: 12px; color: #666;">
                    © 2025 futryoAI. All rights reserved.
                </td>
            </tr>
                </table >
              </td >
            </tr >
          </table >
        </body >
        </html >
    `;
};


export default studentAccount;
