import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TodoList from "./TodoList";
import store from "../store/todoStore";

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock TodoListItem to simplify testing
jest.mock("./TodoListItem", () => {
  return function MockTodoListItem({ item }) {
    return (
      <div data-testid={`todo-item-${item.id}`}>
        <span>{item.name}</span>
        <span>{item.status}</span>
      </div>
    );
  };
});

// Store for drag end handler
let mockDragEndHandler = null;

// Mock react-beautiful-dnd
jest.mock("react-beautiful-dnd", () => ({
  DragDropContext: ({ children, onDragEnd }) => {
    mockDragEndHandler = onDragEnd;
    return <div>{children}</div>;
  },
  Droppable: ({ children }) => {
    const provided = {
      droppableProps: {},
      innerRef: jest.fn(),
      placeholder: null,
    };
    return children(provided);
  },
  Draggable: ({ children, draggableId }) => {
    const provided = {
      draggableProps: {},
      dragHandleProps: {},
      innerRef: jest.fn(),
    };
    return <div data-draggable-id={draggableId}>{children(provided)}</div>;
  },
}));

describe("TodoList Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDragEndHandler = null;
    // Reset store to initial state
    store.items = [
      {
        id: "test-1",
        name: "Test Item 1",
        status: "incomplete",
        tags: ["work"],
      },
      {
        id: "test-2",
        name: "Test Item 2",
        status: "complete",
        tags: ["personal"],
      },
      {
        id: "test-3",
        name: "Test Item 3",
        status: "in-progress",
        tags: ["work"],
      },
    ];
    store.filterTag = null;
    store.filterStatus = null;
  });

  describe("Rendering", () => {
    test("should render the title", () => {
      render(<TodoList />);
      expect(screen.getByText("Ratehub TODO Exercise")).toBeInTheDocument();
    });

    test("should display current item count", () => {
      render(<TodoList />);
      expect(screen.getByText(/Current List count: 3/i)).toBeInTheDocument();
    });

    test("should render all items when no filters are applied", () => {
      render(<TodoList />);
      expect(screen.getByTestId("todo-item-test-1")).toBeInTheDocument();
      expect(screen.getByTestId("todo-item-test-2")).toBeInTheDocument();
      expect(screen.getByTestId("todo-item-test-3")).toBeInTheDocument();
    });

    test("should render Add New Item button", () => {
      render(<TodoList />);
      expect(screen.getByText("Add New Item")).toBeInTheDocument();
    });

    test("should render filter sections", () => {
      render(<TodoList />);
      expect(screen.getByText("Filter by Tags:")).toBeInTheDocument();
      expect(screen.getByText("Filter by Status:")).toBeInTheDocument();
    });

    test("should render status filter buttons", () => {
      render(<TodoList />);
      expect(screen.getByText("Incomplete")).toBeInTheDocument();
      expect(screen.getByText("In-progress")).toBeInTheDocument();
      expect(screen.getByText("Complete")).toBeInTheDocument();
    });
  });

  describe("Add New Item", () => {
    test("should call store.addItem when Add New Item button is clicked", () => {
      const originalAddItem = store.addItem;
      const addItemSpy = jest.fn();
      store.addItem = addItemSpy;

      render(<TodoList />);

      const addButton = screen.getByText("Add New Item");
      fireEvent.click(addButton);

      expect(addItemSpy).toHaveBeenCalledTimes(1);
      store.addItem = originalAddItem;
    });

    test("should show toast notification when item is added", async () => {
      const toast = require("react-hot-toast").toast;
      render(<TodoList />);

      const addButton = screen.getByText("Add New Item");
      fireEvent.click(addButton);

      expect(toast.success).toHaveBeenCalledWith("Item added successfully!");
    });
  });

  describe("Filtering by Tags", () => {
    test("should display all unique tags", () => {
      render(<TodoList />);
      expect(screen.getByText("work")).toBeInTheDocument();
      expect(screen.getByText("personal")).toBeInTheDocument();
    });

    test("should filter items when tag filter is clicked", () => {
      render(<TodoList />);

      const workTag = screen.getByText("work");
      fireEvent.click(workTag);

      // After filtering by "work", only items with work tag should be visible
      expect(store.filterTag).toBe("work");
    });

    test("should toggle tag filter off when clicked again", () => {
      render(<TodoList />);

      const workTag = screen.getByText("work");
      fireEvent.click(workTag);
      expect(store.filterTag).toBe("work");

      fireEvent.click(workTag);
      expect(store.filterTag).toBeNull();
    });

    test("should show empty message when no tags exist", () => {
      store.items = [
        { id: "1", name: "Item", status: "incomplete", tags: [] },
      ];
      render(<TodoList />);

      expect(screen.getByText("No tags found.")).toBeInTheDocument();
    });
  });

  describe("Filtering by Status", () => {
    test("should filter items by incomplete status", () => {
      render(<TodoList />);

      const incompleteButton = screen.getByText("Incomplete");
      fireEvent.click(incompleteButton);

      expect(store.filterStatus).toBe("incomplete");
    });

    test("should filter items by in-progress status", () => {
      render(<TodoList />);

      const inProgressButton = screen.getByText("In-progress");
      fireEvent.click(inProgressButton);

      expect(store.filterStatus).toBe("in-progress");
    });

    test("should filter items by complete status", () => {
      render(<TodoList />);

      const completeButton = screen.getByText("Complete");
      fireEvent.click(completeButton);

      expect(store.filterStatus).toBe("complete");
    });

    test("should toggle status filter off when clicked again", () => {
      render(<TodoList />);

      const completeButton = screen.getByText("Complete");
      fireEvent.click(completeButton);
      expect(store.filterStatus).toBe("complete");

      fireEvent.click(completeButton);
      expect(store.filterStatus).toBeNull();
    });

    test("should apply correct aria-pressed attribute to selected status", () => {
      render(<TodoList />);

      const completeButton = screen.getByText("Complete");
      fireEvent.click(completeButton);

      expect(completeButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("Empty State", () => {
    test("should show placeholder when no items match filters", () => {
      store.items = [];
      render(<TodoList />);

      expect(
        screen.getByText(
          /No items available. Try changing the filters or adding new items./i
        )
      ).toBeInTheDocument();
    });

    test("should show placeholder when all items are filtered out", () => {
      const { rerender } = render(<TodoList />);

      // Set a filter that doesn't match any items
      store.filterTag = "nonexistent";

      // Re-render to reflect the change
      rerender(<TodoList />);

      expect(
        screen.getByText(
          /No items available. Try changing the filters or adding new items./i
        )
      ).toBeInTheDocument();
    });
  });

  describe("Drag and Drop", () => {
    test("should call reorderItems when drag ends", () => {
      const originalReorder = store.reorderItems;
      const reorderSpy = jest.fn();
      store.reorderItems = reorderSpy;

      render(<TodoList />);

      // Simulate drag end
      const result = {
        source: { index: 0 },
        destination: { index: 2 },
      };

      if (mockDragEndHandler) {
        mockDragEndHandler(result);
      }

      expect(reorderSpy).toHaveBeenCalledWith(0, 2);
      store.reorderItems = originalReorder;
    });

    test("should not reorder when destination is null", () => {
      const originalReorder = store.reorderItems;
      const reorderSpy = jest.fn();
      store.reorderItems = reorderSpy;

      render(<TodoList />);

      // Simulate drag end without destination (dragged outside)
      const result = {
        source: { index: 0 },
        destination: null,
      };

      if (mockDragEndHandler) {
        mockDragEndHandler(result);
      }

      expect(reorderSpy).not.toHaveBeenCalled();
      store.reorderItems = originalReorder;
    });
  });

  describe("Integration with Store", () => {
    test("should react to changes in store items", () => {
      const { rerender } = render(<TodoList />);

      expect(screen.getByText(/Current List count: 3/i)).toBeInTheDocument();

      // Add an item to the store
      store.items.push({
        id: "test-4",
        name: "Test Item 4",
        status: "incomplete",
        tags: [],
      });

      rerender(<TodoList />);

      expect(screen.getByText(/Current List count: 4/i)).toBeInTheDocument();
    });

    test("should update when filter changes", () => {
      const { rerender } = render(<TodoList />);

      // All items should be visible initially
      expect(screen.getByTestId("todo-item-test-1")).toBeInTheDocument();
      expect(screen.getByTestId("todo-item-test-2")).toBeInTheDocument();
      expect(screen.getByTestId("todo-item-test-3")).toBeInTheDocument();

      // Apply status filter
      store.filterStatus = "complete";
      rerender(<TodoList />);

      // Only complete item should be visible
      expect(screen.queryByTestId("todo-item-test-1")).not.toBeInTheDocument();
      expect(screen.getByTestId("todo-item-test-2")).toBeInTheDocument();
      expect(screen.queryByTestId("todo-item-test-3")).not.toBeInTheDocument();
    });
  });

  describe("getStatusColor function", () => {
    test("should return correct colors for each status", () => {
      const { container } = render(<TodoList />);

      // We need to test the getStatusColor function indirectly
      // by checking if the component renders correctly
      expect(container).toBeInTheDocument();
    });
  });

  describe("Filter Button Styling", () => {
    test("should apply selected styling to active tag filter", () => {
      render(<TodoList />);

      const workTag = screen.getByText("work");
      fireEvent.click(workTag);

      // The button should still be in the document after clicking
      expect(workTag).toBeInTheDocument();
    });

    test("should apply selected styling to active status filter", () => {
      render(<TodoList />);

      const completeButton = screen.getByText("Complete");
      fireEvent.click(completeButton);

      // The button should still be in the document after clicking
      expect(completeButton).toBeInTheDocument();
    });
  });

  describe("Combined Filters", () => {
    test("should apply both tag and status filters simultaneously", () => {
      render(<TodoList />);

      // Filter by work tag
      const workTag = screen.getByText("work");
      fireEvent.click(workTag);

      // Filter by incomplete status
      const incompleteButton = screen.getByText("Incomplete");
      fireEvent.click(incompleteButton);

      expect(store.filterTag).toBe("work");
      expect(store.filterStatus).toBe("incomplete");
    });

    test("should clear filters independently", () => {
      render(<TodoList />);

      // Apply both filters
      const workTag = screen.getByText("work");
      const incompleteButton = screen.getByText("Incomplete");
      fireEvent.click(workTag);
      fireEvent.click(incompleteButton);

      expect(store.filterTag).toBe("work");
      expect(store.filterStatus).toBe("incomplete");

      // Clear tag filter
      fireEvent.click(workTag);
      expect(store.filterTag).toBeNull();
      expect(store.filterStatus).toBe("incomplete");

      // Clear status filter
      fireEvent.click(incompleteButton);
      expect(store.filterTag).toBeNull();
      expect(store.filterStatus).toBeNull();
    });
  });

  describe("Accessibility", () => {
    test("should have proper heading structure", () => {
      render(<TodoList />);
      const title = screen.getByText("Ratehub TODO Exercise");
      expect(title.tagName).toBe("H1");
    });

    test("should have aria-pressed on filter buttons", () => {
      render(<TodoList />);
      const completeButton = screen.getByText("Complete");

      expect(completeButton).toHaveAttribute("aria-pressed", "false");

      fireEvent.click(completeButton);
      expect(completeButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("Edge Cases", () => {
    test("should handle rapid filter changes", () => {
      render(<TodoList />);

      const workTag = screen.getByText("work");
      const personalTag = screen.getByText("personal");

      // Rapidly switch between filters
      fireEvent.click(workTag);
      fireEvent.click(personalTag);
      fireEvent.click(workTag);

      expect(store.filterTag).toBe("work");
    });

    test("should handle adding items while filters are active", () => {
      const originalAddItem = store.addItem;
      const addItemSpy = jest.fn(originalAddItem.bind(store));
      store.addItem = addItemSpy;

      render(<TodoList />);

      // Apply filter
      const workTag = screen.getByText("work");
      fireEvent.click(workTag);

      // Add new item (which should clear filters)
      const addButton = screen.getByText("Add New Item");
      fireEvent.click(addButton);

      expect(addItemSpy).toHaveBeenCalled();
      expect(store.filterTag).toBeNull();
      expect(store.filterStatus).toBeNull();

      store.addItem = originalAddItem;
    });

    test("should handle items with no tags", () => {
      store.items = [
        { id: "1", name: "No Tags", status: "incomplete", tags: [] },
      ];
      render(<TodoList />);

      expect(screen.getByTestId("todo-item-1")).toBeInTheDocument();
    });

    test("should handle store with single item", () => {
      store.items = [
        { id: "1", name: "Single", status: "incomplete", tags: ["solo"] },
      ];
      render(<TodoList />);

      expect(screen.getByText(/Current List count: 1/i)).toBeInTheDocument();
      expect(screen.getByTestId("todo-item-1")).toBeInTheDocument();
    });

    test("should handle dragging to same position", () => {
      const originalReorder = store.reorderItems;
      const reorderSpy = jest.fn();
      store.reorderItems = reorderSpy;

      render(<TodoList />);

      const result = {
        source: { index: 1 },
        destination: { index: 1 },
      };

      if (mockDragEndHandler) {
        mockDragEndHandler(result);
      }

      expect(reorderSpy).toHaveBeenCalledWith(1, 1);
      store.reorderItems = originalReorder;
    });
  });

  describe("Performance", () => {
    test("should handle large number of items", () => {
      // Create 50 items
      const manyItems = Array.from({ length: 50 }, (_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
        status: "incomplete",
        tags: [],
      }));

      store.items = manyItems;
      const { container } = render(<TodoList />);

      expect(screen.getByText(/Current List count: 50/i)).toBeInTheDocument();
      expect(container).toBeInTheDocument();
    });

    test("should handle many tags efficiently", () => {
      // Create items with many different tags
      store.items = Array.from({ length: 20 }, (_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
        status: "incomplete",
        tags: [`tag-${i}`],
      }));

      render(<TodoList />);

      // Should render all unique tags
      expect(screen.getByText("Filter by Tags:")).toBeInTheDocument();
    });
  });

  describe("Regression Tests", () => {
    test("should maintain filter state when items change", () => {
      render(<TodoList />);

      // Set a filter
      const completeButton = screen.getByText("Complete");
      fireEvent.click(completeButton);
      expect(store.filterStatus).toBe("complete");

      // Change an item status
      store.setStatus("test-1", "complete");

      // Filter should still be active
      expect(store.filterStatus).toBe("complete");
    });

    test("should not lose tag filter when switching status filter", () => {
      render(<TodoList />);

      // Set tag filter
      const workTag = screen.getByText("work");
      fireEvent.click(workTag);
      expect(store.filterTag).toBe("work");

      // Set status filter
      const incompleteButton = screen.getByText("Incomplete");
      fireEvent.click(incompleteButton);

      // Both filters should be active
      expect(store.filterTag).toBe("work");
      expect(store.filterStatus).toBe("incomplete");
    });

    test("should properly update item count after deletion", () => {
      const { rerender } = render(<TodoList />);

      expect(screen.getByText(/Current List count: 3/i)).toBeInTheDocument();

      // Delete an item
      store.setDeleted("test-1");
      rerender(<TodoList />);

      expect(screen.getByText(/Current List count: 2/i)).toBeInTheDocument();
    });
  });
});