# Sprint 4B — Premier flow « Hello-Agent »

> **Version 2.4 – 14 mai 2025**
> Aligné sur *Pivot LangFlow → Builder maison* (ActivePieces devient \[OBSOLETE – remplacé par Builder]).
> 🏗️ *Métaphore* : on **dessine** le circuit dans l’atelier **LangFlow** puis on **branche** le tableau électrique dans la maison Builder.

---

## 1. Pré‑requis

| Élément           | Valeur / URL                                                    |
| ----------------- | --------------------------------------------------------------- |
| UI Builder        | `http://localhost:41<idx>` **ou** `http://ui.<slug>.domain.tld` |
| Atelier LangFlow  | `http://localhost:78<idx>` (interne DevOps)                     |
| Fichier d’exemple | `templates/hello_agent.flow.json` (exporté depuis LangFlow)     |

---

## 2. Export depuis LangFlow puis import dans Builder

1. Dans **LangFlow**, ouvrez le projet **« Hello‑Agent »** → **Export JSON**.
2. Copiez le fichier exporté dans `compose/<slug>/external/builder/templates`.

```yaml
- cmd: builder-cli import --file templates/hello_agent.flow.json
  path: C:\projets\agent-ai\compose\<slug>\external\builder
  venv: off
```

Le flow apparaît aussitôt dans l’UI Builder ; déclenchez‑le pour vérifier la réponse de l’agent IA.

---

## 3. Build de l’image Builder (optionnel)

```yaml
- cmd: docker compose build builder-api
  path: C:\projets\agent-ai\compose\<slug>
  venv: off
```

*(Optionnel si l’image de base a déjà été construite ou mise à jour après ajout ou mise à jour d’un **nœud**.)*

---

## 4. Lancement du flow

Dans l’UI Builder, cliquez sur **Run** ; vérifiez que **Phoenix** trace bien chaque étape de l’agent.

---

## 5. Stub `/build` (CI)

Exemple d’appel depuis PowerShell :

```powershell
curl.exe -s -X POST "http://localhost:41<idx>/build" ^
  -H "X-Api-Key: $env:BLD_KEY" ^
  -H "Content-Type: application/json" ^
  -d '{"flowId":"hello_agent"}' | ConvertFrom-Json
```

*(Header **X‑Tenant** désormais facultatif ; laissez‑le vide sauf compatibilité ascendante.)*

---

## 6. Check‑list fin de sprint 4B

* [ ] Flow **exporté depuis LangFlow** → importé dans UI `compose/<slug>`
* [ ] Credentials ajoutés (**X-Api-Key**)
* [ ] Run UI **OK**, traces Phoenix visibles
* [ ] Pipeline CI **/build** vert

---

## 7. Préparer la phase 4C

| Action                                           | Pourquoi                                       | Responsable |
| ------------------------------------------------ | ---------------------------------------------- | ----------- |
| Finaliser `FlowSchema` JSON                      | Le **compiler** aura besoin d’un schema stable | Backend     |
| Converter stub `/build` → logique réelle FastAPI | Phase 4C active la génération de code          | Backend     |
| Créer dossier `compiler/templates/`              | Stocker `flow.py.j2`, `runner.py.j2`           | Dev         |
| Provisionner PAT Git *tenant/acme*               | Push branche dans 4C                           | Dev Ops     |
| Activer Phoenix tracer dans `builder-core`       | Spans build                                    | Dev         |
| Script CLI `create_tenant.ps1` opérationnel      | Branche Git, PAT, secrets MCP, bucket MinIO    | Dev Ops     |

> 🔜 **Sprint 4C**

| Étape                                     | Livrables                          |
| ----------------------------------------- | ---------------------------------- |
| Import flow JSON, test HTTP               | Créer nœud « Hello » + re‑build UI |
| Configurer stub `/build` + vérifier spans | Docs, screenshots, merge PR        |

---

## 📝 Changelog

\| Version  | Date       | Motif                                 ...                                                               |
\| -------- | ---------- | --------------------------------------...-------------------------------------------------------------- |
\| **v2.4** | 2025-05-14 | Pivot complet vers Builder maison (imports, commandes, ports) |
\| **v2.3** | 2025-05-10 | Ajout sections build image, lancement `/build`, check‑list & timeline complètes ; lien vers LegoStudio4C. |
\| v2.2     | 2025-05-10 | Procédure LangFlow → ActivePieces \[OBSOLETE – remplacé par Builder] ; pré‑requis LangFlow. |
\| v2.1     | 2025-05-10 | Pivot Scénario B : chemins `compose/<slug>`, build unique ActivePieces \[OBSOLETE – remplacé par Builder], suppression header X‑Tenant obligatoire. |
