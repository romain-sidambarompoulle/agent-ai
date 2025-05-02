"""Custom chain avec mémoire Chroma."""

# --- Imports ---------------------------------------------------------------
import os  
from langchain_openai import ChatOpenAI
from langchain.output_parsers.openai_functions import JsonOutputFunctionsParser
from langchain.prompts.chat import ChatPromptTemplate
from langchain.schema.runnable import Runnable, RunnableLambda
from langchain.vectorstores import Chroma
from langchain.embeddings.openai import OpenAIEmbeddings
from app.agent_ai.graph import graph_exec

# --- Mémoire ---------------------------------------------------------------
EMBED = OpenAIEmbeddings()            # ↳ traduit texte → vecteur

# Choix du répertoire : None ⇒ Chroma in-memory (tests)
PERSIST_DIR = None if os.getenv("CHROMA_TEMP") else "app/data/chroma"

MEMORY = Chroma(
    collection_name="chat_memory",
    embedding_function=EMBED,
    persist_directory=PERSIST_DIR,
)

# --- Fonction “joke” (inchangée) -------------------------------------------
joke_func = {
    "name": "joke",
    "description": "A joke",
    "parameters": {
        "type": "object",
        "properties": {
            "setup": {"type": "string", "description": "The setup for the joke"},
            "punchline": {
                "type": "string",
                "description": "The punchline for the joke",
            },
        },
        "required": ["setup", "punchline"],
    },
}

# ---------------------------------------------------------------------------


def get_chain() -> Runnable:
    """Chaîne avec recherche + sauvegarde mémoire (signature OK)."""

    last_prompt = {}          # petit conteneur qui vivra dans la closure

    # 1️⃣  Chercher souvenirs + enregistrer le prompt
    def _add_context(inputs: dict) -> dict:
        user_prompt = inputs["topic"]
        last_prompt["topic"] = user_prompt      # on garde pour plus tard
        similar = MEMORY.similarity_search(user_prompt, k=4)
        context = "\n".join(d.page_content for d in similar)
        inputs["context"] = context
        return inputs
    add_context = RunnableLambda(_add_context)

    # 2️⃣  Prompt enrichi
    prompt = ChatPromptTemplate.from_template(
        "{context}\n\ntell me a joke about {topic}"
    )

    # 3️⃣  Modèle + parser
    model = ChatOpenAI().bind(
        functions=[joke_func], function_call={"name": "joke"}
    )
    parser = JsonOutputFunctionsParser()

    # 4️⃣  Sauvegarde — n’accepte qu’un seul arg (result)
    def _store_in_memory(result):
        MEMORY.add_texts([last_prompt["topic"], str(result)])
        return result
    store_in_memory = RunnableLambda(_store_in_memory)

    # 5️⃣  Pipeline final
    return add_context | prompt | model | parser | store_in_memory