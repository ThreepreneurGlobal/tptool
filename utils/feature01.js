
exports.excelToJSDate = (serial) => {
    const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
    const dateOffset = date.getTimezoneOffset() * 60 * 1000;
    return new Date(date.getTime() + dateOffset);
};