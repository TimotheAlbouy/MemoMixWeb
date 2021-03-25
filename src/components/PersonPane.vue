<template>
  <div>
    <person-modal v-model="showPersonModal" :old-person="activePerson" :persons="persons"
      @person-to-update="(person, updateHistory) => updatePerson(activeIndex, person, updateHistory)"
      @person-to-add="person => addPerson(person)"
      @person-to-remove="() => removePerson(activeIndex)"
    />
    <div class="sticky-top bg-light d-inline-block w-100">
      <span class="float-left h5">Personnes</span>
      <span class="float-right">
        <button @click="openPersonModal(-1)"
          :class="'btn btn-link btn-sm ' + (addPersonBtnHover ? 'text-success' : 'text-body')"
          v-b-hover="hover => addPersonBtnHover = hover"
        >
          Nouvelle personne <b-icon-plus-circle />
        </button>
      </span>
    </div>
    <b-table small striped hover :fields="personFields" :items="persons"
      @row-hovered="(_, index) => personRowHoverIndex = index"
      @row-unhovered="(_, index) => personRowHoverIndex = -1"
    >
      <template #cell(updateBtn)="data">
        <div class="float-right">
          <button @click="openPersonModal(data.index)"
            v-b-hover="hover => updatePersonBtnHover = hover"
            :class="'btn btn-link btn-sm' +
              (updatePersonBtnHover ? ' text-success' : ' text-body') +
              (personRowHoverIndex == data.index ? ' visible' : ' invisible')
            "
          >
            <b-icon-pencil />
          </button>
        </div>
      </template>
    </b-table>
  </div>
</template>

<script>
import {
  BTable,
  BIconPlusCircle, BIconPencil
} from "bootstrap-vue";

import PersonModal from './PersonModal.vue';

export default {
  name: 'PersonPane',
  components: {
    BTable,
    BIconPlusCircle, BIconPencil,
    PersonModal
  },
  props: {
    persons: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      personFields: [
        { key: 'personId', label: 'ID' },
        { key: 'updateBtn', label: '' },
      ],
      addPersonBtnHover: false,
      updatePersonBtnHover: false,
      personRowHoverIndex: -1,
      activeIndex: -1,
      activePerson: null,
      showPersonModal: false
    };
  },
  methods: {
    updatePerson(index, person, updateHistory) {
      this.$emit('person-to-update', index, person, updateHistory);
    },
    addPerson(person) {
      this.$emit('person-to-add', person);
    },
    removePerson(index) {
      this.$emit('person-to-remove', index);
      this.updatePersonBtnHover = false;
    },
    openPersonModal(index) {
      this.activeIndex = index;
      if (index == -1)
        this.activePerson = null;
      else this.activePerson = this.persons[index];
      this.showPersonModal = true;
    }
  }
}
</script>
