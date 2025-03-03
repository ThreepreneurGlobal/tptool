import moment from 'moment';

const excelToJSDate = (serial) => {
    const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
    const dateOffset = date.getTimezoneOffset() * 60 * 1000;
    return new Date(date.getTime() + dateOffset);
};

const formattedDate = (date) => {
    let parseDate;
    let formatDate;

    if (date) {
        if (typeof date === "number") {
            parseDate = excelToJSDate(date);
        } else {
            parseDate = moment(date, ["MM-DD-YYYY", "DD-MM-YYYY", "YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY", "YYYY/MM/DD"]);
        };
        if (moment(parseDate).isValid()) {
            formatDate = moment(parseDate).format('YYYY-MM-DD');
        } else {
            console.error(`${date} Birth Date Invalid!`);
        };
    };

    return formatDate;
};


const excelToDate = (date, errorMsgs, Name) => {
    let newDate;
    if (date) {
        let parseDate;
        if (typeof date === "number") {
            parseDate = excelToJSDate(date);
        } else {
            parseDate = moment(date, ["MM-DD-YYYY", "DD-MM-YYYY", "YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY", "YYYY/MM/DD"]);
        };
        if (moment(parseDate).isValid()) {
            newDate = moment(parseDate).format('YYYY-MM-DD');
        } else {
            errorMsgs.push(`${date} THIS DATE IS INVALID FOR ${Name}`);
            return;
        };
    };

    return newDate;
};


export { formattedDate, excelToDate };