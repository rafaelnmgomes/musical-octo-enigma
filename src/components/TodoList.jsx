import { observer } from "mobx-react-lite";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { toast } from "react-hot-toast";
import styled from "styled-components";
import store from "../store/todoStore";
import TodoListItem from "./TodoListItem";

const Title = styled.h1`
  font-size: 3rem;
  color: #000;
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 20px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ListWrapper = styled.div`
  width: 60%;
`;

const NewItemButton = styled.button`
  background-color: #4caf50;
  color: #fff;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  border-radius: 5%;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const Footer = styled.footer`
  max-width: 80%;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: space-around;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  background-color: ${(props) =>
    props.selected ? getStatusColor(props.status) : "#ccc"};
  color: #fff;
  padding: 10px 20px;
  border-radius: 5%;
  border: none;
  cursor: pointer;
  margin: 5px;
`;

const Empty = styled.p`
  margin-left: 20px;
  text-align: center;
`;

const Placeholder = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px;
`;

const getStatusColor = (status) => {
  switch (status) {
    case "incomplete":
      return "#f44336";
    case "in-progress":
      return "#ff9800";
    case "complete":
      return "#4caf50";
    default:
      return "#1d73a5";
  }
};

const TodoList = observer(() => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleAddItem = () => {
    store.addItem();
    toast.success("Item added successfully!");
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    store.reorderItems(result.source.index, result.destination.index);
  };

    // Filter the items based on the search query (title, description, tags)
    const displayedItems = React.useMemo(() => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return store.filteredItems;
      return store.filteredItems.filter((item) => {
        const title = (item.title || "").toLowerCase();
        const desc = (item.description || "").toLowerCase();
        const tags = Array.isArray(item.tags) ? item.tags.join(" ").toLowerCase() : "";
        return (
          title.includes(q) ||
          desc.includes(q) ||
          tags.includes(q)
        );
      });
    }, [searchQuery, store.filteredItems]);

  return (
    <Wrapper>
      <header>
        <Title>Ratehub TODO Exercise</Title>
        <Subtitle>Current List count: {displayedItems.length}</Subtitle>
      </header>
      <ListWrapper>
      <input
          type="text"
          placeholder="Search by title, description, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search todos"
          style={{ width: "100%", padding: "10px", marginBottom: "12px" }}
        />
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="todo-list">
            {(provided) => (
              <List {...provided.droppableProps} ref={provided.innerRef}>
                {displayedItems.length === 0 ? (
                  <Placeholder>
                    No items available. Try changing the filters or adding new
                    items.
                  </Placeholder>
                ) : (
                  displayedItems.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <TodoListItem
                            item={item}
                            store={store}
                            getStatusColor={getStatusColor}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
        <ButtonWrapper>
          <NewItemButton onClick={handleAddItem}>Add New Item</NewItemButton>
        </ButtonWrapper>
      </ListWrapper>
      <Footer>
        <FilterGroup>
          <h3>Filter by Tags:</h3>
          {store.allTags.length === 0 && <Empty>No tags found.</Empty>}
          {store.allTags.map((tag) => (
            <FilterButton
              key={tag}
              onClick={() => store.setFilterTag(tag)}
              selected={store.filterTag === tag}
            >
              {tag}
            </FilterButton>
          ))}
        </FilterGroup>
        <FilterGroup>
          <h3>Filter by Status:</h3>
          {["incomplete", "in-progress", "complete"].map((status) => (
            <FilterButton
              key={status}
              onClick={() => store.setFilterStatus(status)}
              selected={store.filterStatus === status}
              status={status}
              aria-pressed={store.filterStatus === status}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </FilterButton>
          ))}
        </FilterGroup>
      </Footer>
    </Wrapper>
  );
});

export default TodoList;
