import "../styles.css";
import KanbanCard from "./KanbanCard";

export default function KanbanColumn({id, name, status, columnCards, cardTypes, removeCard, addCard, handleEdit, startDrag, moveDrag}) {

  // iterate card data given into this column
  const addNewCard = (e) => {
    addCard(status);
  };

  return (
      <div className="kanban-column">
           <div id={id} className="kanban-column-title">{name}
              <button className="kanban-add-new-card" aria-label="Add New Card" onClick={addNewCard} title="Add New Card">+</button>
           </div>
            {columnCards.map((cardData) => (
              <KanbanCard id={cardData.key} key={cardData.key} cardData={cardData} cardTypes={cardTypes} removeCard={removeCard} handleEdit={handleEdit} startDrag={startDrag} moveDrag={moveDrag}></KanbanCard>
            ))}
            <div id={`drop-location-last-${status}`} className="card-drop-location card-drop-location-last"></div>
      </div>
  );
}
