<template>
  <div>
    <b-modal v-model="showSaveEntryModal" title="Sauvegarder la proposition">
      <template #default>
        <b-form-group label="Titre" label-for="entryTitle">
          <b-form-input type="text" v-model.trim="entryTitle"
            required maxlength="32"
            placeholder="Titre de la proposition (e.g. Date + Objet)"
          />
        </b-form-group>
        <p v-if="remainingPersons.length >= 1" class="text-danger">
          <span class="font-italic font-weight-bold">
            <b-icon-exclamation-triangle /> Certaines personnes n'ont pas été placées :
          </span>
          {{ remainingPersons.map(person => person.personId).join(', ') }}
        </p>
      </template>

      <template #modal-footer>
        <b-button variant="success" @click="saveEntry">
          Valider
          <b-icon-check-circle/>
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import {
  BModal, BButton, BFormGroup, BFormInput,
  BIconCheckCircle
} from "bootstrap-vue";

export default {
  name: 'SaveEntryModal',
  components: {
    BModal, BButton, BFormGroup, BFormInput,
    BIconCheckCircle
  },
  props: {
    value: {
      type: Boolean,
      required: true
    },
    remainingPersons: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      entryTitle: null
    };
  },
  methods: {
    saveEntry() {
      if (this.entryTitle.length >= 1) {
        this.$emit('entry-to-save', this.entryTitle);
        this.showSaveEntryModal = false;
      }
    }
  },
  computed: {
    showSaveEntryModal: {
      get() {
        return this.value;
      },
      set(newVal) {
        return this.$emit('input', newVal);
      }
    }
  }
}
</script>
