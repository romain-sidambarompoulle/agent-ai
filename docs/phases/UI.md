# UI.md

> **Version 2.2 – 10 mai 2025**
> Aligné sur *Boussole – pivot LangFlow (atelier) → React‑Flow Builder (table à dessin)*
> **Scope :**
> • ActivePieces **Community 0.39** = interface no‑code pour déclencheurs & credentials.
> • **LangFlow** = atelier interne où l’on dessine et teste les flows V1.
> • **React‑Flow Builder** (Next.js 14) = future interface UX skinnable .

---

## 1. Choix plateforme UI

| Critère          | Décision                                                                                                                                                                      | Notes                                                                                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework        | **ActivePieces Community 0.39** (`activepieces:0.39-ce`)<br/>**LangFlow** 1.x (`langflow:latest`) – *étape actuelle*<br/>*React‑Flow Builder* (Next.js 14) – *étape suivante* | ActivePieces : image fusion UI + API.<br/>LangFlow : service interne, port **78xx**, non exposé public.<br/>Builder : image `builder-front:latest`. |
| Personnalisation | ActivePieces : rebuild front (logo, palette).<br/>LangFlow : thème Tailwind minimal (palette primaire).<br/>Builder : tokens CSS + thèmes Tailwind.                           | 100 % open‑source, aucune dépendance EE.                                                                                                            |

---

## 2. Licences & white‑label

* Frontends **Apache 2.0**.
* Branding client dans `tenant/<slug>` : commit dédié.

---

## 3. Architecture déploiement (stack isolée)

| Service          | Port exposé | Rôle                                |
| ---------------- | ----------- | ----------------------------------- |
| traefik          | 80 / 443    | Reverse‑proxy (vhosts)              |
| phoenix          | 4318        | OTEL collector                      |
| chromadb         | 8000        | Vecteurs                            |
| secret‑mcp       | 8200        | Vault                               |
| **activepieces** | **80**      | UI **+** API (image CE)             |
| **langflow**     | **78xx**    | Atelier flows / catalogue (interne) |
| agent‑ai         | 8080        | LangServe                           |

> 💡 LangFlow reste privé ; React‑Flow Builder  sera servi sur `ui.<slug>.domain.tld`.

---

## 4. Déploiement local rapide

```yaml
- cmd: create_tenant.ps1 acme
  path: C:\projets\agent-ai
  venv: off
- cmd: docker compose up -d traefik phoenix chromadb secret-mcp langflow activepieces agent-ai
  path: C:\projets\agent-ai\compose\acme
  venv: off
```

L’URL par défaut :

* ActivePieces : `http://ui.acme.domain.tld`
* LangFlow : `http://localhost:78<idx>` (access interne DevOps)

---

## 5. Prochaines actions (Sprint 4A)

1. Générer stack : `create_tenant.ps1 <slug>`.
2. `docker compose up -d ... langflow activepieces ...`.
3. Importer un flow exemple dans LangFlow → **Save**.
4. Ajouter credentials dans ActivePieces puis tester déclenchement.
5. Vérifier traces Phoenix.

---

## 6. Observabilité

* **Phoenix first** – collector avant UI / LangFlow.
* Var `OTEL_EXPORTER_OTLP_ENDPOINT=http://phoenix:4318` dans ActivePieces & LangFlow.

---

## 7. Cross‑links

* [00\_OVERVIEW\_INSTRUCTIONS.md](00_OVERVIEW_INSTRUCTIONS.md) – Contraintes invariantes.
* [workflows.md](workflows.md) – Commandes Sprints.
* [activepieces\_4A.md](activepieces_4A.md) – Stack détail.
* [langflow\_guide.md](langflow_guide.md) – Atelier flows.
* [builder\_front.md](builder_front.md) – React‑Flow Builder (phase 3).

---

## 📝 Changelog

| Version  | Date       | Motif                                                                                                                        |
| -------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **v2.2** | 2025‑05‑10 | Ajout LangFlow comme atelier flows ; précise migration future vers React‑Flow Builder ; ajout service langflow dans l’archi. |
| v2.1     | 2025‑05‑10 | Pivot Scénario B : image CE unique, suppression header X‑Tenant, on‑boarding via `create_tenant.ps1`.                        |
| v2       | 2025‑05‑07 | Section Observabilité, branding.                                                                                             |
| v1       | 2025‑05‑03 | Création initiale.                                                                                                           |
