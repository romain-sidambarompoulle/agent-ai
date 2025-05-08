# Phase 4B — Flows manuels + Piece « Hello »

> **Objectif du sprint :** valider l’aller‑retour *UI ➜ backend* en créant **manuellement** un premier flow et une Piece « Hello World ». À la fin, cliquer *Run once* dans l’UI déclenche notre agent IA (cloud) et écrit un log dans Phoenix. Le stub `/build` est appelé, mais sans générer de code (ce sera la phase 4C).

---

## 1. Pré‑requis (hérités de 4A)

| Élément                   | Vérification rapide                            | Cmd YAML                             |
| ------------------------- | ---------------------------------------------- | ------------------------------------ |
| ActivePieces UI up        | Accès `http://localhost/ui`                    | —                                    |
| Branches *tenant* créées  | `tenant/acme` existe                           | `cmd: git branch --list tenant/acme` |
| Stub `/build` répond 200  | `curl -X POST http://compiler:9000/build/stub` | —                                    |
| Phoenix collector running | Span `ap.healthz` visible                      | —                                    |

---

## 2. Créer le dossier templates

```yaml
cmd: mkdir -p templates && echo {} > templates/README.md
path: repo
venv: off
```

> *Pourquoi :* regrouper tous les exemples JSON et pouvoir les versionner.

---

## 3. Flow « Hello World » (JSON minimal)

```json
{
  "name": "hello_world_flow",
  "version": "0.1.0",
  "nodes": [
    {
      "id": "trigger1",
      "type": "httpTrigger",
      "method": "POST",
      "url": "/hello"
    },
    {
      "id": "step1",
      "type": "runScript",
      "language": "python",
      "inline": "print(\"Hello from ActivePieces!\")"
    }
  ],
  "edges": [
    { "from": "trigger1", "to": "step1" }
  ]
}
```

Enregistrer sous : `templates/hello_world.flow.json`.

---

## 4. Importer le flow dans l’UI

```yaml
cmd: ap import --file templates/hello_world.flow.json --replace true
path: external/activepieces
venv: off
```

> Vérifier dans l’UI : `hello_world_flow` apparaît dans la liste.

---

## 5. Créer la Piece « Hello »

1. **Structure :** `external/activepieces/packages/community/piece-hello/`
2. `piece.json`

   ```json
   {
     "name": "hello",
     "displayName": "Say Hello",
     "description": "Renvoie Hello <name>",
     "version": "0.1.0",
     "type": "action",
     "props": {
       "name": {"type": "string", "required": true}
     }
   }
   ```
3. `index.ts`

   ```ts
   import { createAction } from '@activepieces/pieces';
   export const hello = createAction({
     name: 'hello',
     async run(ctx) {
       const name = ctx.propsValue['name'];
       return `Hello ${name}`;
     },
   });
   ```
4. Re‑build :

   ```yaml
   cmd: docker compose build activepieces-ui activepieces-core
   path: repo
   venv: off
   ```

---

## 6. Configurer le stub `/build`

Dans ActivePieces, **Settings → Webhooks** : ajouter :

```
POST http://compiler:9000/build/stub
Headers:  X-Tenant: acme
          X-Api-Key: ${{AP_BUILD_SECRET}}
```

> *Pourquoi :* simuler l’appel pour préparer 4C.

---

## 7. Exécuter et vérifier

1. Dans l’UI, créer un nouveau flow :
   *Trigger* = HTTP `/hello`
   *Action* = Piece « Say Hello » (`name = "World"`).
2. **Run once**.
3. Vérifier :

   * Console container `activepieces-core` affiche *Hello World*.
   * Phoenix → `flow.hello_world_flow` span success.
   * Conteneur `compiler` reçoit POST `/build/stub`.

---

## 8. Checklist de sortie sprint 4B

* [ ] Flow JSON importé et exécutable.
* [ ] Piece « Hello » visible & fonctionnelle.
* [ ] Stub `/build` appelé avec `X-Tenant` correct.
* [ ] Span Phoenix valide.
* [ ] Docs rapides : `docs/hello_piece.md`.

---

## 9. Préparer la phase 4C

| Action                                           | Pourquoi                                | Responsable |
| ------------------------------------------------ | --------------------------------------- | ----------- |
| Finaliser `FlowSchema` JSON                      | Compiler aura besoin d’un schema stable | Backend     |
| Convertir stub `/build` → logique réelle FastAPI | Phase 4C active la génération code      | Backend     |
| Créer dossier `compiler/templates/`              | Stocker `flow.py.j2`, `runner.py.j2`    | Dev         |
| Provisionner PAT Git *tenant/acme*               | push branche dans 4C                    | Dev Ops     |
| Activer Phoenix tracer dans `activepieces-core`  | spans build                             | Dev         |
- Script CLI **`create_tenant.sh`** opérationnel (branche Git, PAT, secrets MCP, bucket MinIO).
---

## 10. Timeline indicative (1 jour)

| Matin                       | Après‑midi                      |
| --------------------------- | ------------------------------- |
| Import flow JSON, test HTTP | Créer Piece Hello + re‑build UI |
| Configurer stub `/build`    | Exécuter, vérifier spans + docs |

---

> *Image mentale* : dans ce sprint, on **pose la première brique LEGO** (Hello World) et on teste que la sonnette (webhook) fonctionne. Le chantier est prêt à accueillir la grosse machine d’imprimerie (Compiler 4C) au sprint suivant.
