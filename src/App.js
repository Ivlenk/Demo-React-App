import "./App.css";
import "./styles.css";
import Header from "./components/Header";
import Filters from "./components/Filters";
import Footer from "./components/Footer";
import Dragcard from "./components/Dragcard";
import KanbanColumns from "./components/KanbanColumns";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import {v4 as uuidv4} from "uuid";

// these can also be data driven from fetch call
const columnData = [
  { key: "colKey1", status: "todo", name: "To Do", cardData: [] },
  { key: "colKey2", status: "doing", name: "Doing", cardData: [] },
  { key: "colKey3", status: "review", name: "Review", cardData: [] },
  { key: "colKey4", status: "done", name: "Done", cardData: [] },
];

// indicates which column is Done column with the animation trigger
const completionColumn = columnData[columnData.length - 1].status;
let animationTimeoutId = null;

function App() {
  // hold list of kanban cards which are sorted into columns later
  const [cards, setCards] = useState([]);
  // new cards or cards in edit mode
  const [editCards, setEditCards] = useState([]);
  // columns such as To Do, Doing, Review, Done
  const [columns, setColumns] = useState([]);
  // 
  const [isProcessing, setIsProcessing] = useState(true);
  const [originalCard, setOriginalCard] = useState({});
  const [dragCardData, setDragCardData] = useState([]);
  
  //drag drop model describing what is moving
  const [movi, setMovi] = useState([]);

  // filter information
  const [searchTerm, setSearchTerm] = useState("");
  const [cardTypeFilter, setCardTypeFilter] = useState("all");

  // can be data driven
  const cardTypes = [
    { key: 101, type: "design", label: "Design", cssVal: "design-type" },
    { key: 102, type: "ui", label: "UI", cssVal: "ui-type" },
    { key: 103, type: "ux", label: "UX", cssVal: "ux-type" },
    { key: 104, type: "server", label: "Server", cssVal: "server-type" },
    { key: 105, type: "bug", label: "Bug", cssVal: "bug-type" },
    { key: 106, type: "mocks", label: "Mocks", cssVal: "mocks-type" },
    { key: 107, type: "docs", label: "Docs", cssVal: "docs-type" },
    { key: 108, type: "db", label: "Database", cssVal: "db-type" },
    { key: 109, type: "tests", label: "Tests", cssVal: "db-type" },
  ];
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCardTypeFilterChange = (e) => {
    const type = e.target.value;
    setCardTypeFilter(type);
  };

  const matchesNew = (card) => {
    return (card.new);
  };

  const matchesEditMode = (card) => {
    return (card.editMode);
  };

  const matchesSearchTerm = (card, searchTerm) => {
    return (
        card.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        card.desc.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const matchesCardTypeFilter = (card, type) => {
    return type === "all" || card.type === type;
  };

  const removeCard = (cardId) => {
    setCards(prev => 
        prev.filter(item => item.key !== cardId)
    )
  };

  // find screen position of cards to trigger drop zones on drag
  const cardMetrics = () => {
    const cardRefs = document.getElementsByClassName("card-drop-location");
    const moviNewObj = {
      cardScreenMetrics: [],
    };

    for (let i=0; i < cardRefs.length; i++) {
      const cardScreenObj = {};
      cardScreenObj.dropId = cardRefs[i].getAttribute('id');
      cardScreenObj.left = cardRefs[i].offsetLeft;
      cardScreenObj.right = cardRefs[i].offsetLeft + movi.cardWidth;
      cardScreenObj.top = cardRefs[i].offsetTop + 1;
      cardScreenObj.bottom = cardRefs[i].offsetTop + movi.cardHeight + 1;
      cardScreenObj.mid = cardRefs[i].offsetTop + movi.cardMid;
      cardScreenObj.height = movi.cardHeight;
      if (cardRefs[i].className.indexOf("card-drop-location-last") === -1) {
        cardScreenObj.nextDropId = cardRefs[i + 1].getAttribute('id');
      }

      moviNewObj.cardScreenMetrics.push(cardScreenObj);
    } 
    saveMovi(moviNewObj);
 
 };

  const stopEvent = (evt) => {
    evt.stopPropagation();
  };

  // engage a drag operation
  const startDrag = (e) => {
      const mouseEvent = e.nativeEvent;
      let moveItem;
      if (e.target && e.target.dataset && e.target.dataset.moviConfig) {
        moveItem = e.target;

      } else if (
          e.target &&
          !e.target.classList.contains("edit-pencil") &&
          !e.target.classList.contains("card-closure") &&
          !e.target.classList.contains("card-type") &&
          e.target.offsetParent.dataset && 
          e.target.offsetParent.dataset.moviConfig

        ) {
        moveItem = e.target.offsetParent;
      } else {
        return false;
      }

      const tempId = moveItem.getAttribute("id");
      const tempCard = cards.find((c) => c.key === tempId);
      const scrollx = window.pageXOffset;
      const scrolly = window.pageYOffset;
  

      // backup original card
      const cardOriginal = {};
      cardOriginal.key = tempCard.key;
      cardOriginal.title = tempCard.title;
      cardOriginal.type = tempCard.type;
      cardOriginal.status = tempCard.status;
      cardOriginal.label = tempCard.label;
      cardOriginal.desc = tempCard.desc;
      cardOriginal.editMode = false;
      cardOriginal.new = false;
      cardOriginal.moving = false;
      setOriginalCard(cardOriginal);

      const updateMovi = {};
      updateMovi.moviConfig = moveItem.dataset.moviConfig || moveItem.offsetParent.dataset.moviConfig;
      updateMovi.currentMovableItem = moveItem;
      updateMovi.currentMovableItemId = moveItem.getAttribute("id");
      updateMovi.currentMoveableX = moveItem.offsetLeft + movi.moveableNudgeX + movi.moveableDesignOffsetX;
      updateMovi.currentMoveableY = moveItem.offsetTop + movi.moveableNudgeY + movi.moveableDesignOffsetY;
      updateMovi.currentMoveableOriginalX = moveItem.offsetLeft;
      updateMovi.currentMoveableOriginalY = moveItem.offsetTop;
      
      // mouse position - card screen position
      updateMovi.currentMoveableOffsetX = (mouseEvent.x + scrollx) - moveItem.offsetLeft;
      updateMovi.currentMoveableOffsetY = (mouseEvent.y + scrolly) - moveItem.offsetTop;
      
      updateMovi.currentMovableItem.classList.add("card-detail-moving");

      updateDragCard(moveItem, cardOriginal.status);
      saveMovi(updateMovi);
      stopEvent(e);
  };

  // drag operation while in motion
  const moveDrag = (e) => {
    const mouseEvent = e.nativeEvent;
    cardMetrics();
    const updateMovi = {};
    const updateDragCardData = {};
    const scrollx = window.pageXOffset;
    const scrolly = window.pageYOffset;

    if (movi.currentMovableItem && movi.moviConfig) {
      updateMovi.currentMoveableX = (mouseEvent.x + scrollx) - movi.currentMoveableOffsetX;
      updateMovi.currentMoveableY = (mouseEvent.y + scrolly) - movi.currentMoveableOffsetY;
      updateDragCardData.left = updateMovi.currentMoveableX;
      updateDragCardData.top = updateMovi.currentMoveableY;
      updateMovi.dropZoneCurrentMoveableX = mouseEvent.x + scrollx;
      updateMovi.dropZoneCurrentMoveableY = mouseEvent.y + scrolly;

      saveMovi(updateMovi);
      saveDragCard(updateDragCardData);

      movi.cardScreenMetrics.forEach((cardMetric) => {
          if ((movi.dropZoneCurrentMoveableX >= cardMetric.left) && 
              (movi.dropZoneCurrentMoveableX <= cardMetric.right) &&
              (movi.dropZoneCurrentMoveableY >= cardMetric.top) &&
              (movi.dropZoneCurrentMoveableY <= cardMetric.bottom)) {
  
                if (movi.lastDropZoneId && document.getElementById(movi.lastDropZoneId).classList.contains("card-drop-show")) {
                  document.getElementById(movi.lastDropZoneId).classList.remove("card-drop-show");
                }
                if (
                  updateMovi.dropZoneCurrentMoveableY < cardMetric.mid &&
                    !document.getElementById(cardMetric.dropId).classList.contains("card-drop-show")
                ) {
                    document.getElementById(cardMetric.dropId).classList.add("card-drop-show");
                    movi.lastDropZoneId = cardMetric.dropId;
                }
  
                if (
                  updateMovi.dropZoneCurrentMoveableY >= cardMetric.mid &&
                  !document.getElementById(cardMetric.dropId).classList.contains("card-drop-show")
              ) {
                  document.getElementById(cardMetric.dropId).classList.add("card-drop-show");
                  movi.lastDropZoneId = cardMetric.dropId;
              }
           }
        });
    }
    stopEvent(e);
  };

  // drag operation upon release of object being dragged
  const stopDrag = (e) => {
    const cardOriginal = JSON.parse(JSON.stringify(originalCard));
    let cardData = JSON.parse(JSON.stringify(cards));

    if (movi.currentMovableItem && movi.moviConfig) {
      const lastDashIndex = movi.lastDropZoneId.lastIndexOf('-');
      const last = movi.lastDropZoneId.indexOf("-last-") !== -1;
      const column = movi.lastDropZoneId.substring(lastDashIndex + 1);
      const dropAboveId = movi.lastDropZoneId.substring(movi.lastDropZoneId.indexOf("card-detail-") + 12, lastDashIndex); 

      if (movi.lastDropZoneId && document.getElementById(movi.lastDropZoneId).classList.contains("card-drop-show")) {
        document.getElementById(movi.lastDropZoneId).classList.remove("card-drop-show");
      }
      
      // if we are in the same place or no dropzone is shown
      if (!movi.lastDropZoneId || (movi.currentMovableItemId === dropAboveId)) {
        const restoreIndex = cards.findIndex(card => card.key === movi.currentMovableItemId);
        removeMoving();
        cardData[restoreIndex] = cardOriginal;
        saveAllCards(cardData);
        initMovi();
        initDragCard();
        stopEvent(e);
        return;
      }

      cardData = JSON.parse(JSON.stringify(cards));
      const tempRemoveIndex = cardData.findIndex(card => card.key === dragCardData.key);

      // remove current card if we are not in the same position
      cardData.splice(tempRemoveIndex, 1);
      cardOriginal.status = column;

      if (column === completionColumn) {
        // addAnimation();
        document.getElementById("celebrate").style.visibility="visible";
      }
      
      clearTimeout(animationTimeoutId);
      animationTimeoutId = setTimeout(() => {
        // removeAnimation();
        document.getElementById("celebrate").style.visibility="hidden";
      }, 2000);

      // dropAboveId
      if (last) {
        cardData.push(cardOriginal);
      } else {
        const tempIndex = cardData.findIndex(card => card.key === dropAboveId);
        if (tempIndex >=0 ) {
          cardData.splice(tempIndex, 0, cardOriginal);
        }
      }

      removeMoving();
      initMovi();
      initDragCard();
      saveAllCards(cardData);

    };
    stopEvent(e);

  };

  // information related to object being dragged
  const initMovi = () => {
    const moviInitDetails = {};
    moviInitDetails.showHide = ['hidden', 'visible'];
    moviInitDetails.nodesCreatedList = [];
    moviInitDetails.errorList = [];
    moviInitDetails.errorList[0] = 'Element not found.';
    moviInitDetails.errorList[1] = 'Test Message';
    moviInitDetails.currentMovableItem = null;
    moviInitDetails.currentMovableItemId = -1;
    moviInitDetails.currentMoveableOffsetX = 0;
    moviInitDetails.currentMoveableOffsetY = 0;
    moviInitDetails.currentMoveableWidth = 0;
    moviInitDetails.currentMoveableHeight = 0;
    moviInitDetails.currentMoveableX = 0;
    moviInitDetails.currentMoveableY = 0;
    moviInitDetails.dropZoneCurrentMoveableX = 0;
    moviInitDetails.dropZonecurrentMoveableY = 0;
    moviInitDetails.currentMoveableOriginalX = 0;
    moviInitDetails.currentMoveableOriginalY = 0;
    moviInitDetails.currentMoveableClass = '';
    moviInitDetails.cardScreenMetrics = [];
    moviInitDetails.cardWidth = 338;
    moviInitDetails.cardHeight = 198;
    moviInitDetails.cardMid = 99;
    moviInitDetails.lastDropZoneId = "";
    moviInitDetails.moveableNudgeX = 2;
    moviInitDetails.moveableNudgeY = 2;
    moviInitDetails.moveableDesignOffsetX = -20;
    moviInitDetails.moveableDesignOffsetY = -8;
    moviInitDetails.movingContainer = 'moviMovingContainer';
    moviInitDetails.movingContainerInitX = -2500;
    moviInitDetails.movingContainerInitY = -2500;
    moviInitDetails.sourceContainerCss = 'movi-source-outline';
    moviInitDetails.moviConfig = '';
    moviInitDetails.keyMoveable = 'movable';
    moviInitDetails.keyZindex = 90000;
    saveMovi(moviInitDetails);
  };

  // some default values for the drag card object - these get replaced on drag of a card
  const initDragCard = () => {
    const dragCardDataInit = {};
    dragCardDataInit.key = "";
    dragCardDataInit.title = "";
    dragCardDataInit.type = "ui";
    dragCardDataInit.label = "UI";
    dragCardDataInit.desc = "";
    dragCardDataInit.status = "";
    dragCardDataInit.editMode = false;
    dragCardDataInit.new = false;
    dragCardDataInit.moving = false;
    dragCardDataInit.left = -2500;
    dragCardDataInit.top = -2500;
    dragCardDataInit.visibility = "hidden";
    dragCardDataInit.zIndex = 0;
    setDragCardData(dragCardDataInit);
  };

  // add a new card where status is the column clicked
  const addCard = (status) => {
    const newCardData = {};
    newCardData.key = uuidv4();
    newCardData.title = "";
    newCardData.type = "design";
    newCardData.label = "Design";
    newCardData.status = status;
    newCardData.desc = "";
    newCardData.editMode = true;
    newCardData.new = true;
    newCardData.moving = false;
    const tempCardsForAdd = JSON.parse(JSON.stringify(cards));
    const addIndex = tempCardsForAdd.findIndex(card => card.status === status);
    if (addIndex >=-1 ) {
      tempCardsForAdd.splice(addIndex, 0, newCardData);
    }
    setCards(tempCardsForAdd);
  };

  // modify the in-motion image of the card to match the source card being draggged
  const updateDragCard = (cardSource, status) => {
    const targetKey = cardSource.getAttribute("id");
    const targetTitle = cardSource.firstChild.innerText;
    const targetType = cardSource.className.substring(cardSource.className.indexOf(' ') + 1, cardSource.className.indexOf('-type'));
    const targetLabel = cardSource.firstChild.nextSibling.innerText;
    const targetDesc = cardSource.firstChild.nextSibling.nextSibling.innerText;
    const dragCardDataUpdate = {};
    dragCardDataUpdate.key = targetKey;
    dragCardDataUpdate.title = targetTitle;
    dragCardDataUpdate.type = targetType;
    dragCardDataUpdate.label = targetLabel;
    dragCardDataUpdate.desc = targetDesc;
    dragCardDataUpdate.status = status;
    dragCardDataUpdate.editMode = false;
    dragCardDataUpdate.new = false;
    dragCardDataUpdate.moving = false;
    dragCardDataUpdate.left = -2500;
    dragCardDataUpdate.top = -2500;
    dragCardDataUpdate.visibility = "visible";
    dragCardDataUpdate.zIndex = 100000;
    saveDragCard(dragCardDataUpdate);
  };

  // merge newly added or edited card into existing data
  const saveCard = (cardData) => {
    setCards(prevRecords => 
      prevRecords.map(card => 
        card.key === cardData.key ? { ...card, ...cardData } : card
      )
    );
  };

  // sort cards into columns by status data (status is the column)
  const updateColumns = (cards) => {
    const columnDataWithCards = JSON.parse(JSON.stringify(columnData));
    cards.forEach((card) => {
      const col = columnDataWithCards.find((c) => c.status === card.status);
      if (col) {
        col.cardData.push(card);
      }
    });

    setColumns(columnDataWithCards);
    setIsProcessing(false);
  };

  // reset the greyed out look
  const removeMoving = () => {
    if (movi.currentMovableItem.classList && movi.currentMovableItem.classList.contains("card-detail-moving")) {
      movi.currentMovableItem.classList.remove("card-detail-moving");
    }
  }

  // save a whole set of cards
  const saveAllCards = (cards) => {
    setCards(cards);
  };

  // place drag in-motion data in store
  const saveMovi = (moviData) => {
    setMovi(prev => ({ ...prev, ...moviData }));
  };
  
  // update moving card with source card information
  const saveDragCard = (dragCardData) => {
    setDragCardData(prev => ({ ...prev, ...dragCardData }));
  };

  // functions for editing or adding cards  - these are drilled down to other components for them to call
  const handleEdit = (cardData, action) => {
      if (action === "cancel") {
        removeCard(cardData.key);
      }
      if (action === "save") {
        cardData.new = false;
        saveCard(cardData);
      }
      if (action === "moving") {
        cardData.moving = true;
        saveCard(cardData);
      }
      if (action === "edit") {
        setEditCards(prev => [...prev, cardData]);  
        cardData.editMode = true;
        cardData.new = false;
        saveCard(cardData);
      }
      if (action === "cancelEdit") {
        const editCardOriginal = editCards.find((card) => card.key === cardData.key);
        cardData = JSON.parse(JSON.stringify(editCardOriginal));
        cardData.editMode = false;
        cardData.new = false;
        saveCard(cardData);
        setEditCards(prev => 
          prev.filter(item => item.key !== cardData.key)
        )
      }
      if (action === "update") {
        saveCard(cardData);
      }
    };

  // Load cards from JSON file (or eventually https end point)
  useEffect(() => {
    fetch("cards.json")
    .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
      return response.json();
    })
    .then((data) => setCards(data))
    .catch((error) => {
      console.error("Failed to load cards:", error);
      // todo: give UI feedback
      // setError("Could not load cards. Please try again later.");
    });
  }, []);
  
  // Process cards into columns after cards are fetched
  useEffect(() => {
    const filteredCards = cards.filter((card) => 
      matchesNew(card) ||
      matchesEditMode(card) ||
      matchesCardTypeFilter(card, cardTypeFilter) &&
      matchesSearchTerm(card, searchTerm)
    );
    updateColumns(filteredCards);
  }, [cards, cardTypeFilter,searchTerm]);

  useEffect(() => {
    initDragCard();
  }, []);

  useEffect(() => {
    initMovi();
  }, []);

  // my work around to allow time for load before render
  if (isProcessing) return null;

  return (
    <div className="App" onMouseUp={(event) => stopDrag(event)} onMouseMove={(event) => moveDrag(event)}>
      <div className="container">
        <div id="celebrate" className="confetti-celebration">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="confetti-piece"></div>
          ))}
        </div>
        <Header />
        <Filters handleSearchChange={handleSearchChange} handleCardTypeFilterChange={handleCardTypeFilterChange}/>
        <Router>
          <Routes>
            <Route
              path="/"
              element={<KanbanColumns columns={columns} cardTypes={cardTypes} removeCard={removeCard} addCard={addCard} handleEdit={handleEdit} startDrag={startDrag}/>}
            />
          </Routes>
        </Router>
      </div>
      <Footer />
      <Dragcard dragCardData={dragCardData} movi={movi} stopDrag={stopDrag} moveDrag={moveDrag}></Dragcard>
    </div>
  );
}

export default App;
