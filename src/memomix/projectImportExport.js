function importPersonIds(personIdsArray) {
    return new Set(personIdsArray);
}
function importGroupSizes(groupSizesObject) {
    let groupSizes = new Map();
    for (let groupId in groupSizesObject)
        groupSizes.set(groupId, groupSizesObject[groupId]);
    return groupSizes;
}
function importHistory(historyArray) {
    let history = [];
    for (let entryObject of historyArray)
        history.push(importEntry(entryObject));
    return history;
}
function importEntry(entryObject) {
    let entry = new Map();
    for (let groupId in entryObject)
        entry.set(groupId, new Set(entryObject[groupId]));
    return entry;
}
function importConstraints(constraintsArray) {
    let constraints = [];
    for (let constraintObject of constraintsArray) {
        let constraint = {
            personIds: new Set(constraintObject.personIds)
        };
        if (constraintObject.hasOwnProperty('inGroup'))
            constraint.inGroup = constraintObject.inGroup;
        if (constraintObject.hasOwnProperty('notInGroups'))
            constraint.notInGroups = new Set(constraintObject.notInGroups);
        constraints.push(constraint);
    }
    return constraints;
}
function exportPersonIds(personIds) {
    return Array.from(personIds);
}
function exportGroupSizes(groupSizes) {
    let groupSizesObject = {};
    for (let [groupId, size] of groupSizes)
        groupSizesObject[groupId] = size;
    return groupSizesObject;
}
function exportHistory(history) {
    let historyArray = [];
    for (let entry of history)
        historyArray.push(exportEntry(entry));
    return historyArray;
}
function exportEntry(entry) {
    let entryObject = {};
    for (let [groupId, group] of entry)
        entryObject[groupId] = Array.from(group);
    return entryObject;
}
function exportConstraints(constraintsArray) {
    let constraints = [];
    for (let constraintObject of constraintsArray) {
        let constraint = {
            personIds: new Set(constraintObject.personIds)
        };
        if (constraintObject.hasOwnProperty('inGroup'))
            constraint.inGroup = constraintObject.inGroup;
        if (constraintObject.hasOwnProperty('notInGroups'))
            constraint.notInGroups = new Set(constraintObject.notInGroups);
        constraints.push(constraint);
    }
    return constraints;
}
//# sourceMappingURL=projectImportExport.js.map