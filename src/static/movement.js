const validPositions = [
    [{x: 40, y: 40}, {x: 140, y: 40}, {x: 240, y: 40}, {x: 320, y: 40}, {x: 440, y: 40}],
    [{x: 40, y: 140}, {x: -1, y: -1}, {x: 240, y: 140}, {x: -1, y: -1}, {x: 440, y: 140}],
    [{x: 40, y: 240}, {x: 140, y: 240},  {x: 240, y: 240}, {x: 320, y: 240}, {x: 440, y: 240}],
    [{x: 40, y: 340}, {x: -1, y: -1}, {x: 240, y: 340}, {x: -1, y: -1}, {x: 440, y: 340}],
    [{x: 40, y: 440}, {x: 140, y: 440}, {x: 240, y: 440}, {x: 340, y: 440}, {x: 440, y: 440}],
]

const getIndex = (x, y) => {
    for (let i = 0; i < validPositions.length; i++) {
        for (let j = 0; j < validPositions[i].length; j++) {
            if (validPositions[i][j].x === x && validPositions[i][j].y === y) {
                return {"x": i, "y": j};
            }
        }
    }
    return {"x": -1, "y": -1};
}

const roomMappingIndexFirst = {
    "0,0": "study",
    "0,2": "hall",
    "0,4": "lounge",
    "2,0": "library",
    "2,2": "billiard_room",
    "2,4": "dining_room",
    "4,0": "conservatory",
    "4,2": "ballroom",
    "4,4": "kitchen",
}

const roomMapping = {
    "study": {indexX: 0, indexY: 0},
    "hall": {indexX: 0, indexY: 2},
    "lounge": {indexX: 0, indexY: 4},
    "library": {indexX: 2, indexY: 0},
    "billiard_room": {indexX: 2, indexY: 2},
    "dining_room": {indexX: 2, indexY: 4},
    "conservatory": {indexX: 4, indexY: 0},
    "ballroom": {indexX: 4, indexY: 2},
    "kitchen": {indexX: 4, indexY: 4},
}

const startSpaces = {
    "plum": {x: 112, y: 158},
    "white": {x: 360, y: 384},
    "peacock": {x: 114, y: 356},
    "green": {x: 167, y: 384},
    "scarlet": {x: 351, y: 107},
    "mustard": {x: 411, y: 168},
}
const nextMoveAfterStart = {
    "plum": {pos: validPositions[1][0], indicies: [1,0]},
    "white": {pos: validPositions[4][3], indicies: [4,3]},
    "peacock": {pos: validPositions[3][0], indicies: [3,0]},
    "green": {pos: validPositions[4][1], indicies: [4,1]},
    "scarlet": {pos: validPositions[0][3], indicies: [0,3]},
    "mustard": {pos: validPositions[1][4], indicies: [1,4]},
};

let myPieces = {
    plum: null,
    white: null,
    peacock: null,
    green: null,
    scarlet: null,
    mustard: null,
};

class GameBoard {
    constructor() {
        this.canvas = document.getElementById("gamecanvas");
        this.context = this.canvas.getContext("2d");
        this.pieces = {};
        this.characterAllowedToMove = null;
        this.associations = null;
    }
    draw(drawPieces) {
        this.imageObj = new Image();
        this.imageObj.onload = () => {
            this.context.drawImage(this.imageObj, 0, 0, this.imageObj.width, this.imageObj.height);
            this.pieces = drawPieces(this.context);
        }
        this.imageObj.src = "/static/assets/gameboard.png";
    }
    setAssociations(associations) {
        this.associations = associations;
    }
    getAssociations() {
        return this.associations;
    }
    setAllowedToMove(character) {
        this.characterAllowedToMove = character;
    }
    getAllowedToMove() {
        return this.characterAllowedToMove;
    }
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    static onCanvasClick(event) {
        let x = event.offsetX;
        let y = event.offsetY;
        console.log("Clicked", " x:", x, " y:", y);
    }
}
class Piece {
    constructor(width, height, color, x, y, context) {
        this.width = width;
        this.height = height;
        this.color = color;
        this.x = x;
        this.y = y;
        this.indexX = x;
        this.indexY = y;
        this.context = context;
    }
    draw() {
        this.context.fillStyle = this.color;
        console.log(this.x, this.y);
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }
    getPosition() {
        let piecePositions = {
            x: this.x,
            y: this.y,
            indexX: this.indexX,
            indexY: this.indexY
        }
        return piecePositions;
    }
    setDirectly(x, y) {
        this.x = x;
        this.y = y;
    }
    setIndices(indexX, indexY) {
        this.indexX = indexX;
        this.indexY = indexY;
    }
    newPos(incX, incY) {
        let x = this.indexX;
        let y = this.indexY;

        // Handing the corner positions
        // index 0,0 corresponds to the top left corner
        // and saying y === -1 means that they're trying to 
        // press the left arrow, this then navigates them
        // to the opposite corner
        if (x == 0 && y == 0 && incY === -1) {
            this.x = validPositions[4][4].x;
            this.y = validPositions[4][4].y;
            this.indexX = 4;
            this.indexY = 4;
        }
        if (x === 4 && y === 4 && incY === 1) {
            this.x = validPositions[0][0].x;
            this.y = validPositions[0][0].y;
            this.indexX = 0;
            this.indexY = 0;
        }
        if (x === 0 && y === 4 && incY === 1) {
            this.x = validPositions[4][0].x;
            this.y = validPositions[4][0].y;
            this.indexX = 4;
            this.indexY = 0;
        }
        if (x === 4 && y === 0 && incY === -1) {
            this.x = validPositions[0][4].x;
            this.y = validPositions[0][4].y;
            this.indexX = 0;
            this.indexY = 4;
        }
        if (incX == 1 && incY == 0) {
            this.x = validPositions[x+1][y].x;
            this.y = validPositions[x+1][y].y;
            this.indexX = x+1;
            this.indexY = y;
        }
        if (incX == -1 && incY == 0) {
            this.x = validPositions[x-1][y].x;
            this.y = validPositions[x-1][y].y;
            this.indexX = x-1;
            this.indexY = y;
        }
        if (incX == 0 && incY == 1 && !(x === 4 && y === 4) && !(x === 0 && y ===4)) {
            this.x = validPositions[x][y+1].x;
            this.y = validPositions[x][y+1].y;
            this.indexX = x;
            this.indexY = y+1;
        }
        if (incX == 0 && incY == -1 && !(x === 0 && y === 0) && !(x === 4 && y === 0)) {
            this.x = validPositions[x][y-1].x;
            this.y = validPositions[x][y-1].y;
            this.indexX = x;
            this.indexY = y-1;
        }
    }
}

// Initialize GameBoard singleton
let myGameBoard = new GameBoard();

let initPiece = (character, color, locInfo, context) => {
    // global MyPieces
    if(locInfo.hasOwnProperty(character)) {
        let x = locInfo[character].x;
        let y = locInfo[character].y;
        myPieces[character] = new Piece(25, 25, color, x, y, context);
        myPieces[character].draw();
    }
}

// Given piece location info draw the pieces
let initPieces = (context, locInfo) => {
    initPiece("plum", "violet", locInfo, context);
    initPiece("white", "white", locInfo, context);
    initPiece("peacock", "blue", locInfo, context);
    initPiece("green", "green", locInfo, context);
    initPiece("scarlet", "red", locInfo, context);
    initPiece("mustard", "yellow", locInfo, context);
    return myPieces;
}

let drawPieces = (context) => {
    myPieces.plum.draw();
    myPieces.white.draw();
    myPieces.peacock.draw();
    myPieces.green.draw();
    myPieces.scarlet.draw();
    myPieces.mustard.draw();
}

document.onkeydown = handleKeyDown;

function moveIfValid(piece, incX, incY) {
    // TODO: don't allow piece to go in hallway if another piece is there
    if (piece.indexX === 0 && piece.indexY === 0 && incY === -1) {
        piece.newPos(incX, incY);
        myGameBoard.clear();
        myGameBoard.draw(drawPieces);
    }
    else if(piece.indexX === 4 && piece.indexY === 0 && incY === -1) {
        piece.newPos(incX, incY);
        myGameBoard.clear();
        myGameBoard.draw(drawPieces);
    }
    else if(piece.indexX === 4 && piece.indexY === 4 && incY === 1) {
        piece.newPos(incX, incY);
        myGameBoard.clear();
        myGameBoard.draw(drawPieces);
    }
    else if(piece.indexX === 0 && piece.indexY === 4 && incY === 1) {
        piece.newPos(incX, incY);
        myGameBoard.clear();
        myGameBoard.draw(drawPieces);
    }
    else if (piece.indexX+incX > 4 || piece.indexY+incY > 4 || (piece.indexX+incX < 0 || piece.indexY+incY < 0)) {
        alert("Can't move there");
    } 
    else if (!(validPositions[piece.indexX+incX][piece.indexY+incY].x === -1)) {
        piece.newPos(incX, incY);
        myGameBoard.clear();
        myGameBoard.draw(drawPieces);
    }
    else {
        alert("Can't move there");
    }
}

function handleKeyDown(e) {
    e = e || window.event;
    let associations = myGameBoard.getAssociations();
    let currentlyConnectedClient = GLOBAL_CLIENT_STATE["connectedPlayerName"];
    let currentlyConnectedPiece = null;
    let allowedToMove = false;
    let connectedCharacter = null;
    if (associations !== null) {
        if (currentlyConnectedClient.length > 0) {
            connectedCharacter = associations[currentlyConnectedClient];
            if (myGameBoard.getAllowedToMove() === connectedCharacter) {
                allowedToMove = true;
            }
        }
    }
    let inStartPosition = false;
    if (connectedCharacter !== "" && connectedCharacter !== null) {
        currentConnectedPiece = myPieces[connectedCharacter];
        if (myPieces[connectedCharacter].x === startSpaces[connectedCharacter].x) {
            inStartPosition = true;
        }
    }
    if (inStartPosition && allowedToMove) {
        let newX = nextMoveAfterStart[connectedCharacter].pos.x;
        let newY = nextMoveAfterStart[connectedCharacter].pos.y;
        let indexX = nextMoveAfterStart[connectedCharacter].indicies[0];
        let indexY = nextMoveAfterStart[connectedCharacter].indicies[1];
        myPieces[connectedCharacter].setDirectly(newX, newY);
        myPieces[connectedCharacter].setIndices(indexX, indexY);
        myGameBoard.clear();
        myGameBoard.draw(drawPieces);
    } else {
        if (e.keyCode == '38' && allowedToMove) {
            // Up Movement
            moveIfValid(currentConnectedPiece, -1, 0);
        }
        else if (e.keyCode == '40' && allowedToMove) {
            // down arrow
            moveIfValid(currentConnectedPiece, 1, 0);
        }
        else if (e.keyCode == '37' && allowedToMove) {
        // left arrow
            moveIfValid(currentConnectedPiece, 0, -1);
        }
        else if (e.keyCode == '39' && allowedToMove) {
        // right arrow
            moveIfValid(currentConnectedPiece, 0, 1);
        }
    }
}


// External Methods

function initGamePiecesAndBoard(gameState) {
    if (gameState.hasOwnProperty("movement_info")) {
        if (gameState.movement_info.hasOwnProperty("current_locations")) {
            let locInfo = gameState.movement_info.current_locations;
            myGameBoard.draw((context) => initPieces(context, locInfo));
            setCurrentCharacterTurn(gameState);
        }
    }
}

function setCurrentCharacterTurn(gameState) {
    if (gameState.hasOwnProperty("movement_info")) {
        if (gameState.movement_info.hasOwnProperty("associations")) {
            if (gameState.current_player.length > 0) {
                let associations = gameState.movement_info.associations;
                if (myGameBoard.getAssociations() === null) {
                    myGameBoard.setAssociations(associations);
                }
                let character = associations[gameState.current_player];
                myGameBoard.setAllowedToMove(character);
            }
        }
    }
}

function getRoomOfPlayer(playerName) {
    let associations = myGameBoard.getAssociations();
    let character = associations[playerName];
    let characterPosition = myPieces[character].getPosition();
    let roomIndex = characterPosition.indexX + "," + characterPosition.indexY
    if (roomMappingIndexFirst.hasOwnProperty(roomIndex)) {
        return roomMappingIndexFirst[roomIndex];
    } else {
        return "not in room";
    }
}

function getPieceLocations() {
    // global myPieces
    let newPositions = {
        "plum": {"x": myPieces.plum.x, "y": myPieces.plum.y},
        "white": {"x": myPieces.white.x, "y": myPieces.white.y},
        "peacock": {"x":myPieces.peacock.x, "y": myPieces.peacock.y},
        "green": {"x":myPieces.green.x, "y": myPieces.green.y},
        "scarlet": {"x":myPieces.scarlet.x,"y":myPieces.scarlet.y},
        "mustard":{"x":myPieces.mustard.x,"y":myPieces.mustard.y},
    }
    return newPositions;
}

function updateGameBoard(gameState) {
    let currentLocations = gameState["movement_info"]["current_locations"];
    for (var character in currentLocations) {
        let newX = currentLocations[character].x;
        let newY = currentLocations[character].y;
        let indicies = getIndex(newX, newY);
        console.log("Printing the character: ", character);
        myPieces[character].setDirectly(newX, newY);
        myPieces[character].setIndices(indicies.x, indicies.y);
        myGameBoard.clear();
        myGameBoard.draw(drawPieces);
    }
}