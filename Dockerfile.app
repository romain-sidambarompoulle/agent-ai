FROM python:3.11-slim

WORKDIR /app
COPY . /app

# ─────────────────────────────────────────────────────────────────────────
# 1.  Installe les dépendances listées dans app/requirements.txt
# 2.  Installe ton code en editable (-e app)
# 3.  Ajoute les briques externes manquantes (langchain-community, sse_starlette) + langsmith
# ─────────────────────────────────────────────────────────────────────────
# -- outils nécessaires pour pip install depuis git ------------------------
RUN apt-get update && \
    apt-get install -y --no-install-recommends git && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir -r app/requirements.txt \
 && pip install --no-cache-dir -e app \
 && pip install --no-cache-dir langchain-community sse_starlette langsmith==0.1.147

EXPOSE 8000
ENV PORT=8000

# On passe $PORT à l’exécution
CMD ["sh", "-c", "uvicorn langserve_launch_example.server:app --host 0.0.0.0 --port $PORT"]