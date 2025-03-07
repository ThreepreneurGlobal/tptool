

export const calculatePercentageChange = (current, previous) => {
    if (Number(previous) === 0) return Number(current) > 0 ? 100 : 0;
    return (((Number(current) - Number(previous)) / Number(previous)) * 100).toFixed(2);
};

