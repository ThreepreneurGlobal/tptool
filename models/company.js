// import { DataTypes } from 'sequelize';

// import Connect from './index.js';


// const Company = Connect.define('companies', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         unique: true,
//         primaryKey: true
//     },
//     title: {
//         type: DataTypes.STRING,
//     },
//     description: {
//         type: DataTypes.TEXT,
//     },
//     reg_no: {
//         type: DataTypes.STRING,
//     },
//     phone: {
//         type: DataTypes.STRING,
//     },
//     phone_alt: {
//         type: DataTypes.STRING,
//     },
//     email: {
//         type: DataTypes.STRING,
//     },
//     email_alt: {
//         type: DataTypes.STRING,
//     },
//     logo: {
//         type: DataTypes.TEXT,
//     },
//     type: {
//         type: DataTypes.STRING,
//     },
//     team_size: {
//         type: DataTypes.INTEGER,
//     },
//     work_domains: {
//         type: DataTypes.TEXT,
//         get: function () {
//             return JSON.parse(this.getDataValue("work_domains"));
//         },
//         set: function (value) {
//             return this.setDataValue("work_domains", JSON.stringify(value));
//         }
//     },
//     work_types: {
//         type: DataTypes.TEXT,
//         get: function () {
//             return JSON.parse(this.getDataValue("work_types"));
//         },
//         set: function (value) {
//             return this.setDataValue("work_types", JSON.stringify(value));
//         }
//     },
//     web: {
//         type: DataTypes.TEXT
//     },
//     facebook: {
//         type: DataTypes.TEXT
//     },
//     linkedin: {
//         type: DataTypes.TEXT
//     },
//     youtube: {
//         type: DataTypes.TEXT
//     },
//     instagram: {
//         type: DataTypes.TEXT
//     },
//     status: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: true,
//     }
// }, {
//     timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at'
// });


// export default Company;