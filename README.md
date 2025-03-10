# Ratehub Frontend Exercise

## What is this?

A simple TODO list exercise to demonstrate understanding of the following libraries:
- `React` for rendering
- `styled-components` for styling
- `mobx` for observable state

## Guidelines
1. Unless otherwise noted, the UX/details for achieving the requirements is up to you. Use your best judgement.
1. Feel free to read up on documentation and tutorials for any of the libraries you're not familiar with.
1. If there's a library you're aware of that feels like it fits really well into the exercise, feel free. Don't fundamentally change or work-around the requirements though!
1. If you have questions, feel free to ask.

## Requirements
1. Allow the user to remove items.
1. Add some styling to the application.
    - Simple styling is fine; don't go overboard.
    - Try to add some transition/animation effects; nothing flashy, simple is better.
    - We are looking for fundamental understanding of modern CSS, not a designer's eye.
1. Add an additional status of "in progress":
    - instead of transitioning from incomplete -> complete, they must transition through this new state.
    - the user needs to be allowed to also transition back from "in progress" to "incomplete".
    - how the user will transition states is up to you; simple/obvious is fine
    - how to show the status is up to you
1. Allow the user to add and remove todo item "tags":
    - *Example:* if I create a todo item with the text "Contact candidates to explain the coding exercise", I might want to add a couple tags like "Hiring" and "Urgent".
    - How this is interacted with and displayed is up to you.
1. Allow all items to be filtered by "tags":
    - Add an additional row of filter buttons to the footer, which contains the unique set of "tags" which have been added.
    - Allow the user to click on an "tag" in this footer section to filter all of the incomplete, in progress and completed todos.
    - *Continuation of previous example:* once I've added "Urgent", and "Hiring" tags to one or more items, I should see two new filter buttons (one for "Urgent", one for "Hiring") and when I click one of these buttons it should filter the list of todos (complete, incomplete and in progress) to only those with the corresponding tag.


## How to Use
1. clone the repository
1. `npm install`
1. `npm start` which will start a `webpack-dev-server` configured to show the exercise
    * It should automatically open your browser to the correct page
    * If it does not open automatically, open your browser to `http://localhost:3000`

## Submission

Please fork this repository on Github and include a link to it in your submission.
