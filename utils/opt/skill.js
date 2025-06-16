import { Sequelize } from "sequelize";
import Skill from "../../models/skill.js";



export const getSkillsOpts = async () => {
    // const apiObj = {};
    // const api = await Skill.findAll({
    //     where: { status: true }, attributes: ['id', 'title', 'category']
    // });

    // api?.forEach((item) => {
    //     if (!apiObj[item?.category]) {
    //         apiObj[item?.category] = { label: item?.category?.toUpperCase(), options: [] };
    //     };
    //     apiObj[item?.category]?.options?.push({ label: item?.title?.toUpperCase(), value: item?.id });
    // });

    // return Object.values(apiObj);
};


export const getSkillCategoriesOpts = async () => {
    // const data = await Skill.findAll({
    //     attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('category')), 'category']], raw: true,
    // });

    // const categories = data?.filter(item => item?.category !== null && item?.category !== '')
    //     .map(item => ({
    //         label: item?.category?.toUpperCase(),
    //         value: item?.category
    //     }));

    // return categories;
};


export const getSkillSubCategoriesOpts = async () => {
    // const data = await Skill.findAll({
    //     attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('sub_category')), 'sub_category']], raw: true,
    // });

    // const sub_categories = data?.filter(item => item?.sub_category !== null && item?.sub_category !== '')
    //     .map(item => ({
    //         label: item?.sub_category?.toUpperCase(),
    //         value: item?.sub_category
    //     }));

    // return sub_categories;
};


export const getSkillGrpSubCategoriesOpts = async () => {
    // const apiObj = {};
    // const api = await Skill.findAll({
    //     where: { status: true }, attributes: ['category', 'sub_category'], group: ['category', 'sub_category'], 
    // });

    // api?.forEach((item) => {
    //     if (!apiObj[item?.category]) {
    //         apiObj[item?.category] = { label: item?.category?.toUpperCase(), options: [] };
    //     };
    //     apiObj[item?.category]?.options?.push({ label: item?.sub_category?.toUpperCase(), value: item?.sub_category });
    // });

    // return Object.values(apiObj);
};