


export const modifiedPlacements = (rawPlacements = [], userSkillIds = []) => {
    const placements = rawPlacements?.map(placement => {
        const filteredPositions = placement?.positions?.filter(position =>
            position?.skills?.some(skill => userSkillIds?.includes(skill?.id)));
        if (filteredPositions?.length > 0) {
            return { ...placement.toJSON(), positions: filteredPositions, };
        };
        return null;
    }).filter(placement => placement !== null);

    return placements;
};


