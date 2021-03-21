<template>
  <div>
    <div class="sticky-top bg-light d-inline-block w-100">
      <span class="float-left h5">Historique</span>
    </div>
    <div class="accordion" role="tablist">
      <b-card no-body class="mb-1" v-for="(entry, index) in history" :key="index">
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-button block v-b-toggle="'entry' + index" variant="link" class="text-body">
            {{ entry.title }}
          </b-button>
        </b-card-header>
        <b-collapse :id="'entry' + index" accordion="historyAccordion" role="tabpanel">
          <b-table small striped hover :fields="entryFields" :items="entry.groups"
            @row-hovered="(_, index) => entryGroupRowHoverIndex = index"
            @row-unhovered="(_, index) => entryGroupRowHoverIndex = -1"
          >
            <template #cell(personIds)="data">
              {{ data.item.persons.map(item => item.personId).join(', ') }}  
            </template>
          </b-table>
          <button @click="removeEntry(index)"
            :class="'btn btn-link btn-sm ' + (removeEntryBtnHover ? 'text-danger' : 'text-body')"
            v-b-hover="hover => removeEntryBtnHover = hover"
          >
            Supprimer l'entrée <b-icon-x-circle />
          </button>
        </b-collapse>
      </b-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HistoryPane',
  props: {
    history: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      entryFields: [
        { key: 'groupId', label: 'Groupe' },
        { key: 'personIds', label: 'Personnes' }
      ],
      removeEntryBtnHover: false,
      activeEntry: null,
      activeEntryGroup: null,
      showEntryModal: false
    };
  },
  methods: {
    removeEntry(index) {
      this.$emit('entry-to-remove', index);
    }
  }
}
</script>
