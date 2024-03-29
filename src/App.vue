<template>
  <div>
    <splitpanes class="default-theme" style="height: 100vh" horizontal>
      <pane class="horizontalPane">
        <splitpanes vertical>
          <pane>
            <group-pane :groups="groups" @group-to-update="updateGroup"
              @group-to-add="addGroup" @group-to-remove="removeGroup"
            />
          </pane>

          <pane>
            <person-pane :persons="persons" @person-to-update="updatePerson"
              @person-to-add="addPerson" @person-to-remove="removePerson"
            />
          </pane>

          <pane>
            <constraint-pane :constraints="constraints" :persons="persons" :groups="groups"
              @constraint-to-update="updateConstraint" @constraint-to-add="addConstraint"
              @constraint-to-remove="removeConstraint"
            />
          </pane>
        </splitpanes>
      </pane>

      <pane class="horizontalPane">
        <splitpanes>
          <pane>
            <history-pane :history="history" @entry-to-remove="removeEntry" />
          </pane>

          <pane>
            <entry-pane :groups="groups" :persons="persons" :constraints="constraints" :history="history"
              @entry-to-save="saveEntry"
            />
          </pane>
        </splitpanes>
      </pane>
    </splitpanes>
  </div>
</template>

<script>
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

import GroupPane from './components/GroupPane.vue';
import PersonPane from './components/PersonPane.vue';
import ConstraintPane from './components/ConstraintPane.vue';
import EntryPane from './components/EntryPane.vue';
import HistoryPane from './components/HistoryPane.vue';
import {
  getGroupsKey, getPersonsKey, getConstraintsKey, getHistoryKey,
  getCurrentProjectKey, getProjectsKey
} from './util/projectImportExport.js';

const defaultProject = 'default';

export default {
  name: 'App',
  components: {
    Splitpanes, Pane,
    GroupPane, PersonPane, ConstraintPane, EntryPane, HistoryPane
  },
  data() {
    return {
      currentProject: null,
      projects: [],
      groups: [],
      persons: [],
      constraints: [],
      history: []
    };
  },
  mounted() {
    this.currentProject = localStorage.getItem(getCurrentProjectKey());
    if (this.currentProject == null) {
      this.currentProject = defaultProject;
      localStorage.setItem(getCurrentProjectKey(), defaultProject);
      localStorage.setItem(getProjectsKey(), JSON.stringify([defaultProject]));
      this.saveGroups();
      this.savePersons();
      this.saveConstraints();
      this.saveHistory();
    } else this.switchProject(this.currentProject);
  },
  methods: {
    updateGroup(index, group, updateHistory) {
      let oldGroupId = this.groups[index].groupId;
      let newGroupId = group.groupId;
      
      for (let constraint of this.constraints) {
        let constraintKeys = Object.keys(constraint);
        if (constraintKeys.includes('mandatoryGroup') && constraint.mandatoryGroup == oldGroupId)
          constraint.forbiddenGroups = newGroupId;
        if (constraintKeys.includes('forbiddenGroups')) {
          let otherGroup = constraint.forbiddenGroups.find(({ groupId }) => groupId == oldGroupId);
          if (otherGroup)
            otherGroup.groupId = newGroupId;
        }
      }
      this.groups.splice(index, 1, group);
      this.saveGroups();
      this.saveConstraints();

      if (updateHistory) {
        for (let entry of this.history)
          for (let otherGroup of entry.groups)
            if (otherGroup.groupId == oldGroupId)
              otherGroup.groupId = newGroupId;
        this.saveHistory();
      }
    },
    addGroup(group) {
      this.groups.push(group);
      this.saveGroups();
    },
    removeGroup(index) {
      let groupId = this.groups[index].groupId;
      for (let constraint of this.constraints) {
        if (constraint.mandatoryGroup == groupId)
          constraint.mandatoryGroup = null;
        let i = constraint.forbiddenGroups.findIndex(group => group.mandatoryGroup == groupId);
        if (i >= 0)
          constraint.forbiddenGroups.splice(i, 1);
      }
      this.groups.splice(index, 1);
      this.saveGroups();
      this.saveConstraints();
    },
    updatePerson(index, person, updateHistory) {
      let oldPersonId = this.persons[index].personId;
      let newPersonId = person.personId;
      for (let constraint of this.constraints) {
        let otherPerson = constraint.persons.find(({ personId }) => personId == oldPersonId);
        if (otherPerson)
          otherPerson.personId = newPersonId;
      }
      this.persons.splice(index, 1, person);
      this.savePersons();
      this.saveConstraints();

      if (updateHistory) {
        for (let entry of this.history)
          for (let group of entry.groups)
            for (let otherPerson of group.persons)
              if (otherPerson.personId == oldPersonId)
                otherPerson.personId = newPersonId;
        this.saveHistory();
      }
    },
    addPerson(person) {
      this.persons.push(person);
      this.savePersons();
    },
    removePerson(index) {
      let personId = this.persons[index].personId;
      for (let constraint of this.constraints) {
        let i = constraint.persons.findIndex(person => person.personId == personId);
        if (i >= 0)
          constraint.persons.splice(i, 1);
      }
      this.persons.splice(index, 1);
      this.savePersons();
      this.saveConstraints();
    },
    updateConstraint(index, constraint) {
      this.constraints.splice(index, 1, constraint);
      this.saveConstraints();
    },
    addConstraint(constraint) {
      this.constraints.push(constraint);
      this.saveConstraints();
    },
    removeConstraint(index) {
      this.constraints.splice(index, 1);
      this.saveConstraints();
    },
    saveEntry(entry) {
      this.history.push(entry);
      this.saveHistory();
    },
    removeEntry(index) {
      this.history.splice(index, 1);
      this.saveHistory();
    },
    switchProject(project) {
      //TODO more efficient storage (e.g. transform [{personId: 'toto'}, ...] into simply ['toto', ...])
      this.groups = JSON.parse(localStorage.getItem(getGroupsKey(project)));
      this.persons = JSON.parse(localStorage.getItem(getPersonsKey(project)));
      this.constraints = JSON.parse(localStorage.getItem(getConstraintsKey(project)));
      this.history = JSON.parse(localStorage.getItem(getHistoryKey(project)));
      this.currentProject = project;
    },
    saveGroups() {
      //TODO more efficient storage
      localStorage.setItem(getGroupsKey(this.currentProject), JSON.stringify(this.groups));
    },
    savePersons() {
      //TODO more efficient storage
      localStorage.setItem(getPersonsKey(this.currentProject), JSON.stringify(this.persons));
    },
    saveConstraints() {
      //TODO more efficient storage
      localStorage.setItem(getConstraintsKey(this.currentProject), JSON.stringify(this.constraints));
    },
    saveHistory() {
      //TODO more efficient storage
      localStorage.setItem(getHistoryKey(this.currentProject), JSON.stringify(this.history));
    }
  }
};
</script>

<style>
.splitpanes__pane {
  overflow-y: scroll;
}

.horizontalPane {
  overflow-y: hidden;
}
</style>
