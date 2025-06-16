


export const modifiedPlacements = (rawPlacements = [], userSkillIds = []) => {
    const placements = rawPlacements?.map(placement => {
        const placementData = placement.toJSON ? placement.toJSON() : placement;
        const filteredPositions = placement?.positions?.filter(position =>
            position?.skills?.some(skill => userSkillIds?.includes(skill?.id)));
        if (!filteredPositions || filteredPositions?.length <= 0) {
            return null;
        };

        return { ...placementData, positions: filteredPositions, };
    }).filter(placement => placement !== null);

    return placements;
};


