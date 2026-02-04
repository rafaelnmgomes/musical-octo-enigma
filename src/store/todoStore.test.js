import { reaction } from "mobx";

// Mock uuid to return predictable values for testing
jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid-1"),
}));

describe("TodoStore", () => {
  let store;
  let uuid;

  beforeEach(() => {
    // Reset modules to get a fresh store instance
    jest.resetModules();
    uuid = require("uuid");

    // Set up UUID mock to return sequential IDs
    let counter = 0;
    uuid.v4.mockImplementation(() => `test-uuid-${++counter}`);

    // Import store after mocking uuid
    const todoStoreModule = require("./todoStore");
    store = todoStoreModule.default;

    // Reset store to initial state
    store.items = [
      {
        id: "initial-item",
        name: "Sample item",
        status: "incomplete",
        tags: [],
      },
    ];
    store.filterTag = null;
    store.filterStatus = null;
  });

  describe("Initial State", () => {
    test("should have initial items", () => {
      expect(store.items).toHaveLength(1);
      expect(store.items[0].name).toBe("Sample item");
    });

    test("should have no filters applied initially", () => {
      expect(store.filterTag).toBeNull();
      expect(store.filterStatus).toBeNull();
    });

    test("should have correct item count", () => {
      expect(store.itemCount).toBe(1);
    });
  });

  describe("Computed - filteredItems", () => {
    beforeEach(() => {
      store.items = [
        {
          id: "1",
          name: "Item 1",
          status: "incomplete",
          tags: ["work", "urgent"],
        },
        {
          id: "2",
          name: "Item 2",
          status: "complete",
          tags: ["personal"],
        },
        {
          id: "3",
          name: "Item 3",
          status: "in-progress",
          tags: ["work"],
        },
      ];
    });

    test("should return all items when no filters applied", () => {
      expect(store.filteredItems).toHaveLength(3);
    });

    test("should filter by tag", () => {
      store.filterTag = "work";
      expect(store.filteredItems).toHaveLength(2);
      expect(store.filteredItems.map((i) => i.id)).toEqual(["1", "3"]);
    });

    test("should filter by status", () => {
      store.filterStatus = "complete";
      expect(store.filteredItems).toHaveLength(1);
      expect(store.filteredItems[0].id).toBe("2");
    });

    test("should filter by both tag and status", () => {
      store.filterTag = "work";
      store.filterStatus = "incomplete";
      expect(store.filteredItems).toHaveLength(1);
      expect(store.filteredItems[0].id).toBe("1");
    });

    test("should return empty array when no items match filters", () => {
      store.filterTag = "nonexistent";
      expect(store.filteredItems).toHaveLength(0);
    });
  });

  describe("Computed - activeItems", () => {
    beforeEach(() => {
      store.items = [
        { id: "1", name: "Item 1", status: "incomplete", tags: [] },
        { id: "2", name: "Item 2", status: "complete", tags: [] },
        { id: "3", name: "Item 3", status: "in-progress", tags: [] },
      ];
    });

    test("should return items that are not complete", () => {
      expect(store.activeItems).toHaveLength(2);
      expect(store.activeItems.map((i) => i.id)).toEqual(["1", "3"]);
    });
  });

  describe("Computed - completedItems", () => {
    beforeEach(() => {
      store.items = [
        { id: "1", name: "Item 1", status: "incomplete", tags: [] },
        { id: "2", name: "Item 2", status: "complete", tags: [] },
        { id: "3", name: "Item 3", status: "complete", tags: [] },
      ];
    });

    test("should return only completed items", () => {
      expect(store.completedItems).toHaveLength(2);
      expect(store.completedItems.map((i) => i.id)).toEqual(["2", "3"]);
    });
  });

  describe("Computed - allTags", () => {
    test("should return unique tags from all items", () => {
      store.items = [
        { id: "1", name: "Item 1", status: "incomplete", tags: ["work", "urgent"] },
        { id: "2", name: "Item 2", status: "complete", tags: ["personal", "work"] },
        { id: "3", name: "Item 3", status: "in-progress", tags: ["urgent"] },
      ];

      const tags = store.allTags;
      expect(tags).toHaveLength(3);
      expect(tags).toContain("work");
      expect(tags).toContain("urgent");
      expect(tags).toContain("personal");
    });

    test("should return empty array when no tags exist", () => {
      store.items = [
        { id: "1", name: "Item 1", status: "incomplete", tags: [] },
      ];
      expect(store.allTags).toHaveLength(0);
    });
  });

  describe("Computed - itemCount", () => {
    test("should return correct count of items", () => {
      expect(store.itemCount).toBe(1);
      store.addItem();
      expect(store.itemCount).toBe(2);
      store.addItem();
      expect(store.itemCount).toBe(3);
    });

    test("should update when items are deleted", () => {
      store.addItem();
      store.addItem();
      expect(store.itemCount).toBe(3);
      store.setDeleted(store.items[0].id);
      expect(store.itemCount).toBe(2);
    });
  });

  describe("Action - addItem", () => {
    test("should add a new item with default properties", () => {
      const initialCount = store.items.length;
      store.addItem();

      expect(store.items).toHaveLength(initialCount + 1);
      const newItem = store.items[store.items.length - 1];
      expect(newItem.name).toBe(`Item ${initialCount}`);
      expect(newItem.status).toBe("incomplete");
      expect(newItem.tags).toEqual([]);
    });

    test("should clear filters when adding item", () => {
      store.filterTag = "work";
      store.filterStatus = "complete";

      store.addItem();

      expect(store.filterTag).toBeNull();
      expect(store.filterStatus).toBeNull();
    });

    test("should generate unique IDs for new items", () => {
      store.addItem();
      store.addItem();

      const ids = store.items.map((i) => i.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("Action - setItemName", () => {
    test("should update item name", () => {
      const itemId = store.items[0].id;
      store.setItemName(itemId, "Updated Name");

      expect(store.items[0].name).toBe("Updated Name");
    });

    test("should handle non-existent item ID gracefully", () => {
      const initialItems = [...store.items];
      store.setItemName("non-existent-id", "New Name");

      expect(store.items).toEqual(initialItems);
    });

    test("should allow empty string as name", () => {
      const itemId = store.items[0].id;
      store.setItemName(itemId, "");

      expect(store.items[0].name).toBe("");
    });
  });

  describe("Action - setDeleted", () => {
    test("should remove item by ID", () => {
      store.addItem();
      store.addItem();
      const itemToDelete = store.items[1].id;
      const initialCount = store.items.length;

      store.setDeleted(itemToDelete);

      expect(store.items).toHaveLength(initialCount - 1);
      expect(store.items.find((i) => i.id === itemToDelete)).toBeUndefined();
    });

    test("should handle non-existent item ID gracefully", () => {
      const initialItems = [...store.items];
      store.setDeleted("non-existent-id");

      expect(store.items).toHaveLength(initialItems.length);
    });

    test("should be able to delete all items", () => {
      store.addItem();
      store.addItem();

      const allIds = store.items.map((i) => i.id);
      allIds.forEach((id) => store.setDeleted(id));

      expect(store.items).toHaveLength(0);
    });
  });

  describe("Action - setStatus", () => {
    test("should update item status", () => {
      const itemId = store.items[0].id;
      store.setStatus(itemId, "complete");

      expect(store.items[0].status).toBe("complete");
    });

    test("should handle all valid status values", () => {
      const itemId = store.items[0].id;
      const statuses = ["incomplete", "in-progress", "complete"];

      statuses.forEach((status) => {
        store.setStatus(itemId, status);
        expect(store.items[0].status).toBe(status);
      });
    });

    test("should handle non-existent item ID gracefully", () => {
      const initialStatus = store.items[0].status;
      store.setStatus("non-existent-id", "complete");

      expect(store.items[0].status).toBe(initialStatus);
    });
  });

  describe("Action - addTag", () => {
    test("should add tag to item", () => {
      const itemId = store.items[0].id;
      store.addTag(itemId, "urgent");

      expect(store.items[0].tags).toContain("urgent");
    });

    test("should not add duplicate tags", () => {
      const itemId = store.items[0].id;
      store.addTag(itemId, "urgent");
      store.addTag(itemId, "urgent");

      const urgentCount = store.items[0].tags.filter((t) => t === "urgent").length;
      expect(urgentCount).toBe(1);
    });

    test("should handle multiple tags on same item", () => {
      const itemId = store.items[0].id;
      store.addTag(itemId, "urgent");
      store.addTag(itemId, "work");
      store.addTag(itemId, "personal");

      expect(store.items[0].tags).toHaveLength(3);
      expect(store.items[0].tags).toContain("urgent");
      expect(store.items[0].tags).toContain("work");
      expect(store.items[0].tags).toContain("personal");
    });

    test("should handle non-existent item ID gracefully", () => {
      store.addTag("non-existent-id", "urgent");
      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe("Action - removeTag", () => {
    beforeEach(() => {
      store.items[0].tags = ["work", "urgent", "personal"];
    });

    test("should remove tag from item", () => {
      const itemId = store.items[0].id;
      store.removeTag(itemId, "urgent");

      expect(store.items[0].tags).not.toContain("urgent");
      expect(store.items[0].tags).toHaveLength(2);
    });

    test("should handle removing non-existent tag gracefully", () => {
      const itemId = store.items[0].id;
      const initialTags = [...store.items[0].tags];

      store.removeTag(itemId, "nonexistent");

      expect(store.items[0].tags).toEqual(initialTags);
    });

    test("should handle non-existent item ID gracefully", () => {
      store.removeTag("non-existent-id", "urgent");
      // Should not throw error
      expect(true).toBe(true);
    });

    test("should handle removing all tags", () => {
      const itemId = store.items[0].id;
      store.removeTag(itemId, "work");
      store.removeTag(itemId, "urgent");
      store.removeTag(itemId, "personal");

      expect(store.items[0].tags).toHaveLength(0);
    });
  });

  describe("Action - setFilterTag", () => {
    test("should set filter tag", () => {
      store.setFilterTag("work");
      expect(store.filterTag).toBe("work");
    });

    test("should toggle filter tag off when clicking same tag", () => {
      store.setFilterTag("work");
      expect(store.filterTag).toBe("work");

      store.setFilterTag("work");
      expect(store.filterTag).toBeNull();
    });

    test("should switch to different tag when clicking another tag", () => {
      store.setFilterTag("work");
      expect(store.filterTag).toBe("work");

      store.setFilterTag("personal");
      expect(store.filterTag).toBe("personal");
    });
  });

  describe("Action - setFilterStatus", () => {
    test("should set filter status", () => {
      store.setFilterStatus("complete");
      expect(store.filterStatus).toBe("complete");
    });

    test("should toggle filter status off when clicking same status", () => {
      store.setFilterStatus("complete");
      expect(store.filterStatus).toBe("complete");

      store.setFilterStatus("complete");
      expect(store.filterStatus).toBeNull();
    });

    test("should switch to different status when clicking another status", () => {
      store.setFilterStatus("complete");
      expect(store.filterStatus).toBe("complete");

      store.setFilterStatus("in-progress");
      expect(store.filterStatus).toBe("in-progress");
    });
  });

  describe("Action - reorderItems", () => {
    beforeEach(() => {
      store.items = [
        { id: "1", name: "Item 1", status: "incomplete", tags: [] },
        { id: "2", name: "Item 2", status: "complete", tags: [] },
        { id: "3", name: "Item 3", status: "in-progress", tags: [] },
        { id: "4", name: "Item 4", status: "incomplete", tags: [] },
      ];
    });

    test("should reorder items from lower to higher index", () => {
      store.reorderItems(0, 2);

      expect(store.items.map((i) => i.id)).toEqual(["2", "3", "1", "4"]);
    });

    test("should reorder items from higher to lower index", () => {
      store.reorderItems(3, 1);

      expect(store.items.map((i) => i.id)).toEqual(["1", "4", "2", "3"]);
    });

    test("should handle reordering to same position", () => {
      const originalOrder = store.items.map((i) => i.id);
      store.reorderItems(1, 1);

      expect(store.items.map((i) => i.id)).toEqual(originalOrder);
    });

    test("should handle reordering first item to last", () => {
      store.reorderItems(0, 3);

      expect(store.items.map((i) => i.id)).toEqual(["2", "3", "4", "1"]);
    });

    test("should handle reordering last item to first", () => {
      store.reorderItems(3, 0);

      expect(store.items.map((i) => i.id)).toEqual(["4", "1", "2", "3"]);
    });

    test("should handle invalid fromIndex gracefully", () => {
      const originalOrder = store.items.map((i) => i.id);
      store.reorderItems(10, 2);

      expect(store.items.map((i) => i.id)).toEqual(originalOrder);
    });

    test("should handle negative indices gracefully", () => {
      const originalOrder = store.items.map((i) => i.id);
      store.reorderItems(-1, 2);

      // The behavior with negative indices depends on splice implementation
      // This test ensures it doesn't crash
      expect(store.items.length).toBe(4);
    });
  });

  describe("Reactivity", () => {
    test("filteredItems should react to changes in items", () => {
      const filteredItemsValues = [];
      const dispose = reaction(
        () => store.filteredItems,
        (items) => filteredItemsValues.push(items.length)
      );

      store.addItem();

      expect(filteredItemsValues[0]).toBe(2);
      dispose();
    });

    test("filteredItems should react to filter changes", () => {
      store.items = [
        { id: "1", name: "Item 1", status: "incomplete", tags: ["work"] },
        { id: "2", name: "Item 2", status: "complete", tags: ["personal"] },
      ];

      const filteredItemsValues = [];
      const dispose = reaction(
        () => store.filteredItems.length,
        (count) => filteredItemsValues.push(count)
      );

      store.setFilterStatus("complete");

      expect(filteredItemsValues[0]).toBe(1);
      dispose();
    });

    test("allTags should react to tag changes", () => {
      const allTagsValues = [];
      const dispose = reaction(
        () => store.allTags,
        (tags) => allTagsValues.push(tags.length)
      );

      const itemId = store.items[0].id;
      store.addTag(itemId, "urgent");

      expect(allTagsValues[0]).toBe(1);
      dispose();
    });
  });

  describe("Edge Cases", () => {
    test("should handle operations on empty store", () => {
      store.items = [];

      expect(store.filteredItems).toHaveLength(0);
      expect(store.activeItems).toHaveLength(0);
      expect(store.completedItems).toHaveLength(0);
      expect(store.allTags).toHaveLength(0);
      expect(store.itemCount).toBe(0);
    });

    test("should handle items with special characters in names", () => {
      const itemId = store.items[0].id;
      const specialName = "Test <script>alert('xss')</script>";

      store.setItemName(itemId, specialName);
      expect(store.items[0].name).toBe(specialName);
    });

    test("should handle very long tag names", () => {
      const itemId = store.items[0].id;
      const longTag = "a".repeat(1000);

      store.addTag(itemId, longTag);
      expect(store.items[0].tags).toContain(longTag);
    });

    test("should handle many items efficiently", () => {
      // Add 100 items
      for (let i = 0; i < 100; i++) {
        store.addItem();
      }

      expect(store.itemCount).toBe(101); // 1 initial + 100 new
      expect(store.filteredItems).toHaveLength(101);
    });
  });
});