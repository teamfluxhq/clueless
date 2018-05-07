###################################
## Team Flux Copyright 2018
## 
##
###################################
from flask import Flask, render_template
from flask_socketio import SocketIO, send, emit
import json
from random
import sample
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# Wrap the flask socket io middleware
socketio = SocketIO(app)

globalGameState = {
    "players": [],
    "turn": 0,
    "current_player": ""
}

weapons = ["candlestick", "revolver",
           "rope", "wrench",
           "lead_pipe", "knife"]

rooms = ["study", "library", "conservatory",
         "hall", "kitchen", "ballroom",
         "dining_room", "lounge", "billard_room"]

suspects = ["white", "peacock",
              "scarlet", "mustard",
              "green", "plum"]

solution = {
    "weapon": "",
    "room": "",
    "suspect": ""
}


@app.route('/')
def game_view():
    return render_template('index.html', title="Home")

@socketio.on('CLIENT_CONNECTION')
def handle_client_connect(data):
    print("New client connected")

@socketio.on('message')
def handle_message(data):

    global globalGameState
    # Parse the given action in json, the given action is in
    # format {action: "SOME_ACTION", payload: { key: value }}
    given_action = json.loads(data)

    # TODO: Clean this up
    if given_action["action"] == "JOIN_GAME":
        playerName = given_action["payload"]["playerName"]
        if not playerName in globalGameState["players"]:
            # Ensure there is always 3 - 6 players
            # Temporarily adjust to 2 for ease of testing
            if len(globalGameState["players"]) < 6:
                globalGameState["players"].append(playerName)
                response = {
                    "responseToken": "PLAYER_JOINED_GAME",
                    "payload": playerName,
                    "gameState": globalGameState
                }
                responseStr = json.dumps(response)
                emit('message', responseStr, broadcast=True)
            else:
                response = {
                    "responseToken": "MAXIMUM_PLAYER_REACHED",
                    "payload": playerName,
                    "gameState": globalGameState
                }
                responseStr = json.dumps(response)
                send(responseStr)
        else:
            response = {
                "responseToken": "PLAYER_ALREADY_JOINED",
                "payload": playerName,
                "gameState": globalGameState
            }
            responseStr = json.dumps(response)
            send(responseStr)
    elif given_action["action"] == "RESET_GAME":
        globalGameState = {
            "players": [],
            "turn": 0,
            "current_player": ""
        }
        response = {
                "responseToken": "CLEARED_GAME_STATE",
                "payload": "Cleared game state",
                "gameState": globalGameState
        }
        responseStr = json.dumps(response)
        emit('message', responseStr, broadcast=True)

    elif given_action["action"] == "START_GAME":
        createSolution()
        print(solution)

        globalGameState["current_player"] = globalGameState["players"][0]
        response = {
            "responseToken": "GAME_STARTED_STATE",
            "payload": "Game Started",
            "gameState": globalGameState
        }
        responseStr = json.dumps(response)
        emit('message', responseStr, broadcast=True)
    elif given_action["action"] == "END_TURN":
        globalGameState["turn"] += 1
        globalGameState["current_player"] = globalGameState["players"][globalGameState["turn"] % len(globalGameState["players"])]
        response = {
            "responseToken": "PLAYER_STATE",
            "payload": "Player State",
            "gameState": globalGameState
        }
        responseStr = json.dumps(response)
        emit('message', responseStr, broadcast=True)
    else:
        response = {
            "responseToken": "UNIDENTIFIED_ACTION",
            "payload": "Unidentified action",
            "gameState": globalGameState
        }
        responseStr = json.dumps(response)
        send(responseStr)

# Randomly creates the answer envelop
def createSolution():
    global solution
    solution["weapon"] = sample(weapons, 1)
    solution["room"] = sample(rooms, 1)
    solution["suspect"] = sample(suspects, 1)

# Randomly assign cards to players
def assignCards():
    pass


if __name__ == '__main__':
   app.run(host="0.0.0.0", port=5000, debug=True, threaded=True, passthrough_errors=False)
