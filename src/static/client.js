
let GLOBAL_CLIENT_STATE = {
    connectedPlayerName: "",
}
let socket = io.connect('http://' + document.domain + ':' + location.port);

// Possible game actions
let actions = {
    CLIENT_CONNECTION: 'CLIENT_CONNECTION',
    JOIN_GAME: 'JOIN_GAME',
    RESET_GAME: 'RESET_GAME',
}

// Possible responses
let responses = {
    PLAYER_JOINED_GAME: 'PLAYER_JOINED_GAME',
    PLAYER_ALREADY_JOINED: 'PLAYER_ALREADY_JOINED',
    CLEARED_GAME_STATE: 'CLEARED_GAME_STATE',
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


socket.on('message', (data) => {
    let parsedMessage = JSON.parse(data);
    let gameState = parsedMessage.gameState;
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
            break;
        case responses.PLAYER_ALREADY_JOINED:
            playerNamePrompt = document.getElementById("playerNamePrompt");
            playerNamePromptErr = document.getElementById("playerNamePromptErr");

            playerNamePrompt.hidden = false;
            playerNamePromptErr.innerHTML = "Player with that name has already joined the game";
            break;
        case responses.CLEARED_GAME_STATE:
            location.reload();
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