
const sendToken = (user, statusCode, resp) => {
    const token = user.getJWToken();

    resp.cookie('token', token, {
        httpOnly: true, sameSite: 'Lax', secure: true, path: '/', maxAge: process.env.COOKIE_EXP * 24 * 60 * 60 * 1000,
    })
        .status(statusCode).json({ success: true, role: user.role, token, message: `Welcome ${user?.name?.toUpperCase()}...` });
    // .json({ success: true, role: user.role, token });
};

module.exports = sendToken;
