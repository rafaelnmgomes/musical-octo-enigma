import { observable } from "mobx";
import { v4 as uuid } from "uuid";

function createTodoStore() {
  const self = observable({
    // State
    items: [
      {
        id: uuid(),
        name: "Sample item",
        status: "incomplete",
        tags: [],
      },
    ],
    filterTag: null,
    filterStatus: null,

    // Computed values
    get filteredItems() {
      return self.items.filter((i) => {
        const matchesTag = !self.filterTag || i.tags.includes(self.filterTag);
        const matchesStatus =
          !self.filterStatus || i.status === self.filterStatus;
        return matchesTag && matchesStatus;
      });
    },
    get activeItems() {
      return self.items.filter((i) => i.status !== "complete");
    },
    get completedItems() {
      return self.items.filter((i) => i.status === "complete");
    },
    get allTags() {
      const tags = new Set();
      self.items.forEach((item) => item.tags.forEach((tag) => tags.add(tag)));
      return Array.from(tags);
    },

    // Actions
    addItem() {
      self.items.push({
        id: uuid(),
        name: `Item ${self.items.length}`,
        status: "incomplete",
        tags: [],
      });
      self.filterStatus = null;
      self.filterTag = null;
    },
    setItemName(id, name) {
      const item = self.items.find((i) => i.id === id);
      if (!item) return;
      item.name = name;
    },
    setDeleted(id) {
      self.items = self.items.filter((i) => i.id !== id);
    },
    setStatus(id, status) {
      const item = self.items.find((i) => i.id === id);
      if (!item) return;
      item.status = status;
    },
    addTag(id, tag) {
      const item = self.items.find((i) => i.id === id);
      if (!item || item.tags.includes(tag)) return;
      item.tags.push(tag);
    },
    removeTag(id, tag) {
      const item = self.items.find((i) => i.id === id);
      if (!item) return;
      item.tags = item.tags.filter((t) => t !== tag);
    },
    setFilterTag(tag) {
      self.filterTag = self.filterTag === tag ? null : tag;
    },
    setFilterStatus(status) {
      self.filterStatus = self.filterStatus === status ? null : status;
    },
    reorderItems(fromIndex, toIndex) {
      if (fromIndex === toIndex) return;

      const movingItem = self.items[fromIndex];
      if (!movingItem) return;

      self.items.splice(fromIndex, 1);
      self.items.splice(toIndex, 0, movingItem);
    },
  });

  return self;
}

const store = createTodoStore();
export default store;
