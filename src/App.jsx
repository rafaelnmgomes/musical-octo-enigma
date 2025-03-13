import React from "react";
import ReactDOM from "react-dom";
import { Toaster } from "react-hot-toast";
import { createGlobalStyle } from "styled-components";
import TodoList from "./components/TodoList";

const GlobalStyle = createGlobalStyle`
  body {
    font-family: Gordita, sans-serif;
    margin: 0;
    }
    `;

// Get the container element to render into.
const container = document.getElementById("react-root");

// Render the TODO list into the DOM
ReactDOM.render(
  <>
    <GlobalStyle />
    <Toaster />
    <TodoList />
  </>,
  container
);
