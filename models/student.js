const { DataTypes } = require("sequelize");
const Connect = require("../utils/connect");


const Student = Connect.define("students", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    dob: {
        type: DataTypes.DATEONLY
    },
    course: {
        type: DataTypes.STRING
    },
    course_desc: {
        type: DataTypes.TEXT
    },
    batch: {
        type: DataTypes.NUMBER
    },
    branch: {
        type: DataTypes.STRING
    },
    current_yr: { type: DataTypes.NUMBER },
    enroll: {
        type: DataTypes.STRING
    },
    ten_per: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    twelve_per: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    diploma: {
        type: DataTypes.STRING
    },
    diploma_per: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    sem_01: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    sem_02: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    sem_03: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    sem_04: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    sem_05: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    sem_06: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    sem_07: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    sem_08: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    ed_gap: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    disablity: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    langs: {
        type: DataTypes.STRING, // Define a string field for skills
        get() {
            const rawValue = this.getDataValue('langs');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('langs', JSON.stringify(value));
        }
    },
    skills: {
        // type: DataTypes.ARRAY(DataTypes.STRING),
        // defaultValue:[]
        type: DataTypes.INTEGER, // Define a string field for skills
        get() {
            const rawValue = this.getDataValue('skills');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('skills', JSON.stringify(value));
        }
    },
    projects:{
        type: DataTypes.INTEGER,
        get(){
            const rawValue = this.getDataValue("projects");
            return rawValue ? JSON.parse(rawValue):[];
        },
        set(value){
            this.setDataValue("projects", JSON.stringify(value));
        }
    },
    experience: { type: DataTypes.FLOAT },
    userId: {
        type: DataTypes.INTEGER,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true, createdAt: "created_at", updatedAt: "updated_at"
});

module.exports = Student;