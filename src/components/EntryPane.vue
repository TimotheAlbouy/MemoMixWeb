<template>
  <div>
    <entry-modal v-model="showEntryModal" :remaining-persons="remainingPersons"
      :old-entry-group="activeEntryGroup" @entry-group-to-update="updateEntryGroup"
    />
    <save-entry-modal v-model="showSaveEntryModal" :remaining-persons="remainingPersons"
      @entry-to-save="saveEntry"
    />
    <div class="sticky-top bg-light d-inline-block w-100">
      <span class="float-left h5">Proposition</span>
      <span class="float-right">
        <button @click="showSaveEntryModal = true" v-if="entry.groups.length > 0"
          :class="'btn btn-link btn-sm ' + (saveEntryBtnHover ? 'text-success' : 'text-body')"
          v-b-hover="hover => saveEntryBtnHover = hover"
        >
          Sauvegarder <b-icon-check-circle />
        </button>
        <button @click="generateEntry"
          :class="'btn btn-link btn-sm ' + (generateEntryBtnHover ? 'text-primary' : 'text-body')"
          v-b-hover="hover => generateEntryBtnHover = hover"
        >
          Générer <b-icon-play-circle />
        </button>
      </span>
    </div>
    <b-table small striped hover :fields="entryFields" :items="entry.groups"
      @row-hovered="(_, index) => entryGroupRowHoverIndex = index"
      @row-unhovered="(_, index) => entryGroupRowHoverIndex = -1"
    >
      <template #cell(personIds)="data">
        {{ data.item.persons.map(item => item.personId).join(', ') }}  
      </template>

      <template #cell(updateBtn)="data">
        <div class="float-right">
          <button @click="openEntryModal(data.index)"
            v-b-hover="hover => updateEntryGroupBtnHover = hover"
            :class="'btn btn-link btn-sm' +
              (updateEntryGroupBtnHover ? ' text-success' : ' text-body') +
              (entryGroupRowHoverIndex == data.index ? ' visible' : ' invisible')
            "
          >
            <b-icon-pencil />
          </button>
        </div>
      </template>
    </b-table>

    <p v-if="remainingPersons.length >= 1">
      <span class="font-italic font-weight-bold">Personnes restantes :</span>
      {{ remainingPersons.map(person => person.personId).join(', ') }}
    </p>
  </div>
</template>

<script>
import {
  BTable,
  BIconCheckCircle, BIconPencil, BIconPlayCircle,
} from "bootstrap-vue";

import EntryModal from './EntryModal.vue';
import SaveEntryModal from './SaveEntryModal.vue';
import MemoMix from '../memomix/MemoMix';

export default {
  name: 'EntryPane',
  components: {
    BTable,
    BIconCheckCircle, BIconPencil, BIconPlayCircle,
    EntryModal, SaveEntryModal
  },
  props: {
    groups: {
      type: Array,
      required: true
    },
    persons: {
      type: Array,
      required: true
    },
    constraints: {
      type: Array,
      required: true
    },
    history: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      entry: {
        title: null,
        groups: []
      },
      entryFields: [
        { key: 'groupId', label: 'Groupe' },
        { key: 'personIds', label: 'Personnes' },
        { key: 'updateBtn', label: '' },
      ],
      remainingPersons: [],
      generateEntryBtnHover: false,
      saveEntryBtnHover: false,
      updateEntryGroupBtnHover: false,
      entryGroupRowHoverIndex: -1,
      activeIndex: -1,
      activeEntryGroup: null,
      showEntryModal: false,
      showSaveEntryModal: false
    };
  },
  methods: {
    generateEntry() {
      let personIds = new Set(this.persons.map(person => person.personId));
      let groupSizes = new Map(this.groups.map(group => [group.groupId, group.size]));
      let formattedHistory = [];
      for (let entry of this.history) {
        let formattedEntry = new Map();
        for (let group of entry.groups)
          formattedEntry.set(group.groupId, new Set(group.persons.map(person => person.personId)));
        formattedHistory.push(formattedEntry);
      }
      let formattedConstraints = [];
      for (let constraint of this.constraints) {
        let constraintKeys = Object.keys(constraint);
        let formattedConstraint = {
          type: constraint.type,
          persons: new Set(constraint.persons.map(person => person.personId))
        };
        if (constraintKeys.includes('mandatoryGroup'))
          formattedConstraint.mandatoryGroup = constraint.mandatoryGroup;
        if (constraintKeys.includes('forbiddenGroups'))
          formattedConstraint.forbiddenGroups = new Set(
            constraint.forbiddenGroups.map(forbiddenGroup => forbiddenGroup.groupId)
          );
        formattedConstraints.push(formattedConstraint);
      }
      let memomix = new MemoMix(personIds, groupSizes, formattedHistory, formattedConstraints);
      let entryMap = memomix.getNewEntry();
      this.entry = {
        title: null,
        groups: []
      };
      for (let [groupId, personIdsSet] of entryMap)
        this.entry.groups.push({
          groupId: groupId,
          persons: Array.from(personIdsSet).map(personId => ({ personId: personId }))
        });
      this.remainingPersons = [];
    },
    saveEntry(entryTitle) {
      this.entry.title = entryTitle;
      this.$emit('entry-to-save', this.entry);
      this.entry = {
        title: null,
        groups: []
      };
      this.remainingPersons = [];
    },
    openEntryModal(index) {
      this.activeIndex = index;
      this.activeEntryGroup = this.entry.groups[index];
      this.showEntryModal = true;
    },
    updateEntryGroup(entryGroup, remainingPersons) {
      this.entry.groups.splice(this.activeIndex, 1, entryGroup);
      this.remainingPersons = remainingPersons;
    }
  }
}
</script>
