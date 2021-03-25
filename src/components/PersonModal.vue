<template>
  <div>
    <b-modal v-model="showPersonModal" :title="modalTitle"
      @show="reinitPersonModal" @hide="reinitPersonModal"
    >
      <template #default>
        <b-form novalidate @submit="e => e.preventDefault()">
          <b-form-group label="Identifiant de la personne" label-for="personId">
            <b-form-input type="text" v-model.trim="newPerson.personId"
              :state="personIdConflict ? false : null" required maxlength="32"
              placeholder="Identifiant de la personne (e.g. Prénom + Nom)"
            />
            <div class="invalid-feedback">
              La personne existe déjà.
            </div>
          </b-form-group>
          <b-form-checkbox v-model="updateHistory" v-if="!isCreationModal" switch>
            Modifier les occurrences de la personne dans l'historique
          </b-form-checkbox>
        </b-form>
      </template>

      <template #modal-footer>
        <b-button variant="success" @click="checkPerson">
          Valider
          <b-icon-check-circle/>
        </b-button>
        <b-button @click="removePerson" variant="danger" v-if="!isCreationModal">
          Supprimer
          <b-icon-x-circle/>
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import {
  BModal, BButton, BForm, BFormGroup, BFormInput, BFormCheckbox,
  BIconXCircle, BIconCheckCircle
} from "bootstrap-vue";

export default {
  name: 'PersonModal',
  components: {
    BModal, BButton, BForm, BFormGroup, BFormInput, BFormCheckbox,
    BIconXCircle, BIconCheckCircle
  },
  props: {
    value: {
      type: Boolean,
      required: true
    },
    oldPerson: {
      type: Object
    },
    persons: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      newPerson: this.generateNewPerson(),
      updateHistory: false
    };
  },
  methods: {
    generateNewPerson() {
      if (!this.oldPerson)
        return { personId: '' };
      return { personId: this.oldPerson.personId };
    },
    reinitPersonModal() {
      this.newPerson = this.generateNewPerson();
      this.updateHistory = true;
    },
    updatePerson() {
      this.$emit('person-to-update', this.newPerson, this.updateHistory);
      this.showPersonModal = false;
    },
    addPerson() {
      this.$emit('person-to-add', this.newPerson);
      this.showPersonModal = false;
    },
    removePerson() {
      this.$emit('person-to-remove');
      this.showPersonModal = false;
    },
    checkPerson() {
      let validPerson = !this.personIdConflict && this.newPerson.personId.length >= 1;
      if (validPerson) {
        if (this.isCreationModal)
          this.addPerson();
        else this.updatePerson();
      }
    }
  },
  computed: {
    showPersonModal: {
      get() {
        return this.value;
      },
      set(newVal) {
        return this.$emit('input', newVal);
      }
    },
    isCreationModal() {
      return this.oldPerson == null;
    },
    modalTitle() {
      if (this.isCreationModal)
        return "Ajouter une personne";
      return "Modifier la personne";
    },
    personIdConflict() {
      let existingPerson = this.persons.find(person => person.personId == this.newPerson.personId);
      if (existingPerson == undefined)
        return false;
      if (this.isCreationModal)
        return true;
      let oldPersonId = this.oldPerson.personId;
      let existingPersonId = existingPerson.personId;
      if (oldPersonId == existingPersonId)
        return false;
      return true;
    },
  }
}
</script>
