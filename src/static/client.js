
let GLOBAL_CLIENT_STATE = {
    connectedPlayerName: "",
}
let socket = io.connect('http://' + document.domain + ':' + location.port);
let actions = {
    CLIENT_CONNECTION: 'CLIENT_CONNECTION'
}
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
            action: "JOIN_GAME",
            payload: {
                playerName: playerName,
            }
        }
        let playerNamePrompt = document.getElementById("playerNamePrompt");
        playerNamePrompt.hidden = true;
        playerNamePromptErr = "";
        GLOBAL_CLIENT_STATE.connectedPlayerName = playerName;

        socket.send(JSON.stringify(sendObjToServer))
    } else {
        alert("Please enter a player name");
    }
}

function resetGame() {
    let sendObjToServer = {
        action: "RESET_GAME",
    }
    socket.send(JSON.stringify(sendObjToServer))
}


socket.on('message', (data) => {
    let parsedMessage = JSON.parse(data);
    let gameState = parsedMessage.gameState;
    let roomDiv = document.getElementById("room");
    let playerNamePrompt = document.getElementById("playerNamePrompt");
    let playerNamePromptErr = document.getElementById("playerNamePromptErr");

    switch (parsedMessage.responseToken) {
        case "PLAYER_JOINED_GAME":
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
        case "PLAYER_ALREADY_JOINED":
            playerNamePrompt = document.getElementById("playerNamePrompt");

            playerNamePrompt.hidden = false;
            playerNamePromptErr = document.getElementById("playerNamePromptErr");
            playerNamePromptErr.innerHTML = "Player with that name has already joined the game";
            break;
        case "CLEARED_GAME_STATE":
            location.reload();
        default:
            console.log(parsedMessage);
    }
});

let joinGamePrompt = document.getElementById("playerNamePrompt");
joinGamePrompt.onsubmit = (event) => {
    event.preventDefault();
    joinGame();
}

document.getElementById('joinGame').onclick = joinGame;