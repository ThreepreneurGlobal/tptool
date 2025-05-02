
const SecondFeedback = (sequelize, DataTypes) => {
    return sequelize.define('feedbacks', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true,
        },
        message: {
            type: DataTypes.TEXT,
        },
        user_id: {
            type: DataTypes.INTEGER,
        },
        student_id: {
            type: DataTypes.INTEGER,
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at'
    });
};


export default SecondFeedback;
