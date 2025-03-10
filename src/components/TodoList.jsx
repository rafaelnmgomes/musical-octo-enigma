import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { observable } from 'mobx';
import { v4 as uuid} from 'uuid';

import TodoListItem from './TodoListItem'


function TodoList({ className }) {
    const [ store ] = useState(createTodoStore);

    return (
        <div className={className}>
            <header>
                <h1 className="title">Ratehub TODO Exercise</h1>
            </header>
            <section>
                <ul>
                    {store.activeItems.map(item => (
                        <TodoListItem
                            key={item.id}
                            name={item.name}
                            isComplete={item.isComplete}
                            onComplete={() => store.setCompleted(item.id)}
                            onChange={(e) => store.setItemName(item.id, e.target.value)}
                        />
                    ))}
                </ul>
                <button onClick={store.addItem}>
                    Add New Item
                </button>
            </section>
            <footer>
                <h2 className="completedTitle">List of Complete Items</h2>
                <ul>
                    {store.completedItems.map(item => (
                        <li key={item.id}>
                            {item.name}
                        </li>
                    ))}
                </ul>
            </footer>
        </div>
    )
}

function createTodoStore() {
    const self = observable({
        items: [{
            id: uuid(),
            name: "Sample item",
            isComplete: false,
        }],

        get activeItems() {
            return self.items.filter(i => !i.isComplete);
        },
        get completedItems() {
            return self.items.filter(i => i.isComplete);
        },

        addItem() {
            self.items.push({
                id: uuid(),
                name: `Item ${self.items.length}`,
            });
        },
        setItemName(id, name) {
            const item = self.items.find(i => i.id === id);
            item.name = name;
        },
        setCompleted(id) {
            const item = self.items.find(i => i.id === id);
            item.isComplete = true;
        },
    })

    return self;
}

export default styled(observer(TodoList))`
    background-color: lightgray;

    .title {
        color: orange;
    }
`
