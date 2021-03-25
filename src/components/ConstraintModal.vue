<template>
  <div>
    <b-modal v-model="showConstraintModal" :title="modalTitle"
      @show="reinitConstraintModal" @hide="reinitConstraintModal"
    >
      <template #default>
        <div v-if="newConstraint">
          <b-form-group label="Type" label-for="type">
            <b-form-select :options="typeOptions" id="type" v-model="newConstraint.type" />
          </b-form-group>
          <b-form-group
            label="Ajouter une personne"
            label-for="newPerson"
          >
            <b-form-select :options="personOptions" id="newPerson"
              @change="personId => addPerson(personId)" v-model="reinitSelectPerson"
            >
              <template #first>
                <b-form-select-option value="" disabled>-- Sélectionner une personne --</b-form-select-option>
              </template>
            </b-form-select>
          </b-form-group>
          <div v-if="newConstraint.persons.length >= 1">
            <b-table small striped hover :fields="personFields" :items="newConstraint.persons"
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
          <div v-if="newConstraint.type == 'together'">
            <b-form-group label="Dans le groupe" label-for="mandatoryGroup">
              <b-form-select :options="groupOptions" id="mandatoryGroup"
                v-model="newConstraint.mandatoryGroup"
                :disabled="newConstraint.forbiddenGroups.length >= 1"
              >
                <template #first>
                  <b-select-option :value="null" />
                </template>
              </b-form-select>
            </b-form-group>
            <b-form-group label="Pas dans les groupes" label-for="forbiddenGroups">
              <b-form-select :options="groupOptions" id="forbiddenGroups" v-model="reinitSelectGroup"
                @change="groupId => addGroup(groupId)" :disabled="newConstraint.mandatoryGroup != null"
              >
                <template #first>
                  <b-form-select-option value="" disabled>-- Sélectionner un groupe --</b-form-select-option>
                </template>
              </b-form-select>
            </b-form-group>
            <div v-if="newConstraint.forbiddenGroups.length >= 1">
              <b-table small striped hover :fields="groupFields" :items="newConstraint.forbiddenGroups">
                <template #cell(removeBtn)="data">
                  <div class="float-right">
                    <button @click="removeGroup(data.index)"
                      v-b-hover="hover => removeGroupBtnHover = hover"
                      :class="'btn btn-link btn-sm' +
                        (removeGroupBtnHover ? ' text-danger' : ' text-body') +
                        (groupRowHoverIndex == data.index ? ' visible' : ' invisible')
                      "
                    >
                      <b-icon-x-circle />
                    </button>
                  </div>
                </template>
              </b-table>
            </div>
          </div>
        </div>
      </template>

      <template #modal-footer>
        <b-button variant="success" @click="checkConstraint">
          Valider
          <b-icon-check-circle/>
        </b-button>
        <b-button @click="removeConstraint" variant="danger" v-if="!isCreationModal">
          Supprimer
          <b-icon-x-circle/>
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import {
  BModal, BButton, BTable, BFormGroup, BFormSelect, BFormSelectOption,
  BIconXCircle, BIconCheckCircle,
} from "bootstrap-vue";

export default {
  name: 'ConstraintModal',
  components: {
    BModal, BButton, BTable, BFormGroup, BFormSelect, BFormSelectOption,
    BIconXCircle, BIconCheckCircle
  },
  props: {
    value: {
      type: Boolean,
      required: true
    },
    oldConstraint: {
      type: Object
    },
    persons: {
      type: Array,
      required: true
    },
    groups: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      newConstraint: this.generateNewConstraint(),
      typeOptions: [
        { value: 'apart', text: 'Séparés' },
        { value: 'together', text: 'Ensemble' }
      ],
      personOptions: this.generatePersonOptions(),
      personFields: [
        { key: 'personId', label: 'Personnes' },
        { key: 'removeBtn', label: '' },
      ],
      groupOptions: this.generateGroupOptions(),
      groupFields: [
        { key: 'groupId', label: 'Groupes interdits' },
        { key: 'removeBtn', label: '' }
      ],
      removePersonBtnHover: false,
      personRowHoverIndex: -1,
      removeGroupBtnHover: false,
      groupRowHoverIndex: -1,
      reinitSelectPerson: null,
      reinitSelectGroup: null
    };
  },
  methods: {
    generateNewConstraint() {
      if (!this.oldConstraint)
        return {
          type: 'apart',
          persons: [],
          mandatoryGroup: null,
          forbiddenGroups: []
        };
      return {
        type: this.oldConstraint.type,
        persons: [...this.oldConstraint.persons],
        mandatoryGroup: this.oldConstraint.mandatoryGroup,
        forbiddenGroups: [...this.oldConstraint.forbiddenGroups]
      };
    },
    reinitConstraintModal() {
      this.newConstraint = this.generateNewConstraint();
      this.personOptions = this.generatePersonOptions();
      this.groupOptions = this.generateGroupOptions();
    },
    updateConstraint() {
      this.$emit('constraint-to-update', this.newConstraint);
      this.showConstraintModal = false;
    },
    addConstraint() {
      this.$emit('constraint-to-add', this.newConstraint);
      this.showConstraintModal = false;
    },
    removeConstraint() {
      this.$emit('constraint-to-remove');
      this.showConstraintModal = false;
    },
    addPerson(personId) {
      this.newConstraint.persons.push({ personId: personId });
      this.personOptions = this.generatePersonOptions();
    },
    removePerson(index) {
      let personId = this.newConstraint.persons[index].personId;
      this.newConstraint.persons.splice(index, 1);
      this.personOptions.push({ value: personId, text: personId });
      this.reinitSelectPerson = null;
      this.removePersonBtnHover = false;
    },
    addGroup(groupId) {
      this.newConstraint.forbiddenGroups.push({ groupId: groupId });
      this.groupOptions = this.generateGroupOptions();
    },
    removeGroup(index) {
      this.newConstraint.forbiddenGroups.splice(index, 1);
      this.groupOptions = this.generateGroupOptions();
      this.reinitSelectGroup = null;
      this.removeGroupBtnHover = false;
    },
    generatePersonOptions() {
      let options = [];
      if (this.newConstraint) {
        for (let person of this.persons) {
          if (this.newConstraint.persons.every(({ personId }) => personId != person.personId))
            options.push({
              value: person.personId,
              text: person.personId
            });
        }
      }
      return options;
    },
    generateGroupOptions() {
      let options = [];
      if (this.newConstraint) {
        for (let group of this.groups) {
          if (this.newConstraint.forbiddenGroups.every(({ groupId }) => groupId != group.groupId))
            options.push({
              value: group.groupId,
              text: group.groupId
            });
        }
      }
      return options;
    },
    checkConstraint() {
      let validContraint = this.newConstraint.persons.length >= 1;
      if (validContraint) {
        if (this.isCreationModal)
          this.addConstraint();
        else this.updateConstraint();
      }
    }
  },
  watch: {
    persons() {
      this.personOptions = this.generatePersonOptions();
    },
    groups() {
      this.groupOptions = this.generateGroupOptions();
    }
  },
  computed: {
    showConstraintModal: {
      get() {
        return this.value;
      },
      set(newVal) {
        return this.$emit('input', newVal);
      }
    },
    isCreationModal() {
      return this.oldConstraint == null;
    },
    modalTitle() {
      if (this.isCreationModal)
        return "Ajouter une contrainte";
      return "Modifier la contrainte";
    }
  }
}
</script>
