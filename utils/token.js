
const sendToken = (user, statusCode, resp) => {
    const token = user.getJWToken();

    resp.cookie('token', token, {
        expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000), 
        httpOnly: true, sameSite: 'none', secure: true, path: '/',
    })
        .status(statusCode).json({ success: true, role: user.role, message: `Welcome ${user?.name?.toUpperCase()}...` });
};

module.exports = sendToken;