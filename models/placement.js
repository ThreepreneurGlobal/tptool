const { DataTypes } = require("sequelize");
const Connect = require("../utils/connect");


const Placement = Connect.define("placements", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING
    },
    exp_opening: {
        type: DataTypes.INTEGER
    },
    place_status: {
        type: DataTypes.STRING
    },
    status_details: {
        type: DataTypes.TEXT
    },
    selection_details: {
        type: DataTypes.TEXT
    },
    criteria: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        // Check % for Placement Criteria
    },
    other_details: {
        type: DataTypes.TEXT
    },
    contact_per: {
        type: DataTypes.STRING,
    },
    company_contact: {
        type: DataTypes.STRING,
    },
    reg_stime: {
        type: DataTypes.TIME,
        defaultValue: DataTypes.NOW
    },
    reg_sdate: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    reg_etime: {
        type: DataTypes.TIME
    },
    reg_edate: {
        type: DataTypes.DATEONLY
    },
    rereg_etime: {
        type: DataTypes.TIME
    },
    rereg_edate: {
        type: DataTypes.DATEONLY
    },
    reg_details: {
        type: DataTypes.TEXT
    },
    ctc: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    stipend: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    attach_tpo: {
        type: DataTypes.TEXT
    },
    attach_student: {
        type: DataTypes.TEXT
    },
    add_comment: {
        type: DataTypes.TEXT
    },
    history: {
        type: DataTypes.TEXT
    },
    companyId: {
        type: DataTypes.INTEGER
    },
    collageId: {
        type: DataTypes.INTEGER
    },
    userId: {
        type: DataTypes.INTEGER
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: true, createdAt: "created_at", updatedAt: "updated_at" });

module.exports = Placement;