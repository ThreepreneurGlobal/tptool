import College from '../../models/college.js';
import User from '../../models/user.js';
import TryCatch from '../../utils/trycatch.js';
import { interCollege } from './inter_college.js';
import dashPlacement from './placement.js';


const superDashboard = TryCatch(async (req, resp, next) => {
    const { time_period } = req.query;
    const collegesLengthPromise = College.count({ where: { status: true }, });
    const adminsLengthPromise = User.count({ where: { status: true, role: 'admin', } });

    const [colleges_len, admins_len,] = await Promise.all([
        collegesLengthPromise, adminsLengthPromise,
    ]);

    const { feedback_count } = await interCollege();
    const { placements_len, latest_placements, placement_chart, max_place_colleges, } = await dashPlacement({ time_period });

    const stats = {
        card: { college: colleges_len, admin: admins_len, placement: placements_len },
        latest_placements, placement_chart, max_place_colleges, feedback_count,
    };
    resp.status(200).json({ success: true, stats });
});



export default superDashboard;
