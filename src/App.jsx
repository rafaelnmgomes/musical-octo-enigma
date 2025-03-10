import React from 'react';
import ReactDOM from 'react-dom';

import TodoList from "./components/TodoList";


// Get the container element to render into.
const container = document.getElementById('react-root');

// Render the TODO list into the DOM
ReactDOM.render( <TodoList/>,  container);
