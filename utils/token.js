import User from '../models/user.js'

const sendToken = async (user, statusCode, resp) => {
    const auth_token = await user.getJWToken();

    const auth_user = await User.findOne({ where: { id: user?.id, status: true } });
    await auth_user.update({ auth_token });

    resp
        .status(statusCode)
        .json({
            success: true, auth_token,
            message: `HELLO ${user?.name?.toUpperCase()}...`
        });
};


export default sendToken;