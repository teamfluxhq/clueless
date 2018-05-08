
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
    PLAYER_STATE: 'PLAYER_STATE',
    GAME_STARTED_STATE: 'GAME_STARTED_STATE'
}

// DOM elements
let roomDiv = document.getElementById("room");
let playerNamePrompt = document.getElementById("playerNamePrompt");
let playerNamePromptErr = document.getElementById("playerNamePromptErr");


socket.on('connect', () => {
    // Connects to the websocket server
    socket.emit(actions.CLIENT_CONNECTION, {data: 'Client connected'});
});


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
    socket.send(JSON.stringify(sendObjToServer))
}

function suggest() {
    let sendObjToServer = {
        action: actions.SUGGEST,
    }
    socket.send(JSON.stringify(sendObjToServer))
}

function disprove() {
    let sendObjToServer = {
        action: actions.DISPROVE,
    }
    socket.send(JSON.stringify(sendObjToServer))
}

function accuse() {
    let sendObjToServer = {
        action: actions.ACCUSE,
    }
    socket.send(JSON.stringify(sendObjToServer))
}

function endTurn() {
    let sendObjToServer = {
        action: actions.END_TURN,
    }
    socket.send(JSON.stringify(sendObjToServer))
}


socket.on('message', (data) => {
    let parsedMessage = JSON.parse(data);
    let gameState = parsedMessage.gameState;

    statusDiv = document.getElementById("status");
    statusDiv.innerHTML = "In " + GLOBAL_CLIENT_STATE.connectedPlayerName + "'s client. Current turn number: " + gameState.turn + " Current player's turn: " + gameState.current_player;
    console.log(parsedMessage.responseToken);
    console.log(gameState.player_cards);
    if (typeof gameState.player_cards !== 'undefined') {
        console.log(gameState.player_cards[GLOBAL_CLIENT_STATE.connectedPlayerName]);

        cardsDiv = document.getElementById("cards");
        cardsDiv.innerHTML = "Current cards: "

        for (let i = 0; i < gameState.player_cards[GLOBAL_CLIENT_STATE.connectedPlayerName].length; i++)
        {
            cardsDiv.innerHTML += gameState.player_cards[GLOBAL_CLIENT_STATE.connectedPlayerName][i] + " ";
        }
    }

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
                startButton = document.getElementById('startGameButton');
                if (startButton.style.display === "none") {
                    startButton.style.display = "block";
                }
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
            startButton = document.getElementById('startGameButton');
            startButton.style.display = "none";
            // document.getElementById('resetGameButton').style.display = "none";
            if (GLOBAL_CLIENT_STATE.connectedPlayerName === gameState.current_player) {
                document.getElementById('suggestButton').style.display = "block";
                document.getElementById('accuseButton').style.display = "block";
                document.getElementById('endTurnButton').style.display = "block";
            }
            break;
        case responses.PLAYER_STATE:
            document.getElementById('suggestButton').style.display = "none";
            document.getElementById('accuseButton').style.display = "none";
            document.getElementById('endTurnButton').style.display = "none";
            // document.getElementById('resetGameButton').style.display = "none";
            if (GLOBAL_CLIENT_STATE.connectedPlayerName === gameState.current_player) {
                document.getElementById('suggestButton').style.display = "block";
                document.getElementById('accuseButton').style.display = "block";
                document.getElementById('endTurnButton').style.display = "block";
            }        
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
