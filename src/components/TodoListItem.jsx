import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import styled from "styled-components";

const ListItem = styled.li`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 5px;
  transition: background-color 0.3s ease, transform 0.3s ease;

  &:hover {
    background-color: #f1f1f1;
  }
`;

const ItemTop = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const StatusIndicator = styled.div`
  width: 20px;
  height: 20px;
  background-color: ${(props) => props.statusColor};
  margin-right: 10px;
  border-radius: 50%;
  transition: background-color 0.5s ease;
`;

const Select = styled.select`
  margin-right: 10px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Title = styled.input`
  flex-grow: 1;
  margin-right: 10px;
  padding: 5px;
  border: 1px solid transparent;
  border-radius: 5px;
  background-color: transparent;
  transition: border 0.3s ease;
  font-weight: bold;
  font-size: 16px;

  &:hover,
  &:focus {
    border: 1px solid #ccc;
    background-color: #fff;
  }
`;

const TagInput = styled.input`
  flex-grow: 1;
  margin-right: 10px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Button = styled.button`
  color: #fff;
  background-color: #1d73a5;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  margin-right: 10px;
  transition: background-color 0.3s ease;

  :hover {
    background-color: #174277;
  }
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
`;

const Tag = styled.span`
  display: inline-block;
  background-color: #e0e0e0;
  border-radius: 3px;
  padding: 2px 5px;
  margin-right: 5px;
  margin-bottom: 5px;
`;

const TagButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 5px;
`;

const TagInputWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
`;

const TodoListItem = observer(({ item, store, getStatusColor }) => {
  const [newTag, setNewTag] = useState("");

  const handleStatusChange = (newStatus) => {
    store.setStatus(item.id, newStatus);
    toast.success("Item status updated successfully!");
  };

  const handleDeleteItem = () => {
    store.setDeleted(item.id);
    toast.success("Item deleted successfully!");
  };

  const handleItemNameChange = (e) => {
    store.setItemName(item.id, e.target.value);
  };

  const handleItemNameBlur = () => {
    if (item.name.trim() === "") {
      toast.error("Item name cannot be empty!");
      return;
    }
    toast.success("Item name updated successfully!");
  };

  const handleAddTag = () => {
    if (newTag.trim() === "") {
      toast.error("Tag cannot be empty!");
      return;
    }
    if (item.tags.includes(newTag.trim())) {
      toast.error("Tag already exists!");
      return;
    }
    store.addTag(item.id, newTag.trim());
    setNewTag("");
    toast.success("Tag added successfully!");
  };

  const handleRemoveTag = (tag) => {
    store.removeTag(item.id, tag);
    toast.success("Tag removed successfully!");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <ListItem>
      <ItemTop>
        <StatusIndicator statusColor={getStatusColor(item.status)} />
        <Select
          value={item.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          aria-label="Status"
        >
          <option value="incomplete">Incomplete</option>
          <option value="in-progress">In Progress</option>
          <option value="complete">Complete</option>
        </Select>
        <Title
          onChange={handleItemNameChange}
          onBlur={handleItemNameBlur}
          value={item.name}
          aria-label="Item Name"
        />
        <Button onClick={handleDeleteItem} aria-label="Delete Item">
          Delete
        </Button>
      </ItemTop>
      <Tags>
        {item.tags.map((tag) => (
          <Tag key={tag}>
            {tag}
            <TagButton
              onClick={() => handleRemoveTag(tag)}
              aria-label={`Remove ${tag} tag`}
            >
              x
            </TagButton>
          </Tag>
        ))}
      </Tags>
      <TagInputWrapper>
        <TagInput
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Add tag"
          aria-label="Add a new tag"
        />
        <Button onClick={handleAddTag} aria-label="Add Tag">
          Add Tag
        </Button>
      </TagInputWrapper>
    </ListItem>
  );
});

export default TodoListItem;
