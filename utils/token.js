
const sendToken = (user, statusCode, resp) => {
    const auth_token = user.getJWToken();

    resp
        .status(statusCode)
        .json({
            success: true, auth_token,
            message: `HELLO ${user?.name?.toUpperCase()}...`
        });
};


export default sendToken;