const validPositions = [
    [{x: 40, y: 40}, {x: 140, y: 40}, {x: 240, y: 40}, {x: 320, y: 40}, {x: 440, y: 40}],
    [{x: 40, y: 140}, {x: -1, y: -1}, {x: 240, y: 140}, {x: -1, y: -1}, {x: 440, y: 140}],
    [{x: 40, y: 240}, {x: 140, y: 240},  {x: 240, y: 240}, {x: 320, y: 240}, {x: 440, y: 240}],
    [{x: 40, y: 340}, {x: -1, y: -1}, {x: 240, y: 340}, {x: -1, y: -1}, {x: 440, y: 340}],
    [{x: 40, y: 440}, {x: 140, y: 440}, {x: 240, y: 440}, {x: 340, y: 440}, {x: 440, y: 440}],
]

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

let myGameBoard;
let myGamePiece;
class GameBoard {
    constructor() {
        this.canvas = document.getElementById("gamecanvas");
        this.context = this.canvas.getContext("2d");
        this.pieces = [];
    }
    draw(drawPieces) {
        this.imageObj = new Image();
        this.imageObj.onload = () => {
            this.context.drawImage(this.imageObj, 0, 0, this.imageObj.width, this.imageObj.height);
            this.pieces = drawPieces(this.context);
        }
        this.imageObj.src = "/static/assets/gameboard.png";
    }
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

class Piece {
    constructor(width, height, color, x, y, context) {
        this.width = width;
        this.height = height;
        this.color = color;
        this.x = validPositions[x][y].x;
        this.y = validPositions[x][y].y;
        this.indexX = x;
        this.indexY = y;
        this.context = context;
    }
    draw() {
        this.context.fillStyle = this.color;
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }
    newPos(incX, incY) {
        let x = this.indexX;
        let y = this.indexY;
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

myGameBoard = new GameBoard();

let drawPieces = (context) => {
    if (!myGamePiece) {
        myGamePiece = new Piece(30, 30, "blue", 0, 0, context);
    }
    myGamePiece.draw();

    return [myGamePiece];
}

myGameBoard.draw(drawPieces);

document.onkeydown = handleKeyDown;

function moveIfValid(piece, incX, incY) {
    if (piece.indexX === 0 && piece.indexY === 0 && incY === -1) {
        piece.newPos(incX, incY);
        myGameBoard.clear();
        myGameBoard.draw(drawPieces);
    }
    else if(piece.indexX === 4 && piece.indexY === 0 && incY === -1) {
        console.log("4,0")
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
    if (e.keyCode == '38') {
        // Up Movement
        moveIfValid(myGamePiece, -1, 0);
    }
    else if (e.keyCode == '40') {
        // down arrow
        moveIfValid(myGamePiece, 1, 0);
    }
    else if (e.keyCode == '37') {
       // left arrow
        moveIfValid(myGamePiece, 0, -1);
    }
    else if (e.keyCode == '39') {
       // right arrow
       moveIfValid(myGamePiece, 0, 1);
    }
}