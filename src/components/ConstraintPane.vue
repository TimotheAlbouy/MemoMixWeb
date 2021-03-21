<template>
  <div>
    <constraint-modal v-model="showConstraintModal" :old-constraint="activeConstraint"
      :groups="groups" :persons="persons"
      @constraint-to-update="constraint => updateConstraint(activeIndex, constraint)"
      @constraint-to-add="constraint => addConstraint(constraint)"
      @constraint-to-remove="constraint => removeConstraint(activeIndex)"
    />
    <div class="sticky-top bg-light d-inline-block w-100">
      <span class="float-left h5">Contraintes</span>
      <span class="float-right">
        <button @click="openConstraintModal"
          :class="'btn btn-link btn-sm ' + (addConstraintBtnHover ? 'text-success' : 'text-body')"
          v-b-hover="hover => addConstraintBtnHover = hover"
        >
          Nouvelle contrainte <b-icon-plus-circle />
        </button>
      </span>
    </div>
    <b-table small striped hover :fields="constraintFields" :items="constraints"
      @row-hovered="(_, index) => constraintRowHoverIndex = index"
      @row-unhovered="(_, index) => constraintRowHoverIndex = -1"
    >
      <template #cell(type)="data">
        {{ constraintTypes[data.item.type] }}  
      </template>

      <template #cell(personIds)="data">
        {{ data.item.persons.map(item => item.personId).join(', ') }}  
      </template>

      <template #cell(updateBtn)="data">
        <div class="float-right">
          <button @click="openConstraintModal(data.index)"
            v-b-hover="hover => updateConstraintBtnHover = hover"
            :class="'btn btn-link btn-sm' +
              (updateConstraintBtnHover ? ' text-success' : ' text-body') +
              (constraintRowHoverIndex == data.index ? ' visible' : ' invisible')
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
import ConstraintModal from "./ConstraintModal.vue"

export default {
  name: 'ConstraintPane',
  components: { ConstraintModal },
  props: {
    constraints: {
      type: Array,
      required: true
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
      constraintFields: [
        { key: 'type', label: 'Type' },
        { key: 'personIds', label: 'Personnes' },
        { key: 'updateBtn', label: '' },
      ],
      addConstraintBtnHover: false,
      updateConstraintBtnHover: false,
      constraintRowHoverIndex: -1,
      activeIndex: -1,
      activeConstraint: null,
      showConstraintModal: false,
      constraintTypes: {
        apart: 'Séparés',
        together: 'Ensemble'
      }
    };
  },
  methods: {
    updateConstraint(index, constraint) {
      this.$emit('constraint-to-update', index, constraint);
    },
    addConstraint(constraint) {
      this.$emit('constraint-to-add', constraint);
    },
    removeConstraint(index) {
      this.$emit('constraint-to-remove', index);
      this.removeConstraintHover = -1;
    },
    openConstraintModal(index) {
      this.activeIndex = index;
      if (index == -1)
        this.activeConstraint = null;
      else this.activeConstraint = this.constraints[index];
      this.showConstraintModal = true;
    }
  },
  watch: {
    persons: {
      deep: true,
      handler() { }
    }
  }
}
</script>
