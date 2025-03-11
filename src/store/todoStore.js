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

    // Fetching
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
      console.log("🚀 ~ setItemName ~ name:", name);
      const item = self.items.find((i) => i.id === id);
      item.name = name;
    },
    setCompleted(id) {
      const item = self.items.find((i) => i.id === id);
      item.isComplete = true;
    },
    setDeleted(id) {
      self.items = self.items.filter((i) => i.id !== id);
    },
    setStatus(id, status) {
      const item = self.items.find((i) => i.id === id);
      item.status = status;
    },
    addTag(id, tag) {
      const item = self.items.find((i) => i.id === id);
      if (item && !item.tags.includes(tag)) {
        item.tags.push(tag);
      }
    },
    removeTag(id, tag) {
      const item = self.items.find((i) => i.id === id);
      if (item) {
        item.tags = item.tags.filter((t) => t !== tag);
      }
    },
    setFilterTag(tag) {
      self.filterTag = tag;
    },
    setFilterStatus(status) {
      self.filterStatus = status;
    },
  });

  return self;
}

const store = createTodoStore();
export default store;
