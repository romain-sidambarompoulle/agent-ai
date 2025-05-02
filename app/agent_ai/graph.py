from langgraph.graph import StateGraph

def think(state: dict) -> dict:
    return state                 # TODO: logique de réflexion

def validate(state: dict) -> bool:
    return True                  # TODO: stub CrewAI (Sprint 3)

def act(state: dict) -> None:
    print("Action !", state)     # TODO: action réelle

g = StateGraph(dict)
g.add_node("think", think)
g.add_node("validate", validate)
g.add_node("act", act)

g.set_entry_point("think")
g.add_edge("think", "validate")
g.add_edge("validate", "act")

graph_exec = g.compile()