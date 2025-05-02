
const SecondApplication = (sequelize, DataTypes) => {
    return sequelize.define('applications', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        placement_id: {
            type: DataTypes.INTEGER,
        },
        position_id: {
            type: DataTypes.INTEGER,
        },
        user_id: {
            type: DataTypes.INTEGER,
        },
        company_id: {
            type: DataTypes.INTEGER,
        },
        app_status_detail: {
            type: DataTypes.TEXT,
        },
        shortlist_date: {
            type: DataTypes.DATE,
        },
        assessment_date: {
            type: DataTypes.DATE,
        },
        interview_date: {
            type: DataTypes.DATE,
        },
        offer_date: {
            type: DataTypes.DATE,
        },
        reject_date: {
            type: DataTypes.DATE,
        },
        joined_date: {
            type: DataTypes.DATE,
        },
        withdrawn_date: {
            type: DataTypes.DATE,
        },
        app_status: {
            type: DataTypes.ENUM(
                'applied', 'processing', 'shortlisted', 'assessment', 'interview scheduled', 'interview completed',
                'offer released', 'offer accepted', 'onboarding', 'joined', 'rejected', 'on hold', 'withdrawn'
            ),
            defaultValue: 'processing',
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        }
    }, {
        timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at',
    });
};



export default SecondApplication;