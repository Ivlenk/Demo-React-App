import React from 'react';
import '../styles.css';

export default function Dragcard({dragCardData, movi}){
    return(
        <div id="moviMovingContainer" className={`card-detail ${dragCardData.type}-type movi-movable-container`} style={{left: movi.currentMoveableX + 'px', top: movi.currentMoveableY + 'px', visibility: dragCardData.visibility, zIndex: dragCardData.zIndex }}>
          <div className="card-title">{dragCardData.title}</div>
          <div className="card-type">{dragCardData.label}</div>
          <div className="card-description">{dragCardData.desc}</div>
          <div className="edit-pencil card-edit"></div>
          <button className="card-closure" aria-label="Close">×</button>
        </div>
    );
}