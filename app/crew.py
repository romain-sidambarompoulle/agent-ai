from crewai import Crew, Agent
from langchain_openai import ChatOpenAI

# LLM partagé par tous les concierges
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

analyste     = Agent("Analyste",     llm)
redacteur    = Agent("Rédacteur",    llm)
verificateur = Agent("Vérificateur", llm)

crew = Crew(agents=[analyste, redacteur, verificateur], vote="majority")

def run(question: str) -> str:
    """Réunit les concierges puis retourne la réponse majoritaire."""
    return crew.run(question)