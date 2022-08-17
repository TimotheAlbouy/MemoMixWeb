const storageKeyPrefix = 'MemoMix--';

export function getGroupsKey(project) {
  return storageKeyPrefix + project + '--Groups';
}

export function getPersonsKey(project) {
  return storageKeyPrefix + project + '--Persons';
}

export function getConstraintsKey(project) {
  return storageKeyPrefix + project + '--Constraints';
}

export function getHistoryKey(project) {
  return storageKeyPrefix + project + '--History';
}

export function getCurrentProjectKey() {
  return storageKeyPrefix + 'CurrentProject';
}

export function getProjectsKey() {
  return storageKeyPrefix + 'Projects';
}