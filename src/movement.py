import sys
# Preconditions: game has already started
# Postconditions: players are assigned pieces, and starting locations
def initialize_movement_state(globalGameState):
    initialState = globalGameState
    try:
        starting_locations = {
            "plum": {"x": 112, "y": 158},
            "white": {"x": 360, "y": 384},
            "peacock": {"x": 114, "y": 356},
            "green": {"x": 167, "y": 384},
            "scarlett": {"x": 351, "y": 107},
            "mustard": {"x": 411, "y": 168}
        }
        # Format is: playerName: character for associations
        associations = dict()
        associated_characters = list()
        index = 0
        characters = starting_locations.keys()
        # Make the player association with the piece
        for player in globalGameState["players"]:
            associations[player] = characters[index]
            associated_characters.append(characters[index])
            index += 1
        unassigned = list()
        if not len(associations) == len(characters):
            for ii in range(len(characters)):
                if not characters[ii] in associated_characters:
                    unassigned.append(characters[ii])
        globalGameState["movement_info"] = {
            "associations": associations,
            "current_locations": starting_locations,
            "unassigned_characters": unassigned
        }
        return globalGameState
    except:
        print("Unexpected error:", sys.exc_info()[0])
        return initialState