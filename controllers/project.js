const { rm } = require("fs");
const Student = require("../models/student");
const Project = require("../models/project");
const TryCatch = require("../middleware/TryCatch");


// Project.sync({ alter: true, force: true });

exports.createProject = TryCatch(async (req, resp, next) => {
    const { title, description, start, end, project_status, demo_url } = req.body;
    const logo = req.files['logo'][0]?.path;
    const demo_img = req.files['demo_img'][0]?.path;

    const project = await Project.create({ title, description, start, end, project_status, demo_url, studId: req.user.id, logo, demo_img });
    if (logo) return project.logo = logo;
    if (demo_img) return project.demo_img = demo_img;
    await project.save();
    
    resp.status(201).json({ success: true, message: 'PROJECT CREATED SUCCESSFULLY...' });
});


exports.updateProject = TryCatch(async (req, resp, next) => {
    const { description, start, end, project_status, demo_url } = req.body;
    const logo = req.files['logo'][0]?.path;
    const demo_img = req.files['demo_img'][0]?.path;

    let project = await Project.findByPk(req.params.id);

    if (logo && project.logo) {
        rm(project.logo, () => { console.log('OLD FILE REMOVED SUCCESSFULLY...'); });
    };
    if (demo_img && project.demo_img) {
        rm(project.demo_img, () => { console.log('OLD FILE REMOVED SUCCESSFULLY...'); });
    };

    project.update({
        description, start, end, project_status, demo_url,
        demo_img: demo_img ? demo_img : project.demo_img, logo: logo ? logo : project.logo
    });

    resp.status(201).json({ success: true, message: 'PROJECT UPDATED SUCCESSFULLY...' });
});


exports.deleteProject = TryCatch(async (req, resp, next) => { });


// Association with Student and Projects
Project.belongsTo(Student, { foreignKey: "studId", as: "student" });
Student.hasMany(Project, { foreignKey: "studId", as: "projects" });