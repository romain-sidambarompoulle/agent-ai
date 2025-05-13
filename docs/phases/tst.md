# Vision préambule — Une stack CE par client + Edge‑Agent local

> **Version 1.2 – 10 mai 2025**
> Aligné sur *Boussole d’état – 10 mai 2025* (pivot « LangFlow → React‑Flow Builder »)
> 🧱 **1 stack = 1 client** & 🦾 **1 Edge‑Agent par PC client**

---

## 1. Vision (5 points clés)

1. **Open‑source only** : tous les composants (ActivePieces CE 0.39, LangFlow, React‑Flow Builder, CrewAI, Edge‑Launcher, etc.) sont sous licence permissive.
2. **Déploiement cloud → Docker local** : chaque client reçoit une *maison* (`compose/<slug>`) clonable sur son infrastructure.
3. **Isolation naturelle** : dossier `compose/<slug>`, branche Git `tenant/<slug>`, vault secrets dédié ; aucun header `X‑Tenant` requis, la traçabilité passe par `stack_port:31<idx>`.
4. **Compiler dual‑target** : à chaque sauvegarde de flow (LangFlow **ou** React‑Flow Builder), il produit : ① un *Cloud Agent* Python (LangServe) ; ② un *Edge‑Agent* (bundle desktop signé) capable de manipuler fichiers & apps locales.
5. **Simplicité GPS** : pour toute opération, fournir *maximum deux commandes* (chemin & venv précisés) avant de demander confirmation.

---

## 2. Règles d’or

| # | Règle                          | Application concrète                                                                       |
| - | ------------------------------ | ------------------------------------------------------------------------------------------ |
| 1 | **On‑boarding locataire**      | Script `create_tenant.ps1 <slug>` crée la stack, la branche Git, le PAT et le vault scope. |
| 2 | **Pas de hard‑code**           | Secrets dans Vault MCP ; jamais dans `.env` global.                                        |
| 3 | **Observabilité systématique** | Phoenix span taggés `stack_port` (+ `agent_type`).                                         |
| 4 | **Rollback prêt**              | Toute insertion de hack temporaire = ADR + date retrait.                                   |

---

## 3. Checklist rapide avant sprint

* [ ] Stack `compose/<slug>` générée ?
* [ ] Branche `tenant/<slug>` poussée ?
* [ ] Credentials ajoutés via UI ?
* [ ] Phoenix collector actif ?
* [ ] Edge‑Launcher installé sur poste client (si phase 6 lancée) ?

---

## 4. Références‑clés

* [00\_OVERVIEW\_INSTRUCTIONS.md](00_OVERVIEW_INSTRUCTIONS.md) — Contraintes invariantes.
* [UI.md](UI.md) v 2.1 — Image CE fusionnée.
* [activepieces\_4A.md](activepieces_4A.md) — Stack CE isolée.
* [Legostudio4c.md](Legostudio4c.md) — Compiler Service stack isolée.
* [Gitstrategy\_par\_client.md](Gitstrategy_par_client.md) — Branches & quotas.
* [Legostudio5.md](Legostudio5.md) v 5.2 — Dual‑target Cloud / Desktop.
* [Edgeagent6.md](Edgeagent6.md) v 6.2 — Installation Edge‑Agent.
* **Boussole 10‑05‑2025** — Source de vérité architecture.

---

## 5. Métaphore finale

> Imagine un **lotissement LEGO** : chaque client reçoit sa propre maison préfabriquée (stack CE) et son **robot de bureau** personnel (Edge‑Agent) pour bricoler à l’intérieur. Pas de couloir commun, aucune clé passe‑partout : la sécurité et la tranquillité sont acquises.

---

## 🔗 Référence centrale

Pour les détails complets de l’architecture, consulter **Boussole d’état – 10 mai 2025** (`docs/boussole_2025-05-10.md`).

---

## 📝 Changelog

| Version  | Date       | Motif                                                                                                |
| -------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| **v1.2** | 2025‑05‑10 | Suppression de la copie intégrale de la Boussole ; ajout lien de référence et alignement React‑Flow. |
| v1.1     | 2025‑05‑10 | Pivot Scénario B : suppression workspace & X‑Tenant, ajout Edge‑Agent, métaphore lotissement.        |
| v1       | 2025‑05‑06 | Préambule de Vision initial (multi‑tenant).                                                          |




