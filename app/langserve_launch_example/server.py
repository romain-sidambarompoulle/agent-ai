from fastapi import FastAPI, HTTPException, Request
from langserve import add_routes
from .chain import get_chain

app = FastAPI(title="LangServe Launch Example")

add_routes(app, get_chain())        # ✅ sans input_schema

# --- Nouveau registre ---------------------------------------------------
FLOWS = {
    "joke": get_chain(),                # d'autres bientôt : "summary": get_summary_chain(), …
}

@app.post("/run-{slug}")
async def run_slug(slug: str, request: Request):
    """Exécute le flow identifié par <slug>.

    Corps JSON attendu : { "input": "<texte utilisateur>" }
    Réponse : { "output": <résultat du flow> }
    """
    if slug not in FLOWS:
        raise HTTPException(status_code=404, detail="Flow inconnu")

    data = await request.json()
    user_input = data.get("input", "")
    if not user_input:
        raise HTTPException(status_code=422, detail="Champ 'input' requis")

    chain = FLOWS[slug]                 # réutilise l'instance (mémoire Chroma partagée)
    result = await chain.ainvoke({"input": user_input})
    return {"output": result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)