<template>
  <div>
    <b-modal v-model="showGroupModal" :title="modalTitle"
      @show="reinitGroupModal" @hide="reinitGroupModal"
    >
      <template #default>
        <b-form novalidate @submit="e => e.preventDefault()">
          <b-form-group label="Identifiant du groupe" label-for="groupId">
            <b-form-input type="text" v-model.trim="newGroup.groupId"
              :state="groupIdConflict ? false : null" required maxlength="32"
              placeholder="Identifiant du groupe (e.g. nom d'une tâche) "
            />
            <div class="invalid-feedback">
              Le groupe existe déjà.
            </div>
          </b-form-group>
          <b-form-group label="Taille du groupe" label-for="size">
            <b-form-input type="number" v-model.number="newGroup.size" required />
          </b-form-group>
          <b-form-checkbox v-model="newGroup.updateHistory" v-if="!isCreationModal">
            Modifier les occurrences du groupe dans l'historique
          </b-form-checkbox>
        </b-form>
      </template>

      <template #modal-footer>
        <b-button variant="success" @click="checkGroup">
          Valider
          <b-icon-check-circle/>
        </b-button>
        <b-button @click="removeGroup" variant="danger" v-if="!isCreationModal">
          Supprimer
          <b-icon-x-circle/>
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'GroupModal',
  props: {
    value: {
      type: Boolean,
      required: true
    },
    oldGroup: {
      type: Object
    },
    groups: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      newGroup: this.generateNewGroup(),
      updateHistory: true
    };
  },
  methods: {
    generateNewGroup() {
      if (!this.oldGroup)
        return {
          groupId: '',
          size: 1,
        };
      return {
        groupId: this.oldGroup.groupId,
        size: this.oldGroup.size,
      };
    },
    reinitGroupModal() {
      this.newGroup = this.generateNewGroup();
      this.updateHistory = true;
    },
    updateGroup() {
      this.$emit('group-to-update', this.newGroup, this.updateHistory);
      this.showGroupModal = false;
    },
    addGroup() {
      this.$emit('group-to-add', this.newGroup);
      this.showGroupModal = false;
    },
    removeGroup() {
      this.$emit('group-to-remove');
      this.showGroupModal = false;
    },
    checkGroup() {
      let validGroup = !this.groupIdConflict && this.newGroup.groupId.length >= 1;
      if (validGroup) {
        if (this.isCreationModal)
          this.addGroup();
        else this.updateGroup();
      }
    }
  },
  computed: {
    showGroupModal: {
      get() {
        return this.value;
      },
      set(newVal) {
        return this.$emit('input', newVal);
      }
    },
    isCreationModal() {
      return this.oldGroup == null;
    },
    modalTitle() {
      if (this.isCreationModal)
        return "Ajouter un groupe";
      return "Modifier le groupe";
    },
    groupIdConflict() {
      let existingGroup = this.groups.find(group => group.groupId == this.newGroup.groupId);
      if (existingGroup == undefined)
        return false;
      if (this.isCreationModal)
        return true;
      let oldGroupId = this.oldGroup.groupId;
      let existingGroupId = existingGroup.groupId;
      if (oldGroupId == existingGroupId)
        return false;
      return true;
    }
  }
}
</script>
