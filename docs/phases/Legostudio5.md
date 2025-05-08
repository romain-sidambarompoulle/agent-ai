# Phase 5 — Lego‑studio étendu : dual‑target

> **Objectif :** étendre le Compiler Service pour gérer **deux cibles** dans un même flow ActivePieces :
>
> * **cloud** : runners LangGraph/CrewAI hébergés (déjà opérationnels fin 4C)
> * **edge** : scripts destinés à l’Agent local (Playwright, AutoHotkey, etc.)
>
> À la fin de la phase 5, un client pourra composer visuellement un workflow mixte et obtenir, en un clic :
>
> 1. un runner cloud auto‑déployé;
> 2. un script edge empaqueté, versionné et prêt à être récupéré par l’Edge‑Agent (phase 6).

---

## 1. Pré‑requis (issus de 4C)

| Élément                                  | Vérif. rapide                | Cmd YAML                                    |
| ---------------------------------------- | ---------------------------- | ------------------------------------------- |
| Compiler Service v1 up                   | `GET /healthz → 200`         | `cmd: curl -s http://compiler:9000/healthz` |
| Champ `target` présent dans `FlowSchema` | Pydantic compile sans erreur | —                                           |
| Dossier `edge_scripts/` versionné        | `ls edge_scripts`            | `cmd: dir edge_scripts`                     |

---

## 2. Architecture dual‑target

```
ActivePieces ──► /build
                  │
                  ▼
          Compiler Service v2
           ├── cloud runner  (app/flows/, app/runners/)
           └── edge bundle   (edge_scripts/, manifest.json)
```

* **Manifest** (`manifest.json`) contient : slug, version, sha256, runtime (`python`, `autohotkey`), requirements.
* Le bundle edge est zippé et envoyé dans un bucket MinIO (`s3://edge-artifacts`).
* L’URL signée + version retourne à ActivePieces pour affichage.

---

## 3. Tâches détaillées

| #   | Tâche                                   | Sortie attendue                                                                                 |
| --- | --------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 3.1 | **Étendre `FlowSchema`**                | Attributs :`target`, `edge_runtime`, `edge_requirements`, `edge_env`.                           |
| 3.2 | **Templates edge**                      | `edge_playwright.py.j2`, `edge_ahk.ahk.j2`. Placeholders pour steps et sélecteurs.              |
| 3.25 |**Injection credentials** → edge_env    | Mapper chaque {{credential.*}} UI ActivePieces vers variables chiffrées dans edge_env.          |
| 3.3 | **Split compiler**                      | Fonction `split_nodes(flow)` → deux listes nodes\_cloud, nodes\_edge.                           |
| 3.4 | **Generate edge artifact**              | Zip = `edge_scripts/<slug>-<ver>.zip` + manifest.json.                                          |
| 3.5 | **Upload + sign URL** (MinIO presigned) | Retour JSON `{edge_url, edge_sha256, version}`.                                                 |
| 3.6 | **Cloud↔Edge handshake**                | Protocole : runner cloud poste `POST /edge/notify {run_id, payload}`. Stub service accepte 200. |
| 3.7 | **Tests unitaires**                     | PyTest : build sample flow mixte, assert files, sha256, handshake.                              |
| 3.8 | **CI update**                           | Job `edge-build` : lint edge code (ruff), run Playwright headless smoke.                        |
| 3.9 | **Docs**                                | `docs/dual_target.md` + diagram mermaid.                                                        |

---

## 4. Bonnes pratiques & sécurité
#### 4.1 Stratégie Git multi-tenant – continuité de 4C

* **Branche dédiée par client** : `tenant/<slug>`  
  - Les bundles edge et le manifest JSON sont commités dans la même branche que les runners cloud.  
  - Le token Git du tenant n’a accès qu’à sa branche.

* **Tagging dual-target**  
  - Runner cloud : `bld/<slug>/<ver>-cloud`  
  - Bundle edge : `bld/<slug>/<ver>-edge`

* **Purge & GC automatiques**  
  - Tags older than 30 j → supprimés par cron.  
  - `git gc --prune=30.days.ago --aggressive` hebdomadaire (par branche).

* **CI ciblée**  
  - Les jobs `edge-build` et `cloud-build` ne se déclenchent que sur `paths: tenant/<slug>/**`.  
  - Minutes Actions optimisées, isolation complète.

* **Quota builds**  
  - 100 builds/24 h/tenant, HTTP 429 si dépassement ; métrique envoyée à Phoenix (`build.reject.quota`).

> *Rappel :* cette convention prolonge la logique introduite en phase 4C ; elle garantit l’historique, la traçabilité et l’isolation RGPD tout en maîtrisant la taille du dépôt.


* **Sandbox génération** : build dans `/tmp/build-XXXX`, user non‑root, suppression en fin de tâche.
* **Signature SHA‑256** dans manifest → vérifiée par l’Edge‑Agent (phase 6).
* **Limite de taille** : refuser bundle > 10 MB.
* **Variables sensibles** : passer par `edge_env` chiffré (Vault, SOPS). Empreinte passtockée en clair.

---

## 5. Check‑list de sortie Sprint 5

* [ ] Flow mixte démo (`sample_dual.json`) génère runner + bundle edge.
* [ ] Upload S3/MinIO fonctionnel, URL signée testée.
* [ ] Phoenix trace `build.edge.<slug>`.
* [ ] CI verte incluant tests Playwright headless.
* [ ] Guide utilisateur « Comment lier un flow edge » rédigé.

---

## 6. Préparer phase 6 — Edge‑Agent packaging

| Point à préparer dès maintenant                         | Pourquoi                                                        |
| ------------------------------------------------------- | --------------------------------------------------------------- |
| **Manifest v1** figé (slug, version, sha, url, runtime) | L’Agent utilisera ce format pour vérifier les bundles.          |
| **Endpoint `/edge/notify`** mocké                       | L’Agent final remplacera le stub sans changer le runner cloud.  |
| **Bucket MinIO nommé `edge-artifacts`**                 | Fournir IAM policy prête pour download only.                    |
| **Edge runtimes listées** (`python`, `ahk`, `ps1`)      | Permet de packager les interprètes dans l’installeur (phase 6). |

---

## 7. Timeline indicative (4 jours)

| Jour | Matin                       | Après‑midi                  |
| ---- | --------------------------- | --------------------------- |
| J+0  | Schema + split\_nodes       | Templates edge + zip upload |
| J+1  | Manifest + SHA              | Protocole handshake stub    |
| J+2  | Tests unitaires + CI update | Docs + smoke Playwright     |
| J+3  | Rétro, hardening, go/no‑go  | Buffer imprévus             |

---

## 8. Ressources open‑source utiles

| Besoin             | Outil                       | Licence                          |
| ------------------ | --------------------------- | -------------------------------- |
| Zip & hash         | `python‑zipfile`, `hashlib` | Stdlib                           |
| Storage            | **MinIO**                   | AGPL‑3 (serveur), SDK Apache‑2.0 |
| RPA navigateur     | **Playwright**              | Apache‑2.0                       |
| AutoHotkey compile | **ahk2exe**                 | GPL‑2                            |
| Tunnel future      | **rathole**                 | Apache‑2.0                       |

---

> *Image mentale* : en phase 4C, on a construit une **imprimerie pour livres cloud**. En phase 5, on ajoute une **presse spéciale pour posters** destinés aux bureaux clients ; le manuscrit (JSON) est scindé, chaque presse imprime son format, et un coursier (URL signée) dépose le poster dans la boîte aux lettres locale prêt pour l’accrochage (Edge‑Agent).
s