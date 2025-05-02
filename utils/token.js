import User from '../models/user.js'

const sendToken = async (user, statusCode, resp) => {
    const auth_token = await user.getJWToken();

    const auth_user = await User.findOne({ where: { id: user?.id, status: true }, attributes: ['id', 'auth_tokens'] });
    if (!auth_user) {
        return next(new ErrorHandler("PLEASE LOGIN FIRST!", 403));
    };

    // ADD TOKEN
    const currentTokens = auth_user?.auth_tokens || [];
    currentTokens?.unshift(auth_token);
    await auth_user.update({ auth_tokens: currentTokens });

    resp
        .status(statusCode)
        .json({
            success: true, auth_token,
            message: `HELLO ${user?.name?.toUpperCase()}...`
        });
};


export default sendToken;