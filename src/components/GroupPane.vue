<template>
  <div>
    <group-modal v-model="showGroupModal" :old-group="activeGroup" :groups="groups"
      @group-to-update="(group, updateHistory) => updateGroup(activeIndex, group, updateHistory)"
      @group-to-add="group => addGroup(group)"
      @group-to-remove="() => removeGroup(activeIndex)"
    />
    <div class="sticky-top bg-light d-inline-block w-100">
      <span class="float-left h5">Groupes</span>
      <span class="float-right">
        <button @click="openGroupModal(-1)"
          :class="'btn btn-link btn-sm ' + (addGroupBtnHover ? 'text-success' : 'text-body')"
          v-b-hover="hover => addGroupBtnHover = hover"
        >
          Nouveau groupe <b-icon-plus-circle />
        </button>
      </span>
    </div>
    <b-table small striped hover :fields="groupFields" :items="groups"
      @row-hovered="(_, index) => groupRowHoverIndex = index"
      @row-unhovered="(_, index) => groupRowHoverIndex = -1"
    >
      <template #cell(updateBtn)="data">
        <div class="float-right">
          <button @click="openGroupModal(data.index)"
            v-b-hover="hover => updateGroupBtnHover = hover"
            :class="'btn btn-link btn-sm' +
              (updateGroupBtnHover ? ' text-success' : ' text-body') +
              (groupRowHoverIndex == data.index ? ' visible' : ' invisible')
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
import GroupModal from './GroupModal.vue';

export default {
  name: 'GroupPane',
  components: { GroupModal },
  props: {
    groups: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      groupFields: [
        { key: 'groupId', label: 'ID' },
        { key: 'size', label: 'Taille' },
        { key: 'updateBtn', label: '' },
      ],
      addGroupBtnHover: false,
      updateGroupBtnHover: false,
      groupRowHoverIndex: -1,
      activeIndex: -1,
      activeGroup: null,
      showGroupModal: false
    };
  },
  methods: {
    updateGroup(index, group, updateHistory) {
      this.$emit('group-to-update', index, group, updateHistory);
    },
    addGroup(group) {
      this.$emit('group-to-add', group);
    },
    removeGroup(index) {
      this.$emit('group-to-remove', index);
      this.updateGroupBtnHover = false;
    },
    openGroupModal(index) {
      this.activeIndex = index;
      if (index == -1)
        this.activeGroup = null;
      else this.activeGroup = this.groups[index];
      this.showGroupModal = true;
    }
  }
}
</script>
