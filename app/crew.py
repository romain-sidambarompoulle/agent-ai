from crewai import Crew, Agent
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

analyste = Agent(
    role="Analyste",
    goal="Analyser la question de l’utilisateur et identifier les points clés",
    backstory="Expert en décomposition de problèmes, toujours précis et factuel.",
    llm=llm,
)

redacteur = Agent(
    role="Rédacteur",
    goal="Formuler une réponse claire et pédagogique",
    backstory="Auteur passionné, capable d’expliquer des concepts complexes simplement.",
    llm=llm,
)

verificateur = Agent(
    role="Vérificateur",
    goal="Contrôler l’exactitude et la cohérence de la réponse",
    backstory="Relecteur minutieux, traque la moindre incohérence ou faute.",
    llm=llm,
)

crew = Crew(agents=[analyste, redacteur, verificateur], vote="majority")

def run(question: str) -> str:
    """Réunit les concierges puis retourne la réponse majoritaire."""
    return crew.run(question)