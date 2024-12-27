
export const toLowerCaseFields = (obj) => {
    console.log(obj);
    const lowerCaseObj = {};
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            lowerCaseObj[key] = obj[key].toLowerCase();
        } else {
            lowerCaseObj[key] = obj[key];
        };
    };

    return lowerCaseObj;
};