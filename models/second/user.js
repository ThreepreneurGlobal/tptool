
const SecondUser = (sequelize, DataTypes) => {
    return sequelize.define("users", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        mobile: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            }
        },
        password: {
            type: DataTypes.STRING,
        },
        avatar: {
            type: DataTypes.TEXT
        },
        gender: {
            type: DataTypes.STRING
        },
        address: { type: DataTypes.TEXT },
        city: { type: DataTypes.STRING },
        pin_code: {
            type: DataTypes.STRING,
        },
        designation: {
            type: DataTypes.STRING,
            defaultValue: "student"
        },
        id_prf: {
            type: DataTypes.STRING
        },
        facebook: { type: DataTypes.TEXT },
        twitter: { type: DataTypes.TEXT },
        instagram: { type: DataTypes.TEXT },
        linkedin: { type: DataTypes.TEXT },
        whatsapp: { type: DataTypes.TEXT },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        role: {
            type: DataTypes.ENUM('admin', 'super', 'user'),
            defaultValue: "user"
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
    }, { timestamps: true, createdAt: "created_at", updatedAt: "updated_at" });
};


export default SecondUser;
