"""Crew – instanciée paresseusement après l’appel phoenix.register() des tests."""

from functools import lru_cache
from opentelemetry import trace


@lru_cache(maxsize=1)
def build_crew():
    # ⏰ Tous les imports décalés ici ⇒ Phoenix a déjà posé son TracerProvider
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

    task = Task(
        description="Réponds de façon détaillée à la question : {question}",
        expected_output="Une réponse claire et concise pour l’utilisateur",
        agent=redacteur,
    )

    return Crew(
        agents=[analyste, redacteur, verificateur],
        tasks=[task],
        process=Process.sequential,
        verbose=True,
    )


def run(question: str) -> str:
    """Execute la crew + crée un span OTEL ‘crew_run’ visible par Phoenix."""
    crew = build_crew()                     # construit maintenant ⇒ provider OK
    tracer = trace.get_tracer("crew")

    with tracer.start_as_current_span("crew_run"):
        result = crew.kickoff(inputs={"question": question})

    return str(result)