from crewai import Crew, Agent, Task, Process
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

analyste = Agent(
    role="Analyste",
    goal="Analyser la question et dégager les points clés",
    backstory="Expert en décomposition de problèmes, toujours précis.",
    llm=llm,
)
redacteur = Agent(
    role="Rédacteur",
    goal="Rédiger une réponse claire et pédagogique",
    backstory="Auteur passionné par la vulgarisation technique.",
    llm=llm,
)
verificateur = Agent(
    role="Vérificateur",
    goal="Contrôler l’exactitude et la cohérence",
    backstory="Relecteur méthodique, traque les incohérences.",
    llm=llm,
)

# --- tâche unique : répondre à {question} ---------------------------------
task = Task(
    description="Réponds de façon détaillée à la question : {question}",
    expected_output="Une réponse claire et concise pour l’utilisateur",
    agent=redacteur,          # le rédacteur produit la réponse finale
)

crew = Crew(
    agents=[analyste, redacteur, verificateur],
    tasks=[task],
    process=Process.sequential,   # ✅ plus besoin de manager pour le moment
    verbose=True,
)

def run(question: str) -> str:
    """Lance la crew et renvoie la réponse produite par la tâche."""
    result = crew.kickoff(inputs={"question": question})
    return str(result)            # cast simple du CrewOutput