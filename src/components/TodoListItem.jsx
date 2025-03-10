import React from 'react'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'


function TodoListItem({ className, name, onComplete, onChange }) {
    return (
        <li className={className}>
            <button onClick={onComplete}>Done?</button>
            <input onChange={onChange} value={name} />
        </li>
    )
}

export default styled(observer(TodoListItem))`
    color: red;
`
