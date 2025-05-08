# Phase 6 — Edge‑Agent Packaging

> **Objectif :** livrer un installateur cross‑platform (Windows 10+, macOS, Linux) qui déploie l’**Edge‑Agent** capable de :
>
> 1. établir un tunnel sortant sécurisé vers le SaaS (rathole) ;
> 2. télécharger, vérifier (SHA‑256) et décompresser les bundles edge générés en phase 5 ;
> 3. exécuter les scripts (Playwright, AutoHotkey…) et remonter les résultats/logs ;
> 4. se mettre à jour automatiquement (auto‑update).
>
> À la fin de la phase 6, un client pourra installer l’agent en < 2 min, lier son token et voir ses workflows mixtes s’exécuter localement, sans ouvrir de port entrant.

---

## 1. Pré‑requis issus de la phase 5
#### 1.1 Vérification Git multi-tenant (héritée des phases 4C & 5)

* **Branche du tenant**  
  - L’installateur demande le *tenant-slug* (ou le lit dans le token JWT).  
  - Avant de démarrer, l’agent appelle `/api/branch-exists?name=tenant/<slug>` ; s’il reçoit `404`, il arrête l’installation → message d’erreur clair : *« Branche inexistante — contactez le support. »*

* **Manifest présent et signé**  
  - Télécharge `https://repo/raw/tenant/<slug>/manifest.json`.  
  - Vérifie :  
    1. champ `sha256`,  
    2. champ `runtime`,  
    3. signature (si activée).  
  - Sans manifest valide, aucun bundle n’est exécuté.

* **Nettoyage résident**  
  - L’agent exécute chaque dimanche :  
    ```bash
    git -C <repo-cache> tag --merged tenant/<slug> |
      grep '^bld/' |
      while read t; do
        TAG_DATE=$(git log -1 --format=%as $t)
        [ "$TAG_DATE" \< "$(date -d '30 days ago' +%Y-%m-%d)" ] && git tag -d $t
      done && git gc --prune=30.days.ago
    ```
  - Ainsi, le cache local n’enfle pas, même avec de nombreux builds.

* **Isolation stricte**  
  - L’agent ne fait *pull* que sur `tenant/<slug>`, jamais sur `core` ou sur les branches d’autres clients.  
  - Les credentials Git (PAT) sont limités en scope : `repo:tenant/<slug> read`.

> **But** : garantir que l’Edge-Agent ne récupère **que** les artefacts autorisés pour son client, tout en respectant la convention Git établie dès 4C.

| Élément                                                  | Vérification                                        | Cmd YAML                         |
| -------------------------------------------------------- | --------------------------------------------------- | -------------------------------- |
| Manifest v1 figé (`edge_url`, `sha256`, `runtime`)       | `jq .runtime manifest.json`                         | `cmd: jq .runtime manifest.json` |
| Bucket MinIO `edge-artifacts` accessible (download‑only) | `mc ls edge/edge-artifacts`                         | —                                |
| Endpoint `/edge/notify` stub OK                          | `curl -X POST http://api/edge/notify -d '{}'` → 200 | —                                |

---

## 2. Architecture de l’Edge‑Agent

```
┌──────────────┐           WebSocket TLS► SaaS
│  Edge-Agent  │────────────────────────────────┐
│              │                                │
│  • Updater   │←─ checks / version             │
│  • Tunneler  │ rathole / frp                  │
│  • Runner    │ Playwright, AHK, Python venv   │
└──────────────┘                                │
       ▲             results / logs ◄───────────┘
       │
     UI Tray (Electron)
```

* **Langage :** Go + Webview (petite UI tray) → binaire autonome.
* **Tunneler :** `rathole` (Apache‑2.0) embarqué en lib ou lancé en sous‑process.
* **Runner :**

  * `playwright` via Python 3.12 venv minimal ;
  * `AutoHotkey` (Windows) livré avec `ahk.exe` ;
  * fallback `subprocess` pour tout script `.py`.

---

## 3. Étapes détaillées

| #   | Tâche                            | Sortie attendue                                                                |
| --- | -------------------------------- | ------------------------------------------------------------------------------ |
| 3.1 | **Choix du framework packaging** | `goreleaser` config YAML prête pour Win/Mac/Linux.                             |
| 3.2 | **Implémenter tunnel sortant**   | PoC : ping websocket echo du SaaS.                                             |
| 3.3 | **Downloader + checksum**        | Télécharge `edge_url`, valide SHA‑256, stocke dans `~/EdgeFlows/<slug>/<ver>`. |
| 3.4 | **Runtime launcher**             | Map `runtime→executor` : `playwright`→`python venv`, `ahk`→`ahk.exe`.          |
| 3.5 | **Log & notify**                 | POST `/edge/notify` avec `run_id`, `stdout`, `stderr`, `status`.               |
| 3.6 | **Auto‑update**                  | Channel GitHub Releases ; vérifie version toutes les 24 h.                     |
| 3.7 | **Installer/signature**          | `msi` signé ; `pkg` notarisé Mac ; `deb/rpm` — checksum sur site.              |
| 3.8 | **Tests e2e headless**           | GitHub Actions VM : installe agent, exécute flow edge demo.                    |
| 3.9 | **Docs utilisateur**             | PDF « Installation & Dépannage ».                                              |

---

## 4. Bonnes pratiques & sécurité

* **Principle of least privilege :** exécuter sous un compte système dédié (`edgeagent`) sans admin.
* **Aucune ouverture de port :** tunnel sortant uniquement.
* **Chiffrement end‑to‑end :** rathole TLS + token JWT.
* **Audit local** : log file rotatifs dans `%PROGRAMDATA%\EdgeAgent\logs`.

---

## 5. Checklist de sortie sprint 6

* [ ] Installateur Windows signé et testé.
* [ ] AppImage / dmg fonctionnels sous Linux/Mac.
* [ ] Flow mixte demo s’exécute sur une VM Windows GitHub Actions.
* [ ] Auto‑update télécharge et installe une nouvelle version (smoke).
* [ ] Documentation utilisateur publiée dans `docs/edge_agent_install.md`.
* [ ] Entrée JOURNAL « Phase 6 terminée ».

---

## 6. Préparer la phase 7 — RAG complet

| Action à anticiper                    | Pourquoi                                                       |
| ------------------------------------- | -------------------------------------------------------------- |
| Exposer `edge_cache_dir` dans config  | Pour stocker embeddings locaux éventuels si futur RAG offline. |
| Définir protocole `file_upload`       | Permettra d’envoyer documents locaux au SaaS pour ingestion.   |
| Garder champ `cpu_arch` dans manifest | Évite recompilation côté compiler si on sert x86 et arm.       |

---

## 7. Timeline indicative (5 jours)

| Jour | Matin                | Après‑midi            |
| ---- | -------------------- | --------------------- |
| J+0  | PoC tunnel           | Downloader + checksum |
| J+1  | Runtime launchers    | Log/notify impl.      |
| J+2  | Packaging GoReleaser | Auto‑update PM        |
| J+3  | Tests VM / CI        | Signature MSI/dmg     |
| J+4  | Docs + rétro         | Buffer imprévus       |

---

## 8. Ressources open‑source

| Besoin             | Outil               | Licence    |
| ------------------ | ------------------- | ---------- |
| Tunnels            | **rathole**         | Apache‑2.0 |
| Packaging multi‑OS | **GoReleaser**      | MIT        |
| Update lib         | **go‑update**       | BSD        |
| UI système         | **Wails / Webview** | MIT        |
| RPA navigateur     | **Playwright**      | Apache‑2.0 |

---

> *Image mentale :* le Compiler (phase 5) glisse un **colis scellé** sur un tapis roulant S3.  L’Edge‑Agent est le **robot livreur** : il traverse un tunnel, scanne le QR‑code (SHA‑256), dépose le colis sur le bureau du client et rend compte aussitôt de la livraison.
