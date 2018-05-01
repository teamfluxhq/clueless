###################################
## Team Flux Copyright 2018
## 
##
###################################
from flask import Flask, render_template
from flask_socketio import SocketIO, send, emit
import json
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# Wrap the flask socket io middleware
socketio = SocketIO(app)

globalGameState = {
    "players": [] 
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
                "responseToken": "PLAYER_ALREADY_JOINED",
                "payload": playerName,
                "gameState": globalGameState
            }
            responseStr = json.dumps(response)
            send(responseStr)
    elif given_action["action"] == "RESET_GAME":
        globalGameState = {
            "players": []
        }
        response = {
                "responseToken": "CLEARED_GAME_STATE",
                "payload": "Cleared game state",
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

if __name__ == '__main__':
   app.run(host="0.0.0.0", port=5000, debug=True, threaded=True, passthrough_errors=False)