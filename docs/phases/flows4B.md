# Sprint 4B — Premier flow « Hello-Agent »

> **Version 2.3 – 10 mai 2025**
> Aligné sur *Pivot LangFlow → ActivePieces* (React-Flow Builder arrivera au sprint 5).
> 🏗️ *Métaphore* : on **dessine** le circuit dans l’atelier **LangFlow**, puis on **branche** le tableau électrique dans la maison ActivePieces.

---

## 1. Pré‑requis

| Élément           | Valeur / URL                                                    |
| ----------------- | --------------------------------------------------------------- |
| UI ActivePieces   | `http://localhost:31<idx>` **ou** `http://ui.<slug>.domain.tld` |
| Atelier LangFlow  | `http://localhost:78<idx>` (interne DevOps)                     |
| Fichier d’exemple | `templates/hello_agent.flow.json` (exporté depuis LangFlow)     |

---

## 2. Export depuis LangFlow puis import dans ActivePieces

1. Dans **LangFlow**, ouvrez le projet **« Hello‑Agent »** → **Export JSON**.
2. Copiez le fichier exporté dans `compose/<slug>/external/activepieces/templates`.

```yaml
- cmd: ap import --file templates/hello_agent.flow.json
  path: C:\projets\agent-ai\compose\<slug>\external\activepieces
  venv: off
```

Le flow apparaît aussitôt dans l’UI ActivePieces ; déclenchez‑le pour vérifier la réponse de l’agent IA.

---

## 3. Build de l’image ActivePieces (optionnel)

```yaml
- cmd: docker compose build activepieces
  path: C:\projets\agent-ai\compose\<slug>
  venv: off
```

*(Re‑build uniquement après ajout ou mise à jour d’une **Piece**.)*

---

## 4. Lancement du flow

Dans l’UI ActivePieces, cliquez sur **Test** ; vérifiez que **Phoenix** reçoit les spans OTEL, puis consultez la réponse de l’agent IA.

---

## 5. Stub `/build` (CI)

Exemple d’appel depuis PowerShell :

```powershell
curl.exe -s -X POST "http://localhost:31<idx>/build" ^
  -H "X-Api-Key: $env:AP_KEY" ^
  -H "Content-Type: application/json" ^
  -d '{"flowId":"hello_agent"}' | ConvertFrom-Json
```

*(Header **X‑Tenant** désormais facultatif ; laissez‑le vide sauf compatibilité ascendante.)*

---

## 6. Check‑list fin de sprint 4B

* [ ] Flow **exporté depuis LangFlow** → importé dans UI `compose/<slug>`
* [ ] Credentials ajoutés (**X-Api-Key**)
* [ ] Test UI **OK**, traces Phoenix visibles
* [ ] Pipeline CI **/build** vert

---

## 7. Préparer la phase 4C

| Action                                           | Pourquoi                                       | Responsable |
| ------------------------------------------------ | ---------------------------------------------- | ----------- |
| Finaliser `FlowSchema` JSON                      | Le **compiler** aura besoin d’un schema stable | Backend     |
| Converter stub `/build` → logique réelle FastAPI | Phase 4C active la génération de code          | Backend     |
| Créer dossier `compiler/templates/`              | Stocker `flow.py.j2`, `runner.py.j2`           | Dev         |
| Provisionner PAT Git *tenant/acme*               | Push branche dans 4C                           | Dev Ops     |
| Activer Phoenix tracer dans `activepieces-core`  | Spans build                                    | Dev         |
| Script CLI `create_tenant.ps1` opérationnel      | Branche Git, PAT, secrets MCP, bucket MinIO    | Dev Ops     |

> 🔜 **Sprint 4C** correspond au document **LegoStudio4C.md** : il introduira la couche *compiler* et les webhooks.

---

## 8. Timeline indicative (1 jour)

| Matin                                     | Après‑midi                          |
| ----------------------------------------- | ----------------------------------- |
| Import flow JSON, test HTTP               | Créer Piece « Hello » + re‑build UI |
| Configurer stub `/build` + vérifier spans | Docs, screenshots, merge PR         |

---

## 📝 Changelog

| Version  | Date       | Motif                                                                                                                |
| -------- | ---------- | -------------------------------------------------------------------------------------------------------------------- |
| **v2.3** | 2025-05-10 | Ajout sections build image, lancement flow, stub `/build`, check‑list & timeline complètes ; lien vers LegoStudio4C. |
| v2.2     | 2025-05-10 | Procédure LangFlow → ActivePieces ; pré‑requis LangFlow.                                                             |
| v2.1     | 2025-05-10 | Pivot Scénario B : chemins `compose/<slug>`, build unique ActivePieces, suppression header X‑Tenant obligatoire.     |
