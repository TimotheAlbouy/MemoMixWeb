class MemoMix {
    constructor(personIds, groupSizes, history = null, togetherConstraints = null, apartConstraints = null) {
        if (!history)
            history = [];
        if (!togetherConstraints)
            togetherConstraints = [];
        if (!apartConstraints)
            apartConstraints = [];
        assert(personIds.size <= sum(Array.from(groupSizes.values())), 'The groups cannot contain all the persons.');
        assert(all(Array.from(groupSizes.values()), size => size >= 1), 'At least one group has a negative or null size.');
        for (let entry of history)
            assert(this.checkEntryValidity(entry), 'Invalid entry.');
        this.personIds = personIds;
        this.groupSizes = groupSizes;
        this.history = history;
        assert(this.checkConstraintsValidity(togetherConstraints, apartConstraints), 'Invalid constraints.');
        this.togetherConstraints = togetherConstraints;
        this.apartConstraints = apartConstraints;
    }
    setPersonIds(personIds) {
        assert(personIds.size <= sum(Array.from(this.groupSizes.values())), 'The groups cannot contain all the persons.');
        this.personIds = personIds;
    }
    setGroupSizes(groupSizes) {
        assert(this.personIds.size <= sum(Array.from(groupSizes.values())), 'The groups cannot contain all the persons.');
        assert(all(Array.from(groupSizes.values()), size => size >= 1), 'At least one group has a negative or null size.');
        this.groupSizes = groupSizes;
    }
    setConstraints(togetherConstraints, apartConstraints) {
        assert(this.checkConstraintsValidity(togetherConstraints, apartConstraints), 'Invalid constraints.');
        this.togetherConstraints = togetherConstraints;
        this.apartConstraints = apartConstraints;
    }
    getPersonPersonKey(person1Id, person2Id) {
        return JSON.stringify([person1Id, person2Id].sort());
    }
    getPersonGroupKey(personId, groupId) {
        return JSON.stringify([personId, groupId]);
    }
    getOccurrencesMaps() {
        let pairingCountsMap = new Map();
        let personOccurrencesMap = new Map();
        let groupOccurrencesMap = new Map();
        let personIdsArray = Array.from(this.personIds);
        for (let [idx, person1Id] of personIdsArray.entries()) {
            pairingCountsMap.set(person1Id, 0);
            for (let person2Id of personIdsArray.slice(idx + 1)) {
                if (person1Id != person2Id) {
                    let key = this.getPersonPersonKey(person1Id, person2Id);
                    personOccurrencesMap.set(key, {
                        person1Id: person1Id,
                        person2Id: person2Id,
                        count: 0
                    });
                }
            }
            for (let groupId of this.groupSizes.keys()) {
                let key = this.getPersonGroupKey(person1Id, groupId);
                groupOccurrencesMap.set(key, {
                    personId: person1Id,
                    groupId: groupId,
                    count: 0
                });
            }
        }
        for (let entry of this.history) {
            for (let [groupId, group] of entry.entries()) {
                let groupArray = Array.from(group);
                for (let [idx, person1Id] of groupArray.entries()) {
                    let newPairingCount = pairingCountsMap.get(person1Id) + group.size - 1;
                    pairingCountsMap.set(person1Id, newPairingCount);
                    for (let person2Id of groupArray.slice(idx + 1)) {
                        if (this.personIds.has(person1Id) && this.personIds.has(person2Id)) {
                            let key = this.getPersonPersonKey(person1Id, person2Id);
                            personOccurrencesMap.get(key).count++;
                        }
                    }
                    let key = this.getPersonGroupKey(person1Id, groupId);
                    groupOccurrencesMap.get(key).count++;
                }
            }
        }
        return [pairingCountsMap, personOccurrencesMap, groupOccurrencesMap];
    }
    initializeEntry(personOccurrencesMap, groupOccurrencesMap) {
        let entry = new Map();
        let remainingPersonIds = [...this.personIds];
        for (let groupId of this.groupSizes.keys())
            entry.set(groupId, new Set());
        for (let constraint of this.togetherConstraints) {
            let constraintKeys = Object.keys(constraint);
            let personIds = constraint.personIds;
            let groupId;
            if (constraintKeys.includes('inGroup'))
                groupId = constraint.inGroup;
            else {
                let candidateGroupIds = new Set(this.groupSizes.keys());
                if (constraintKeys.includes('notInGroups')) {
                    let forbiddenGroupIds = constraint.notInGroups;
                    candidateGroupIds = new Set(Array.from(candidateGroupIds).filter((groupId) => !forbiddenGroupIds.has(groupId)));
                }
                let bestGroupIds = this.getBestGroupIdsByGroupOccurrences(personIds, entry, groupOccurrencesMap, candidateGroupIds);
                assert(bestGroupIds.size > 0, 'Invalid constraints.');
                groupId = randomChoice(Array.from(bestGroupIds));
            }
            personIds.forEach(personId => entry.get(groupId).add(personId));
            remainingPersonIds = remainingPersonIds.filter(personId => !personIds.has(personId));
        }
        for (let constraint of this.apartConstraints) {
            let personIds = constraint.personIds;
            let availableGroupIds = new Set(Array.from(entry.keys()).filter(groupId => entry.get(groupId).size < this.groupSizes.get(groupId)));
            let priorityGroupIds = new Set(Array.from(availableGroupIds).filter(groupId => entry.get(groupId).size > 0));
            for (let personId of personIds) {
                let groupId;
                if (priorityGroupIds.size > 0) {
                    groupId = randomChoice(Array.from(priorityGroupIds));
                    priorityGroupIds.delete(groupId);
                }
                else {
                    groupId = this.getGroupId(personId, entry);
                    if (!groupId) {
                        let bestGroupIds = this.getBestGroupIdsByPersonOccurrences(new Set([personId]), entry, personOccurrencesMap, availableGroupIds);
                        assert(bestGroupIds.size > 0, 'Constraints not satisfiable.');
                        groupId = randomChoice(Array.from(bestGroupIds));
                    }
                }
                entry.get(groupId).add(personId);
                let idx = remainingPersonIds.indexOf(personId);
                remainingPersonIds.splice(idx, 1);
                availableGroupIds.delete(groupId);
            }
        }
        return [entry, remainingPersonIds];
    }
    getNewEntry() {
        let [pairingCountsMap, personOccurrencesMap, groupOccurrencesMap] = this.getOccurrencesMaps();
        let [entry, remainingPersonIds] = this.initializeEntry(personOccurrencesMap, groupOccurrencesMap);
        randomShuffle(remainingPersonIds);
        remainingPersonIds.sort((person1Id, person2Id) => pairingCountsMap.get(person1Id) - pairingCountsMap.get(person2Id));
        let personOccurrences = Array.from(personOccurrencesMap.values());
        randomShuffle(personOccurrences);
        personOccurrences.sort((occurrence1, occurrence2) => {
            if (occurrence1.count < occurrence2.count)
                return -1;
            if (occurrence1.count > occurrence2.count)
                return 1;
            let min1 = Math.min(pairingCountsMap.get(occurrence1.person1Id), pairingCountsMap.get(occurrence1.person2Id));
            let min2 = Math.min(pairingCountsMap.get(occurrence2.person1Id), pairingCountsMap.get(occurrence2.person2Id));
            return min1 - min2;
        });
        let emptyGroup2Id = this.getEmptyGroup2Id(entry);
        while (remainingPersonIds.length >= 2 && emptyGroup2Id != null) {
            let personOccurrence = personOccurrences.shift();
            let { person1Id, person2Id } = personOccurrence;
            let idx1 = remainingPersonIds.indexOf(person1Id);
            let idx2 = remainingPersonIds.indexOf(person2Id);
            if (idx1 != -1 && idx2 != -1) {
                entry.get(emptyGroup2Id).add(person1Id);
                entry.get(emptyGroup2Id).add(person2Id);
                if (idx1 < idx2) {
                    remainingPersonIds.splice(idx2, 1);
                    remainingPersonIds.splice(idx1, 1);
                }
                else {
                    remainingPersonIds.splice(idx1, 1);
                    remainingPersonIds.splice(idx2, 1);
                }
                emptyGroup2Id = this.getEmptyGroup2Id(entry);
            }
        }
        while (this.containsNonFullNonEmptyGroup(entry) && remainingPersonIds.length > 0) {
            let personId = remainingPersonIds.shift();
            let bestGroupIds = this.getBestGroupIdsByPersonOccurrences(new Set([personId]), entry, personOccurrencesMap);
            if (bestGroupIds.size > 1) {
                bestGroupIds = this.getBestGroupIdsByGroupOccurrences(new Set([personId]), entry, groupOccurrencesMap, bestGroupIds);
            }
            let groupId = randomChoice(Array.from(bestGroupIds));
            entry.get(groupId).add(personId);
        }
        while (remainingPersonIds.length > 0) {
            let personId = remainingPersonIds.shift();
            let bestGroupIds = this.getBestGroupIdsByGroupOccurrences(new Set([personId]), entry, groupOccurrencesMap);
            let groupId = randomChoice(Array.from(bestGroupIds));
            entry.get(groupId).add(personId);
        }
        return entry;
    }
    getEmptyGroup2Id(entry) {
        let sortedGroups = randomShuffle(Array.from(this.groupSizes.keys())).sort((group1Id, group2Id) => this.groupSizes.get(group2Id) - this.groupSizes.get(group1Id));
        for (let groupId of sortedGroups)
            if (entry.get(groupId).size == 0 && this.groupSizes.get(groupId) >= 2)
                return groupId;
        return null;
    }
    containsNonFullNonEmptyGroup(entry) {
        for (let [groupId, group] of entry.entries())
            if (group.size > 0 && group.size < this.groupSizes.get(groupId))
                return true;
        return false;
    }
    getGroupId(personId, entry) {
        for (let [groupId, group] of entry.entries())
            if (group.has(personId))
                return groupId;
        return null;
    }
    getBestGroupIdsByPersonOccurrences(personIds, entry, personOccurrencesDict, candidateGroupIds = null) {
        let allGroupIds = new Set(this.groupSizes.keys());
        if (!candidateGroupIds || Array.from(candidateGroupIds).some(groupId => !allGroupIds.has(groupId)))
            candidateGroupIds = allGroupIds;
        candidateGroupIds = new Set(Array.from(candidateGroupIds).filter((groupId) => entry.get(groupId).size > 0 && entry.get(groupId).size + personIds.size <= this.groupSizes.get(groupId)));
        if (candidateGroupIds.size == 0)
            return null;
        let personOccurrencesForSubgroup = new Map();
        for (let groupId of candidateGroupIds) {
            personOccurrencesForSubgroup.set(groupId, []);
            for (let person1Id of personIds) {
                for (let person2Id of entry.get(groupId)) {
                    let key = this.getPersonPersonKey(person1Id, person2Id);
                    let personOccurrence = personOccurrencesDict.get(key).count;
                    personOccurrencesForSubgroup.get(groupId).push(personOccurrence);
                }
            }
        }
        let minPersonOccurrencesAverage = min(Array.from(candidateGroupIds).map((groupId) => sum(personOccurrencesForSubgroup.get(groupId)) /
            personOccurrencesForSubgroup.get(groupId).length));
        candidateGroupIds = new Set(Array.from(candidateGroupIds).filter(groupId => sum(personOccurrencesForSubgroup.get(groupId)) /
            personOccurrencesForSubgroup.get(groupId).length
            == minPersonOccurrencesAverage));
        return candidateGroupIds;
    }
    getBestGroupIdsByGroupOccurrences(personIds, entry, groupOccurrencesMap, candidateGroupIds = null) {
        let allGroupIds = new Set(this.groupSizes.keys());
        if (!candidateGroupIds || Array.from(candidateGroupIds).some(groupId => !allGroupIds.has(groupId)))
            candidateGroupIds = allGroupIds;
        candidateGroupIds = new Set(Array.from(candidateGroupIds).filter((groupId) => entry.get(groupId).size + personIds.size <= this.groupSizes.get(groupId)));
        if (candidateGroupIds.size == 0)
            return null;
        let groupOccurrencesForSubgroup = new Map();
        for (let groupId of candidateGroupIds) {
            groupOccurrencesForSubgroup.set(groupId, []);
            for (let personId of personIds) {
                let key = this.getPersonGroupKey(personId, groupId);
                groupOccurrencesForSubgroup.get(groupId).push(groupOccurrencesMap.get(key).count);
            }
        }
        let minGroupOccurrencesAverage = min(Array.from(candidateGroupIds).map((groupId) => sum(groupOccurrencesForSubgroup.get(groupId)) / groupOccurrencesForSubgroup.get(groupId).length));
        candidateGroupIds = new Set(Array.from(candidateGroupIds).filter((groupId) => sum(groupOccurrencesForSubgroup.get(groupId)) / groupOccurrencesForSubgroup.get(groupId).length
            == minGroupOccurrencesAverage));
        let maxGroupSize = max(Array.from(candidateGroupIds).map((groupId) => this.groupSizes.get(groupId)));
        candidateGroupIds = new Set(Array.from(candidateGroupIds).filter((groupId) => this.groupSizes.get(groupId) == maxGroupSize));
        return candidateGroupIds;
    }
    checkEntryValidity(entry) {
        let personIds = new Set();
        for (let group of entry.values()) {
            for (let personId of group) {
                if (personIds.has(personId))
                    return false;
                personIds.add(personId);
            }
        }
        return true;
    }
    checkConstraintsValidity(togetherConstraints, apartConstraints) {
        if (togetherConstraints.length > 0) {
            let groupIds = new Set(this.groupSizes.keys());
            for (let constraint of togetherConstraints) {
                let constraintKeys = Object.keys(constraint);
                let personIds = constraint.personIds;
                for (let personId of personIds)
                    if (!this.personIds.has(personId))
                        return false;
                if (constraintKeys.includes('inGroup') && !groupIds.has(constraint.inGroup))
                    return false;
                if (constraintKeys.includes('notInGroups')) {
                    let forbiddenGroupIds = constraint.notInGroups;
                    if (Array.from(groupIds).every(groupId => forbiddenGroupIds.has(groupId)))
                        return false;
                }
            }
        }
        if (apartConstraints.length > 0) {
            for (let constraint of apartConstraints) {
                let personIds = constraint.personIds;
                for (let personId of personIds)
                    if (!this.personIds.has(personId))
                        return false;
            }
        }
        return true;
    }
    saveEntry(entry) {
        assert(this.checkEntryValidity(entry), 'Invalid entry.');
        this.history.push(entry);
    }
}
function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function randomShuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
function sum(arr) {
    return Array.from(arr).reduce((a, b) => a + b, 0);
}
function min(arr) {
    return Math.min(...arr);
}
function max(arr) {
    return Math.max(...arr);
}
function all(arr, fn) {
    return arr.every(fn);
}
function assert(condition, message) {
    if (!condition)
        throw new Error('Assertion error: ' + message);
}
export default MemoMix;
//# sourceMappingURL=memomix.js.map