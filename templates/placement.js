
const placementMail = ({ id, name, start_date, end_date }) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <title>New Placement Opportunity</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 30px 0;">
            <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                    <td style="background-color: #004aad; padding: 20px; text-align: center;">
                    <h1 style="color: #ffffff; font-size: 22px; margin: 0;">New Placement Opportunity</h1>
                    </td>
                </tr>

                <!-- Content -->
                <tr>
                    <td style="padding: 30px;">
                    <p style="font-size: 16px; color: #333;">Dear Student,</p>
                    <p style="font-size: 16px; color: #333;">We are excited to inform you about a new placement opportunity listed on our portal.</p>

                    <h2 style="color: #004aad; font-size: 18px; margin-top: 30px;">Placement Details</h2>
                    <table cellpadding="8" cellspacing="0" style="font-size: 16px; color: #333; margin-bottom: 30px;">
                        <tr>
                        <td><strong>Placement Name:</strong></td>
                        <td>${name}</td>
                        </tr>
                        <tr>
                        <td><strong>Start Date:</strong></td>
                        <td>${new Date(start_date).toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
                        </tr>
                        <tr>
                        <td><strong>End Date:</strong></td>
                        <td>${new Date(end_date).toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
                        </tr>
                    </table>

                    <p style="font-size: 16px; color: #333;">Make sure to apply within the registration period. Don't miss this opportunity!</p>

                    <!-- CTA Button -->
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.ORIGIN_ONE}/myplace/${id}" style="display: inline-block; background-color: #004aad; color: #ffffff; padding: 12px 25px; font-size: 16px; border-radius: 5px; text-decoration: none;">
                        View Placement Details
                        </a>
                    </p>

                    <p style="font-size: 14px; color: #666;">For any queries, please contact the futryoAI.</p>

                    <p style="font-size: 16px; color: #333;">Best regards,<br><strong>futryoAI</strong></p>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="background-color: #eeeeee; text-align: center; padding: 15px; font-size: 12px; color: #666;">
                    © 2025 futryoAI. All Rights Reserved.
                    </td>
                </tr>
                </table>
            </td>
            </tr>
        </table>
        </body>
        </html>
    `;
};


export default placementMail;