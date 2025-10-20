Kanban Demo App
by Paul Luscher
October 2025

Coded by me using VS Code, React, and Node.

Dependencies
________________________________

npm / node

npm version used: 10.9.3
npm --version

node version used: v22.20.0
node -v

To Install
________________________________

From the level where package.json is found, run:

npm install

Then a node_modules folder should appear at the same level as package.json

To Start
________________________________

npm start

A new browser window should open at: http://localhost:3000



Kanban Board
________________________________

The board is data driven by JSON in the /public/cards.json file 
This could be called from an API as well.

Features Include:

- Searching by Text
    This narrows the visible cards to reflect matches in either the title or the description

- Filter by Type Selector
    Cards of a certain type may be shown by selecting a type from the filter. Select All to reset the view.

- Drag & Drop
    Reorder Cards to show priority by moving them up and down within a column or or change status by dragging them to another column. If the card is dropped into the "Done" column some confetti appears on screen

- Add New Cards
    A new card can be added by clicking the + on any column. This shows one or more new cards with a default type and empty title and description fields. Enter a title and description and select a type then click Save or Cancel. Cards in edit may not be dragged around. Background colors change based on card type.

- Edit Cards
    Click on the pencil to edit a card. Title, Description and type may be changed as in Add New mode, and then click Save or Cancel.

- Delete Cards
    Click the X in the upper right corner of any card to delete it

Possible future features
________________________________

- Date picker and date field for each card in Add and Edit mode for target date
- Stored created date
- A Calendar view to show cards by date
- An Assignee name feature, for a mangerial overview mode
- Multi-user viewing and editing permissions mapping

Optimizatons
________________________________

    - Save cards to API service. JS Object structure is already maintained and could be converted directly to JSON and Saved to a service as updates or an entire list.
    - Make some dropdowns data driven
    - Give warning upon deletion
    - Test coverage
    - Other improvements and enhancements
  
  
  
