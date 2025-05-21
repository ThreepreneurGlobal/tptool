import { Op } from 'sequelize';

import Application from '../../../models/application.js';
import Certificate from '../../../models/certificate.js';
// import Company from '../../../models/company.js';
import PlacePosition from '../../../models/place_position.js';
import Placement from '../../../models/placement.js';
import PositionSkill from '../../../models/position_skill.js';
import Project from '../../../models/project.js';
// import Skill from '../../../models/skill.js';
import Student from '../../../models/student.js';
import User from '../../../models/user.js';
import UserSkill from '../../../models/user_skill.js';
import TryCatch from '../../../utils/trycatch.js';
import { modifiedPlacements } from './placement.js';
import { calculatePercentageChange } from './utils.js';


const userDash = TryCatch(async (req, resp, next) => {

    const today = new Date();
    const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(startOfCurrentMonth - 1);

    // FIND ME
    const user = await User.findOne({
        where: { id: req.user.id, status: true }, attributes: ['id', 'name', 'email'],
        include: [
            {
                model: Student, foreignKey: 'user_id', as: 'student', where: { status: true },
                // include: [{
                //     model: Skill, as: 'skills', required: false, attributes: ['id', 'title'],
                //     through: { model: UserSkill, attributes: ['id', 'rating'] }
                // }]
            },
        ]
    });

    const user_skill_data = await UserSkill.findAll({ where: { student_id: user?.student?.id, status: true }, attributes: ['id', 'rating', 'skill_id'] });
    const userSkillIds = await user_skill_data.map(item => item?.skill_id);

    // const userSkillIds = user?.student?.skills?.map(item => item?.id);

    // FIND MY ALL PLACEMENTS PROMISE
    let rawPlacements = await Placement.findAll({
        where: { status: true, },
        attributes: ['id', 'title', 'type', 'place_status', 'reg_start_date', 'reg_end_date', 'rereg_end_date', 'company_id'], order: [['created_at', 'DESC']],
        include: [
            {
                model: PlacePosition, foreignKey: 'placement_id', as: 'positions', attributes: ['id', 'title', 'opening'],
                // include: [{
                //     model: Skill, as: 'skills', where: { id: { [Op.in]: userSkillIds }, status: true }, required: true,
                //     through: { model: PositionSkill, attributes: [] }, attributes: ['id', 'title'],
                // }]
            },
            // { model: Company, foreignKey: 'company_id', as: 'company', attributes: ['id', 'title', 'web'] }
        ]
    });

    rawPlacements = await Promise.all(rawPlacements?.map(async (placement) => {
        const positionsWithSkills = await Promise.all(placement?.positions?.map(async (position) => {
            const position_skills = await PositionSkill.findAll({ where: { position_id: position?.id }, attributes: ['id', 'skill_id'] });
            const skills = await Promise.all(position_skills?.map(async (item) => {
                const skill_promise = await fetch(process.env.SUPER_SERVER + '/v1/master/skill/get/' + item?.skill_id);
                const { skill } = await skill_promise.json();
                return { id: skill?.id, title: skill?.title, category: skill?.category };
            }));

            const filterdSkills = skills.filter(skill => skill !== null);

            return { ...position.toJSON(), skills: filterdSkills };
        }));
        
        const promise = await fetch(process.env.SUPER_SERVER + '/v1/master/company/get/' + placement?.company_id);
        const { company: { id, title, web } } = await promise.json();
        
        return { ...placement.toJSON(), positions: positionsWithSkills, company: { id, title, web } };
    }));

    // Filter placements to remove positions that have no matching skills
    const placements = modifiedPlacements(rawPlacements, userSkillIds);
    const placementIds = placements?.map(item => item?.id);

    // ALL PROMISE
    const myAppsPromise = Application.findAll({ where: { user_id: req.user.id, status: true } });
    const myOfferPromise = Application.findAll({ where: { user_id: req.user.id, status: true, app_status: 'offer released' } });
    const currentPlacementsPromise = Placement.count({ where: { id: placementIds, status: true, created_at: { [Op.gte]: startOfCurrentMonth } } });
    const currentApplicationsPromise = Application.count({ where: { user_id: req.user.id, status: true, created_at: { [Op.gte]: startOfCurrentMonth } } });
    const currentAppOffersPromise = Application.count({ where: { user_id: req.user.id, app_status: 'offer released', status: true, created_at: { [Op.gte]: startOfCurrentMonth } } });
    const previousPlacementsPromise = Placement.count({ where: { id: placementIds, status: true, created_at: { [Op.between]: [startOfPreviousMonth, endOfPreviousMonth] } } });
    const previousApplicationsPromise = Application.count({ where: { user_id: req.user.id, status: true, created_at: { [Op.between]: [startOfPreviousMonth, endOfPreviousMonth] } } });
    const previousAppOffersPromise = Application.count({ where: { user_id: req.user.id, app_status: 'offer released', status: true, created_at: { [Op.between]: [startOfPreviousMonth, endOfPreviousMonth] } } });
    const certificateCountPromise = Certificate.count({ where: { user_id: req.user.id, status: true } });
    const projectCountPromise = Project.count({ where: { user_id: req.user.id, status: true } });

    // CALL ALL PROMISES
    const [
        applications, offers, currentPlacements, currentApplications, currentAppOffers, previousPlacements,
        previousApplications, previousAppOffers, certificateCount, projectCount,
    ] = await Promise.all([
        myAppsPromise, myOfferPromise, currentPlacementsPromise, currentApplicationsPromise, currentAppOffersPromise,
        previousPlacementsPromise, previousApplicationsPromise, previousAppOffersPromise, certificateCountPromise,
        projectCountPromise,
    ]);

    const placementBadge = calculatePercentageChange(currentPlacements, previousPlacements);
    const applicationBadge = calculatePercentageChange(currentApplications, previousApplications);
    const appOfferBadge = calculatePercentageChange(currentAppOffers, previousAppOffers);


    const stats = {
        widget_reports: {
            placement: { length: placements?.length, badge: placementBadge, },
            application: { length: applications?.length, badge: applicationBadge, },
            offer: { length: offers.length, badge: appOfferBadge, },
        },
        user_card: { project: projectCount, skill: userSkillIds.length, certificate: certificateCount },
    };
    resp.status(200).json({ success: true, stats });
});

export default userDash;