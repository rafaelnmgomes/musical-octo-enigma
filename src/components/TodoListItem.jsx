import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import styled from "styled-components";

const getStatusColor = (status) => {
  switch (status) {
    case "incomplete":
      return "#f44336";
    case "in-progress":
      return "#ff9800";
    case "complete":
      return "#4caf50";
    default:
      return "#ccc";
  }
};

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
  background-color: ${(props) => getStatusColor(props.status)};
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

const Input = styled.input`
  flex-grow: 1;
  margin-right: 10px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Button = styled.button`
  color: #fff;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  margin-right: 10px;
  transition: background-color 0.3s ease;
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

const TodoListItem = observer(({ item, store }) => {
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

  return (
    <ListItem>
      <ItemTop>
        <StatusIndicator status={item.status} />
        <Select
          value={item.status}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="incomplete">Incomplete</option>
          <option value="in-progress">In Progress</option>
          <option value="complete">Complete</option>
        </Select>
        <Input
          onChange={handleItemNameChange}
          onBlur={handleItemNameBlur}
          value={item.name}
        />
        <Button onClick={handleDeleteItem}>Delete</Button>
      </ItemTop>
      <Tags>
        {item.tags.map((tag) => (
          <Tag key={tag}>
            {tag} <TagButton onClick={() => handleRemoveTag(tag)}>x</TagButton>
          </Tag>
        ))}
      </Tags>
      <TagInputWrapper>
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add tag"
        />
        <Button onClick={handleAddTag}>Add Tag</Button>
      </TagInputWrapper>
    </ListItem>
  );
});

export default TodoListItem;
