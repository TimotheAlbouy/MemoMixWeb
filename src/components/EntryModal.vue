<template>
  <div>
    <b-modal v-model="showEntryModal" :title="modalTitle"
      @show="reinitEntryModal" @hide="reinitEntryModal"
    >
      <template #default>
        <div v-if="newEntryGroup">
          <b-form-group label="Ajouter une personne" label-for="newPerson">
            <b-form-select :options="personOptions" id="newPerson"
              @change="personId => addPerson(personId)" v-model="reinitSelectPerson"
            >
              <template #first>
                <b-form-select-option value="" disabled>-- Sélectionner une personne --</b-form-select-option>
              </template>
            </b-form-select>
          </b-form-group>
          <div v-if="newEntryGroup.persons.length >= 1">
            <b-table small striped hover :fields="personFields" :items="newEntryGroup.persons"
              @row-hovered="(_, index) => personRowHoverIndex = index"
              @row-unhovered="(_, index) => personRowHoverIndex = -1"
            >
              <template #cell(removeBtn)="data">
                <div class="float-right">
                  <button @click="removePerson(data.index)"
                    v-b-hover="hover => removePersonBtnHover = hover"
                    :class="'btn btn-link btn-sm' +
                      (removePersonBtnHover ? ' text-danger' : ' text-body') +
                      (personRowHoverIndex == data.index ? ' visible' : ' invisible')
                    "
                  >
                    <b-icon-x-circle />
                  </button>
                </div>
              </template>
            </b-table>
          </div>
        </div>
      </template>

      <template #modal-footer>
        <b-button variant="success" @click="checkEntryGroup">
          Valider
          <b-icon-check-circle/>
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import {
  BModal, BFormGroup, BFormSelect,
  BIconXCircle, BIconCheckCircle,
} from "bootstrap-vue";

export default {
  name: 'EntryModal',
  components: {
    BModal, BFormGroup, BFormSelect,
    BIconXCircle, BIconCheckCircle
  },
  props: {
    value: {
      type: Boolean,
      required: true
    },
    oldEntryGroup: {
      type: Object
    },
    remainingPersons: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      newEntryGroup: this.generateNewEntryGroup(),
      personFields: [
        { key: 'personId', label: 'Personnes' },
        { key: 'removeBtn', label: '' },
      ],
      personOptions: this.generatePersonOptions(),
      removePersonBtnHover: false,
      personRowHoverIndex: -1,
      reinitSelectPerson: null,
    };
  },
  methods: {
    generateNewEntryGroup() {
      if (!this.oldEntryGroup)
        return {
          groupId: null,
          persons: []
        };
      return {
        groupId: this.oldEntryGroup.groupId,
        persons: [...this.oldEntryGroup.persons]
      };
    },
    reinitEntryModal() {
      this.newEntryGroup = this.generateNewEntryGroup();
      this.personOptions = this.generatePersonOptions();
    },
    updateEntryGroup() {
      let newRemainingPersons = this.personOptions.map(option => ({ personId: option.value }));
      this.$emit('entry-group-to-update', this.newEntryGroup, newRemainingPersons);
      this.showEntryModal = false;
    },
    addPerson(personId) {
      this.newEntryGroup.persons.push({ personId: personId });
      let index;
      for (index = 0; index < this.personOptions.length; index++)
        if (this.personOptions[index].value == personId)
          break;
      this.personOptions.splice(index, 1);
      this.reinitSelectPerson = null;
    },
    removePerson(index) {
      let personId = this.newEntryGroup.persons[index].personId;
      this.newEntryGroup.persons.splice(index, 1);
      this.personOptions.push({ value: personId, text: personId });
      this.removePersonBtnHover = false;
    },
    generatePersonOptions() {
      let options = [];
      if (this.newEntryGroup) {
        for (let person of this.remainingPersons)
          options.push({
            value: person.personId,
            text: person.personId
          });
      }
      return options;
    },
    checkEntryGroup() {
      let validEntryGroup = true;
      if (validEntryGroup)
        this.updateEntryGroup();
    }
  },
  watch: {
    persons() {
      this.personOptions = this.generatePersonOptions();
    }
  },
  computed: {
    showEntryModal: {
      get() {
        return this.value;
      },
      set(newVal) {
        return this.$emit('input', newVal);
      }
    },
    modalTitle() {
      if (!this.oldEntryGroup)
        return '';
      return "Modifier le groupe '" + this.oldEntryGroup.groupId + "'";
    }
  }
}
</script>
