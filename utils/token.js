
const sendToken = (user, statusCode, resp) => {
    const auth_token = user.getJWToken();

    resp
        .status(statusCode)
        .json({
            success: true, auth_token,
            message: `Hello ${user?.name}...`
        });
};


export default sendToken;