import { observer } from "mobx-react-lite";
import React from "react";
import { toast } from "react-hot-toast";
import styled from "styled-components";
import store from "../store/todoStore";
import TodoListItem from "./TodoListItem";

const Title = styled.h1`
  font-size: 3rem;
  color: #000;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ListWrapper = styled.div`
  width: 60%;
`;

const ListTitle = styled.h2`
  text-align: center;
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
  background-color: ${(props) => (props.selected ? "#00aaf8" : "#ccc")};
  color: #fff;
  padding: 10px 20px;
  border-radius: 5%;
  border: none;
  cursor: pointer;
  margin: 5px;
`;

const TodoList = observer(() => {
  const handleAddItem = () => {
    store.addItem();
    toast.success("Item added successfully!");
  };

  return (
    <Wrapper>
      <header>
        <Title>Ratehub TODO Exercise</Title>
      </header>
      <ListWrapper>
        <ListTitle>Todo Items</ListTitle>
        <ul>
          {store.filteredItems.map((item) => (
            <TodoListItem key={item.id} item={item} store={store} />
          ))}
        </ul>
        <ButtonWrapper>
          <NewItemButton onClick={handleAddItem}>Add New Item</NewItemButton>
        </ButtonWrapper>
      </ListWrapper>
      <Footer>
        <FilterGroup>
          <h3>Filter by Tags:</h3>
          {store.allTags.map((tag) => (
            <FilterButton
              key={tag}
              onClick={() => store.setFilterTag(tag)}
              selected={store.filterTag === tag}
            >
              {tag}
            </FilterButton>
          ))}
          <FilterButton
            onClick={() => store.setFilterTag(null)}
            selected={store.filterTag === null}
          >
            Clear Filter
          </FilterButton>
        </FilterGroup>
        <FilterGroup>
          <h3>Filter by Status:</h3>
          <FilterButton
            onClick={() => store.setFilterStatus("incomplete")}
            selected={store.filterStatus === "incomplete"}
          >
            Incomplete
          </FilterButton>
          <FilterButton
            onClick={() => store.setFilterStatus("in-progress")}
            selected={store.filterStatus === "in-progress"}
          >
            In Progress
          </FilterButton>
          <FilterButton
            onClick={() => store.setFilterStatus("complete")}
            selected={store.filterStatus === "complete"}
          >
            Complete
          </FilterButton>
          <FilterButton
            onClick={() => store.setFilterStatus(null)}
            selected={store.filterStatus === null}
          >
            Clear Status Filter
          </FilterButton>
        </FilterGroup>
      </Footer>
    </Wrapper>
  );
});

export default TodoList;
