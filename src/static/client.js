
let GLOBAL_CLIENT_STATE = {
    connectedPlayerName: "",
    // location
    // values for the cards
    weapon: "",
    room: "",
    character: "",
    cards: []
}
let socket = io.connect('http://' + document.domain + ':' + location.port);

// Possible game actions
let actions = {
    CLIENT_CONNECTION: 'CLIENT_CONNECTION',
    JOIN_GAME: 'JOIN_GAME',
    RESET_GAME: 'RESET_GAME',
    START_GAME: 'START_GAME',
    ACCUSE: 'ACCUSE',
    DISPROVE: 'DISPROVE',
    SUGGEST: 'SUGGEST',
    END_TURN: 'END_TURN'
}

// Possible responses
let responses = {
    PLAYER_JOINED_GAME: 'PLAYER_JOINED_GAME',
    PLAYER_ALREADY_JOINED: 'PLAYER_ALREADY_JOINED',
    CLEARED_GAME_STATE: 'CLEARED_GAME_STATE',
    MAXIMUM_PLAYER_REACHED: 'MAXIMUM_PLAYER_REACHED',
    GAME_STARTED_STATE: 'GAME_STARTED_STATE',
    SUGGEST_STATE: 'SUGGEST_STATE',
    PRE_DISPROVE: 'PRE_DISPROVE',
    DISPROVE_STATE: 'DISPROVE_STATE',
    ACCUSE_STATE: 'ACCUSE_STATE',
    ACCUSE_SUCCESS: 'ACCUSE_SUCCESS',
    ACCUSE_FAILURE: 'ACCUSE_FAILURE'
}

/******
 * weapons = ["candlestick", "revolver",
           "rope", "wrench",
           "lead_pipe", "knife"]

rooms = ["study", "library", "conservatory",
         "hall", "kitchen", "ballroom",
         "dining_room", "lounge", "billard_room"]

suspects = ["white", "peacock",
              "scarlet", "mustard",
              "green", "plum"]
 * 
 * 
 */

const weaponUri = "/static/assets/weapons/";
const roomsUri = "/static/assets/rooms/";
const charactersUri = "/static/assets/characters/";

let assetLocations = {
    "candlestick": weaponUri + "candlestick.jpg",
    "knife": weaponUri + "knife.jpg",
    "lead_pipe": weaponUri + "leadPipe.jpg",
    "revolver": weaponUri + "revolver.jpg",
    "rope": weaponUri + "rope.jpg",
    "wrench": weaponUri + "wrench.jpg",
    "ballroom": roomsUri + "ballroom.jpg",
    "billiard_room": roomsUri + "billiardRoom.jpg",
    "clue": roomsUri + "clue.jpg",
    "conservatory": roomsUri + "conservatory.jpg",
    "dining_room": roomsUri + "diningRoom.jpg",
    "hall": roomsUri + "hall.jpg",
    "kitchen": roomsUri + "kitchen.jpg",
    "library": roomsUri + "library.jpg",
    "lounge": roomsUri + "lounge.jpg",
    "study": roomsUri + "study.jpg",
    "mustard": charactersUri + "colonelMustard.jpg",
    "scarlet": charactersUri + "missScarlet.jpg",
    "green": charactersUri + "mrGreen.jpg",
    "peacock": charactersUri + "mrsPeacock.jpg",
    "white": charactersUri + "mrsWhite.jpg",
    "plum": charactersUri + "professorPlum.jpg",
};

// DOM elements
let roomDiv = document.getElementById("room");
let playerNamePrompt = document.getElementById("playerNamePrompt");
let playerNamePromptErr = document.getElementById("playerNamePromptErr");


socket.on('connect', () => {
    // Connects to the websocket server
    socket.emit(actions.CLIENT_CONNECTION, {data: 'Client connected'});
});

function checkIfExists(someVariable, someProperty) {
    if (typeof someVariable !== 'undefined' && someVariable.hasOwnProperty(someProperty)) {
        return true;
    }
    return false;
}

function joinGame(event) {
    event.preventDefault();
    // Get the player's name from the input box
    let playerName = document.getElementById("playerName").value;

    // Check if the playerName is not found
    if (playerName !== "") {
        let sendObjToServer = {
            action: actions.JOIN_GAME,
            payload: {
                playerName: playerName,
            }
        }
        let playerNamePrompt = document.getElementById("playerNamePrompt");
        playerNamePrompt.hidden = true;
        playerNamePromptErr = "";
        // set the connected player name
        GLOBAL_CLIENT_STATE.connectedPlayerName = playerName;

        socket.send(JSON.stringify(sendObjToServer))
    } else {
        alert("Please enter a player name");
    }
}

function resetGame() {
    let sendObjToServer = {
        action: actions.RESET_GAME,
    }
    socket.send(JSON.stringify(sendObjToServer))
}

function startGame() {
    let sendObjToServer = {
        action: actions.START_GAME,
    }
    hideAll();
    socket.send(JSON.stringify(sendObjToServer))
}

function suggestPreparations(){
    hideAll();
    showSuggest();
}

function accusePreparations(){
    hideAll();
    showAccuse();
}

function showTurnAccuse(gameState) {
    if (gameState.can_accuse[GLOBAL_CLIENT_STATE.connectedPlayerName]) {
        showButton('accuseButton');
    }
    showButton('endTurnButton');
}

function showTurn(gameState) {
    if (gameState.can_accuse[GLOBAL_CLIENT_STATE.connectedPlayerName]) {
        showButton('suggestButton');
        showButton('accuseButton');
    }
    showButton('endTurnButton');
}

function showSuggest() {
    showButton("suspectsList");
    showButton("weaponsList");
    showButton("submitSuggestion");
}

function showDisprove() {
    showButton("disproveCards");
    showButton("disproveButton");
}

function showAccuse() {
    showButton("suspectsList");
    showButton("weaponsList");
    showButton("submitAccusation");
}

function suggest() {
    let sendObjToServer = {
        action: actions.SUGGEST,
        weapon: document.getElementById("weaponsList").value,
        suspect: document.getElementById("suspectsList").value,
        room: getRoomOfPlayer(GLOBAL_CLIENT_STATE.connectedPlayerName),
        locations: getPieceLocations()
    }
    hideAll();
    socket.send(JSON.stringify(sendObjToServer))
}

function disprove() {
    let sendObjToServer = {
        action: actions.DISPROVE,
        disproveValue: document.getElementById("disproveCards").value
    }
    hideAll();
    socket.send(JSON.stringify(sendObjToServer))
}

function accuse() {
    let sendObjToServer = {
        action: actions.ACCUSE,
        weapon: document.getElementById("weaponsList").value,
        suspect: document.getElementById("suspectsList").value,
        room: getRoomOfPlayer(GLOBAL_CLIENT_STATE.connectedPlayerName)
    }
    hideAll();
    socket.send(JSON.stringify(sendObjToServer))
}

function endTurn() {
    let sendObjToServer = {
        action: actions.END_TURN,
        payload: {
            "current_locations": getPieceLocations(),
        }
    }
    hideAll();
    socket.send(JSON.stringify(sendObjToServer))
}

function showButton(name) {
    let x = document.getElementById(name);
    x.style.display = "block";
}

function hideButton(name){
    let x = document.getElementById(name);
    x.style.display = "none";
}

function hideAll(){
    hideButton("startGameButton");
    hideButton("suggestButton");
    hideButton("accuseButton");
    hideButton("disproveButton");
    hideButton("endTurnButton");
    hideButton("weaponsList");
    hideButton("suspectsList");
    hideButton("submitSuggestion");
    hideButton("submitAccusation");
    hideButton("disproveCards");
    hideButton("disproveButton");
}

function alertInBox(message){
    let alertBox = document.getElementById("alerts");   
    alertBox.innerHTML = message + "<br />" + alertBox.innerHTML;    
}

socket.on('message', (data) => {
    let parsedMessage = JSON.parse(data);
    let gameState = parsedMessage.gameState;
    let connectedPlayerName = GLOBAL_CLIENT_STATE.connectedPlayerName;
    statusDiv = document.getElementById("status");
    statusDiv.innerHTML = "In " + GLOBAL_CLIENT_STATE.connectedPlayerName + "'s client. Current turn number: " + gameState.turn + " Current player's turn: " + gameState.current_player;
    
    setCurrentCharacterTurn(gameState);

    switch (parsedMessage.responseToken) {
        case responses.PLAYER_JOINED_GAME:
            roomDiv = document.getElementById("room");
            
            roomDiv.innerHTML = "";
            let playerNamesRendered = gameState.players.map((name) => {
                return "<li>"+name+"</li>";
            });
            roomDiv.innerHTML += "<ul>";
            // Append the names to the DOM
            for (let i = 0; i < playerNamesRendered.length; ++i) {
                roomDiv.innerHTML += playerNamesRendered[i];
            }
            roomDiv.innerHTML += "</ul>";

            // When there are at least 3 players, the game can start
            // hence, we enabled the start game button
            if (gameState.players.length >= 3) {
                showButton('startGameButton');
            }

            break;
        case responses.PLAYER_ALREADY_JOINED:
            playerNamePrompt = document.getElementById("playerNamePrompt");
            playerNamePromptErr = document.getElementById("playerNamePromptErr");

            playerNamePrompt.hidden = false;
            playerNamePromptErr.innerHTML = "Player with that name has already joined the game";
            break;
        case responses.MAXIMUM_PLAYER_REACHED:
            playerNamePrompt = document.getElementById("playerNamePrompt");
            playerNamePromptErr = document.getElementById("playerNamePromptErr");

            playerNamePrompt.hidden = false;
            playerNamePromptErr.innerHTML = "Maximum number of players (6) for this game has been reached";
            break;    
        case responses.CLEARED_GAME_STATE:
            location.reload();
            break;
        case responses.GAME_STARTED_STATE:
            hideAll();

            initGamePiecesAndBoard(gameState);

            if (GLOBAL_CLIENT_STATE.connectedPlayerName === gameState.current_player) {
                showTurn(gameState);
            }

            // Deals the cards out
            if (checkIfExists(gameState.player_cards, connectedPlayerName)) {

                cardsDiv = document.getElementById("cards");        
        
                for (let i = 0; i < gameState.player_cards[GLOBAL_CLIENT_STATE.connectedPlayerName].length; i++)
                {
                    const currentItem = gameState.player_cards[GLOBAL_CLIENT_STATE.connectedPlayerName][i];
                    if (assetLocations.hasOwnProperty(currentItem)) {
                        cardsDiv.innerHTML += "<button class='btn btn-primary card'><img src='" + assetLocations[currentItem] + "' alt='" + assetLocations[currentItem] + "' width='75' /></button>";
                    } else {
                        cardsDiv.innerHTML += currentItem  + " ";
                    }
                }
            }
            break;
        case responses.SUGGEST_STATE:
            updateGameBoard(gameState);
            hideAll();
            console.log("From the suggest state case: ", gameState);

            if (gameState.game_ended) {
                alertInBox("Game has ended, please restart.");
            }

            if (GLOBAL_CLIENT_STATE.connectedPlayerName === gameState.current_player) {
                showTurn(gameState);
            }        
            break;
        case responses.PRE_DISPROVE:
            updateGameBoard(gameState);
            alertInBox(gameState.current_player + " suggested that " + gameState.current_suggestion.suspect + " killed the victim using the " + gameState.current_suggestion.weapon + ".");

        case responses.DISPROVE_STATE:
            hideAll();
            alertInBox("It is " + gameState.disproving_player + "'s turn to disprove the suggestion using eligible cards.");
            if (gameState.disproving_player === GLOBAL_CLIENT_STATE.connectedPlayerName){
                let disproveSelect = document.getElementById("disproveCards");
                disproveSelect.innerHTML = "";
                if (GLOBAL_CLIENT_STATE.connectedPlayerName in gameState.can_disprove) {
                    for (let i = 0; i < gameState.can_disprove[GLOBAL_CLIENT_STATE.connectedPlayerName].length; i++)
                    {
                        currentVal = gameState.can_disprove[GLOBAL_CLIENT_STATE.connectedPlayerName][i];
                        disproveSelect.innerHTML += "<option value=\"" + currentVal + "\">" + currentVal + "</option>";
                    }
                }
                else {
                    disproveSelect.innerHTML += "<option value=\"novalue\">No Cards</option>";
                }
                showDisprove();
            }
            break;
        case responses.ACCUSE_STATE:
            hideAll();
            if (parsedMessage.payload === "disproveFailed") {
                alertInBox("There are no players with eligible cards to disprove the suggestion.");
            }

            if (GLOBAL_CLIENT_STATE.connectedPlayerName === gameState.current_player) {
                if (parsedMessage.payload !== "disproveFailed") {
                    alertInBox(parsedMessage.payload);
                }
                showTurnAccuse(gameState);
            }
            break;
        case responses.ACCUSE_SUCCESS:
            hideAll();
            alertInBox(gameState.current_player + " accused " + gameState.accusation.suspect + " of the murder using " + gameState.accusation.weapon + " in room.");
            alertInBox(gameState.current_player + " has the right accusation. Please restart the game.");
            break;
        case responses.ACCUSE_FAILURE:
            hideAll();
            alertInBox(gameState.current_player + " accused " + gameState.accusation.suspect + " of the murder using " + gameState.accusation.weapon + " in room.");
            alertInBox("You have the wrong accusation.");
            alertInBox(gameState.solution.suspect + " used " + gameState.solution.weapon + " in the murder.");
            showButton("endTurnButton");
            break;
        default:
            console.log(parsedMessage);
    }
});

// Form submit actions for the player name prompt
playerNamePrompt.onsubmit = (event) => {
    event.preventDefault();
    joinGame();
}

document.getElementById('joinGame').onclick = joinGame;
