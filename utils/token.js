import User from '../models/user.js'
import jwt from 'jsonwebtoken';

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

    // CLEAR EXPIRED TOKENS
    await cleanExpTokens(user?.id);

    resp
        .status(statusCode)
        .json({
            success: true, auth_token, role: user?.role,
            message: `HELLO ${user?.name?.toUpperCase()}...`
        });
};


export const cleanExpTokens = async (user_id) => {
    const user = await User.findByPk(user_id, { attributes: ['id', 'email', 'auth_tokens'] });
    const tokens = user?.auth_tokens || [];
    const validTokens = [];

    for (const token of tokens) {
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            validTokens.push(token);
        } catch (error) {
            if (error?.name === 'TokenExpiredError') {
                console.error('TOKEN EXPIRED!');
            };
        }
    };

    if (tokens?.length !== validTokens?.length) {
        user.auth_tokens = validTokens;
        await user.save();
    };
};


export default sendToken;