import Feedback from '../models/feedback.js';
import Student from '../models/student.js';
import User from '../models/user.js';
import TryCatch from '../utils/trycatch.js';


export const createFeedback = TryCatch(async (req, resp, next) => {
    const { message } = req.body;

    let student;
    if (req.user.role === 'user') {
        student = await Student.findOne({ where: { user_id: req.user.id, status: true, is_active: true } });
    };
    await Feedback.create({ message, user_id: req.user.id, student_id: student ? student?.id : null });
    resp.status(201).json({ success: true, message: 'FEEDBACK SENT SUCCESSFULLY!' });
});



//Feedback to User Association
User.hasMany(Feedback, { foreignKey: 'user_id', as: 'feedbacks' });
Feedback.belongsTo(User, { foreignKey: 'user_id', as: 'user' });