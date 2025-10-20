import React, { useState } from "react";
import "../styles.css";
import KanbanColumn from "./KanbanColumn";

export default function KanbanColumns({columns, cardTypes, removeCard, addCard, handleEdit, startDrag, moveDrag}) {

  return (
    <div>
      <div className="kanban-columns">
        {columns.map((column) => (
          <KanbanColumn id={column.key} key={column.key} status={column.status} name={column.name} columnCards={column.cardData} cardTypes={cardTypes} removeCard={removeCard} addCard={addCard} handleEdit={handleEdit} startDrag={startDrag} moveDrag={moveDrag}></KanbanColumn>
        ))}
      </div>
    </div>
  );
}
