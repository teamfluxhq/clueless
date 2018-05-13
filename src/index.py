###################################
## Team Flux Copyright 2018
## 
###################################
from flask import Flask, render_template
from flask_socketio import SocketIO, send, emit
import json
import random
import movement
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# Wrap the flask socket io middleware
socketio = SocketIO(app)

globalGameState = {
    "players": [],
    "turn": 0,
    "current_player": "",
    "player_cards": dict(),
    "current_suggestion": dict(),
    "can_disprove": dict(),
    "disproving_player": "",
    "can_accuse": dict(),
    "accusation": dict(),
    "solution": dict(),
    "game_ended": False
}

weapons = ["candlestick", "revolver",
           "rope", "wrench",
           "lead_pipe", "knife"]

rooms = ["study", "library", "conservatory",
         "hall", "kitchen", "ballroom",
         "dining_room", "lounge", "billiard_room"]

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
            "current_player": "",
            "player_cards": dict(),
            "current_suggestion": dict(),
            "can_disprove": dict(),
            "disproving_player": "",
            "can_accuse": dict(),
            "accusation": dict(),
            "solution": dict(),
            "game_ended": False
        }
        response = {
                "responseToken": "CLEARED_GAME_STATE",
                "payload": "Cleared game state",
                "gameState": globalGameState
        }
        responseStr = json.dumps(response)
        emit('message', responseStr, broadcast=True)

    elif given_action["action"] == "START_GAME":
        # createSolution()
        # print(solution)
        # assignCards()
        initialize_card_state()
        globalGameState = movement.initialize_movement_state(globalGameState)
        
        for player in globalGameState["players"]:
            globalGameState["can_accuse"][player] = True;

        print(globalGameState)

        globalGameState["current_player"] = globalGameState["players"][0]
        response = {
            "responseToken": "GAME_STARTED_STATE",
            "payload": "Game Started",
            "gameState": globalGameState
        }
        responseStr = json.dumps(response)
        emit('message', responseStr, broadcast=True)
        
    elif given_action["action"] == "END_TURN":
        globalGameState["movement_info"]["current_locations"] = given_action["payload"]["current_locations"]
        globalGameState["solution"] = dict()
        globalGameState["turn"] += 1
        globalGameState["current_player"] = globalGameState["players"][globalGameState["turn"] % len(globalGameState["players"])]
        response = {
            "responseToken": "SUGGEST_STATE",
            "payload": "Turn Ended",
            "gameState": globalGameState
        }
        responseStr = json.dumps(response)
        emit('message', responseStr, broadcast=True)
    elif given_action["action"] == "SUGGEST":
        print("Player {} suggested the murder took place in {}, with {} using {}".format(globalGameState["current_player"], "CURRENT ROOM", given_action["suspect"], given_action["weapon"]))
        globalGameState["current_suggestion"]["suspect"] = given_action["suspect"]
        globalGameState["current_suggestion"]["weapon"] = given_action["weapon"]
        locations = given_action["locations"]
        suspect = given_action["suspect"]
        current_player = globalGameState["current_player"]
        current_player_character = globalGameState["movement_info"]["associations"][current_player]
        locations[suspect] = locations[current_player_character]
        globalGameState["movement_info"]["current_locations"] = locations

        # Set the suspect's location to the 
        for player in globalGameState["players"]:
            if not (player == globalGameState["current_player"]):
                if given_action["weapon"] in globalGameState["player_cards"][player]:
                    print("{} can disprove using {}".format(player, given_action["weapon"]))
                    if player not in globalGameState["can_disprove"]:
                        globalGameState["can_disprove"][player] = [given_action["weapon"]]
                    else:
                        globalGameState["can_disprove"][player].append(given_action["weapon"])
                if given_action["suspect"] in globalGameState["player_cards"][player]:
                    print("{} can disprove using {}".format(player, given_action["suspect"]))
                    if player not in globalGameState["can_disprove"]:
                        globalGameState["can_disprove"][player] = [given_action["suspect"]]
                    else:
                        globalGameState["can_disprove"][player].append(given_action["suspect"])
                # Location
                if given_action["room"] in globalGameState["player_cards"][player]:
                    print("{} can disprove using {}".format(player, given_action["room"]))
                    if player not in globalGameState["can_disprove"]:
                        globalGameState["can_disprove"][player] = [given_action["room"]]
                    else:
                        globalGameState["can_disprove"][player].append(given_action["room"])

        next_player_index = (globalGameState["players"].index(globalGameState["current_player"]) + 1) % len(globalGameState["players"])
        globalGameState["disproving_player"] = globalGameState["players"][next_player_index]

        response = {
            "responseToken": "PRE_DISPROVE",
            "payload": "Pre Disprove State",
            "gameState": globalGameState
        }
        responseStr = json.dumps(response)
        emit('message', responseStr, broadcast=True)
    elif given_action["action"] == "DISPROVE":
        disprove_value = given_action["disproveValue"]
        if disprove_value == "novalue":
            next_player_index = (globalGameState["players"].index(globalGameState["disproving_player"]) + 1) % len(globalGameState["players"])
            globalGameState["disproving_player"] = globalGameState["players"][next_player_index]
            if not globalGameState["disproving_player"] == globalGameState["current_player"]:
                response = {
                    "responseToken": "DISPROVE_STATE",
                    "payload": "Disprove State",
                    "gameState": globalGameState
                }
                responseStr = json.dumps(response)
                emit('message', responseStr, broadcast=True)
            else:
                print("No player can disprove {}".format(globalGameState["current_player"]))
                globalGameState["can_disprove"] = dict()
                response = {
                    "responseToken": "ACCUSE_STATE",
                    "payload": "disproveFailed",
                    "gameState": globalGameState
                }
                responseStr = json.dumps(response)
                emit('message', responseStr, broadcast=True)
        else:
            print("{} can disprove using {}".format(globalGameState["disproving_player"], disprove_value))
            globalGameState["can_disprove"] = dict()
            response = {
                "responseToken": "ACCUSE_STATE",
                "payload": "{} disproved you using {}".format(globalGameState["disproving_player"], disprove_value),
                "gameState": globalGameState
            }
            responseStr = json.dumps(response)
            emit('message', responseStr, broadcast=True)
    elif given_action["action"] == "ACCUSE":
        print('{} accused {} of the murder using {} in {}.'.format(globalGameState["current_player"],  given_action["suspect"], given_action["weapon"], "room"))
        globalGameState["accusation"]["weapon"] = given_action["weapon"]
        globalGameState["accusation"]["suspect"] = given_action["suspect"]

        if (solution["weapon"] == given_action["weapon"] and solution["suspect"] == given_action["suspect"] and solution["room"] == given_action["room"]):
            # accuse correct, congrats
                globalGameState["game_ended"] = True
                response = {
                    "responseToken": "ACCUSE_SUCCESS",
                    "payload": "Accuse Success",
                    "gameState": globalGameState
                }
                responseStr = json.dumps(response)
                emit('message', responseStr, broadcast=True)
        else:
            globalGameState["can_accuse"][globalGameState["current_player"]] = False
            print(globalGameState["can_accuse"])
            globalGameState["game_ended"] = not any(globalGameState["can_accuse"].values())

            print(globalGameState["game_ended"])
            globalGameState["solution"] = solution
            response = {
                "responseToken": "ACCUSE_FAILURE",
                "payload": "Accuse Failure",
                "gameState": globalGameState
            }
            responseStr = json.dumps(response)
            send(responseStr)
    else:
        response = {
            "responseToken": "UNIDENTIFIED_ACTION",
            "payload": "Unidentified action",
            "gameState": globalGameState
        }
        responseStr = json.dumps(response)
        send(responseStr)


# Randomly creates the answer envelop
# Randomly assign cards to players
def initialize_card_state():
    global solution
    global weapons
    global rooms
    global suspects
    global globalGameState

    globalGameState["player_cards"] = dict()

    random.shuffle(weapons)
    random.shuffle(rooms)
    random.shuffle(suspects)

    solution["weapon"] = weapons[0]
    solution["room"] = rooms[0]
    solution["suspect"] = suspects[0]

    combined_cards = weapons[1:len(weapons)] + rooms[1:len(rooms)] + suspects[1:len(suspects)]
    print(solution)

    random.shuffle(combined_cards)

    r = len(combined_cards) % len(globalGameState["players"])
    q = len(combined_cards) / len(globalGameState["players"])
    start = 0
    stop = q
    for player in globalGameState["players"]:
        if r > 0:
            stop += 1
            r -= 1
        globalGameState["player_cards"][player] = combined_cards[start:stop]
        start = stop
        stop += q


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True, threaded=True, passthrough_errors=False)
