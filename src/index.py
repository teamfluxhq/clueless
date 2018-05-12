###################################
## Team Flux Copyright 2018
## 
###################################
from flask import Flask, render_template
from flask_socketio import SocketIO, send, emit
import movement
import json
import random
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# Wrap the flask socket io middleware
socketio = SocketIO(app)

globalGameState = {
    "players": [],
    "turn": 0,
    "current_player": "",
    "player_cards": dict(),
    "movement_info": dict(),
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
        # createSolution()
        # print(solution)
        # assignCards()
        initialize_card_state()
        globalGameState = movement.initialize_movement_state(globalGameState)        
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
    elif given_action["action"] == "SUGGEST":
        print(given_action["weapon"], given_action["suspect"])
	#add guard in for catching weapon and suspect just in case
	#also gather the player's current weapon
	#print to all users that a suggestion has been made using a modal
	for index in range(len(globalGameState["players"])):
	     if not (globalGameState["players"][index] == globalGameState["current_player"]):
	          if ( given_action["weapon"] in globalGameState["players"][index].player_cards and given_action["suspect"] in globalGameState["players"][index].player_cards):
		       #&& add in 3rd constraint for location)
 		       print("they can disprove")
		       #add in logic to print a modal pop up to the user who has a card that is being suggested 
		       
	          

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
# def createSolution():
#     global solution
#     solution["weapon"] = sample(weapons, 1)
#     solution["room"] = sample(rooms, 1)
#     solution["suspect"] = sample(suspects, 1)

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





# def assignCards():
#     global globalGameState


#     print(remainingCards)
#     remainingCards += [i for i in weapons if i != solution["weapon"]]
#     #weapons.extend(rooms)
#     print(remainingCards)
#     remainingCards += [i for i in weapons if i != solution["rooms"]]
#     #weapons.extend(suspects)
#     print(remainingCards)
#     remainingCards += [i for i in weapons if i != solution["suspects"]]

#     remainder = len(remainingCards) % len(globalGameState["players"])
#     equalDistribution = len(remainingCards) / len(globalGameState["players"])
#     remainingCards = sample(remainingCards, len(remainingCards))

#     for i in xrange (globalGameState["players"]):
#          globalGameState["player_cards"].append(remainingCards[i * equalDistribution:(i + 1) * equalDistribution])

#     if remainder != 0: 
#         for i in xrange(remainder):
#             globalGameState["player_cards"][i].append(remainingCards[len(remainingCards) - i - 1])
#     print globalGameState



if __name__ == '__main__':
   app.run(host="0.0.0.0", port=5000, debug=True, threaded=True, passthrough_errors=False)
