import React from "react";
import "../styles.css";

export default function KanbanCard({ cardData, cardTypes, removeCard, handleEdit, startDrag }) {

  // todo: make select data driven
  const tempCardData = cardData;
  const cardType = cardTypes.find((ct) => ct.type === cardData.type);
  const handleClose = (e) => {
    removeCard(cardData.key);
  };

  const editCard = (e) => {
    handleEdit(cardData, "edit");
  };

  const cancelEdit = (e) => {
    if (!tempCardData.new) {
      handleEdit(cardData, "cancelEdit");
    } else {
      handleEdit(cardData, "cancel");
    }
  };

  const saveEdit = (e) => {
    tempCardData.editMode = false;
    handleEdit(tempCardData, "save");
  };

  const handleTitleChange = (e) => {
    tempCardData.title = e.target.value;
  };
  const handleDescChange = (e) => {
    tempCardData.desc = e.target.value;    
  };

  const handleTypeChange  = (e) => {
    tempCardData.type = e.target.value;
    handleEdit(tempCardData, "update");
  };

  if (cardData.editMode) {
    return (
      <div>
        <div className={`card-detail ${tempCardData.type}-type`}>
          <div className="card-title">
            <div className="card-edit-label">Title</div>
            <input
              type="text"
              className="card-title-input"
              placeholder="Enter Title"
              defaultValue={tempCardData.title}
              onChange={handleTitleChange}
            />
          </div>
          <div className="card-type-edit">
            <div className="card-type-edit-label">Select Type</div>
            <select className="type-dropdown" defaultValue={tempCardData.type} onChange={handleTypeChange}>
                <option value="design">Design</option>
                <option value="ui">UI</option>
                <option value="ux">UX</option>
                <option value="server">Server</option>
                <option value="bug">Bug</option>
                <option value="mocks">Mocks</option>
                <option value="docs">Docs</option>
                <option value="db">Database</option>
                <option value="tests">Tests</option>
            </select>
          </div>
          <div className="card-description">
            <div className="card-edit-label-textarea">Description</div>
            <textarea className="card-title-textarea" placeholder="Enter Description" defaultValue={tempCardData.desc} onChange={handleDescChange}></textarea>
          </div>
        </div>
        <div className="card-edit-mode">
          <button className="button-secondary" aria-label="cancel" onClick={cancelEdit} tabIndex="0" title="Cancel">Cancel</button>
          <button className="button-action" aria-label="save" onClick={saveEdit} tabIndex="0" title="Save">Save</button>    
        </div>
      </div>
    )
  } else {
    return (
      <div>
        <div id={`card-detail-${cardData.key}-${cardData.status}`} className="card-drop-location"></div>
        <div id={cardData.key} className={`card-detail ${cardData.type}-type`} data-movi-config="movable" onMouseDown={startDrag}>
          <div className="card-title">{cardData.title}</div>
          <div className="card-type">{cardType.label}</div>
          <div className="card-description">{cardData.desc}</div>
          <div className="edit-pencil card-edit" onClick={editCard} title="Edit Card"></div>
          <button className="card-closure" aria-label="Close" onClick={handleClose} title="Remove Card">×</button>
        </div>
      </div>
    )
  }
}
