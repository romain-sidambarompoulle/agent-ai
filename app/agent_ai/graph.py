from langgraph.graph import StateGraph
from app.crew import run as crew_run      # 🆕 branchement CrewAI

def think(state: dict) -> dict:
    return state                 # TODO: logique de réflexion

def validate(state: dict) -> bool:
    """Appelle la réunion CrewAI, range la réponse dans l'état, renvoie True."""
    question = state.get("msg", "")               # texte à valider
    state["llm_answer"] = crew_run(question)      # 🆕 réponse des concierges
    return True                                   # déclenche la suite

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