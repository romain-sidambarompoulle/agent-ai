# Edge-Agent 6 — Client Desktop Runner

> **Version 6.3 – 10 mai 2025**
> Aligné sur *Pivot LangFlow → ActivePieces* + *Scénario B : stack ActivePieces CE cloud + Edge‑Agent local*.
> **Chaîne complète** : **LangFlow** (design) → **ActivePieces** (event `flow.saved`) → **Compiler Service** → **Edge‑Agent** installé sur le PC client.

---

## 1. Vérification Git **par client** (pré‑flight)

*Étape précédente : voir [flows4B.md](flows4B.md) — export JSON depuis LangFlow puis import ActivePieces.*

---

## 2. Architecture de référence

```
┌─────────────────────────┐                               websocket (JWT)        ┌──────────────────────────┐
│  Stack CE (compose/<s>) │  flow.saved Webhook          ◄──────────────────────►│  Edge‑Launcher (svc)      │
│  • LangFlow (design)    │ ───────▶ ActivePieces UI                              │  • Updater                │
│  • ActivePieces UI      │                              │  • Tunneler (rathole) │
│  • Compiler Service     │                              │  • Runner (executor)  │
│  • Bucket edge-artifacts│                              └──────────────────────────┘
└─────────────────────────┘
```

---

## 3. Pré‑requis système

| Élément          | Valeur / Chemin                        |
| ---------------- | -------------------------------------- |
| PC client        | Windows 10 64 bits, .NET 4.8           |
| Stack CE         | `http://ui.<slug>.domain.tld` (cloud)  |
| Bucket artefacts | `https://bucket/edge_artifacts/<slug>` |
| Token JWT        | issu `/edge/auth` (validité 24 h)      |

---

## 4. Déploiement Edge‑Launcher

```yaml
- cmd: Invoke-WebRequest -Uri "https://bucket/edge_launcher_installer.exe" -OutFile edge_setup.exe
  path: C:\Users\%USERNAME%\Downloads
  venv: off
- cmd: .\edge_setup.exe /silent TOKEN=<jwt> STACK_PORT=31<idx>
  path: C:\Users\%USERNAME%\Downloads
  venv: off
```

> Le service **Edge‑Launcher** s’enregistre puis attend le manifeste ZIP signé.

---

## 5. Test de bout en bout

1. Dans Console Admin UI ActivePieces : cliquez **Build Edge**.
2. Vérifiez commit Git `bld/<slug>/<ts>/edge`.
3. Edge‑Launcher télécharge `edge_<ver>.zip`, vérifie SHA‑256, exécute RUNNER.
4. Phoenix reçoit span `agent.edge.exec`.

---

## 6. Observabilité

* Spans `agent.edge.*` : tags `agent_type=edge`, `stack_port`, `exe_version`.
* Log Windows Event ID 2200 success / 5200 error.

---

## 📝 Changelog

| Version  | Date       | Motif                                                                                                         |
| -------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| **v6.3** | 2025-05-10 | Ajout référence LangFlow → ActivePieces ; schéma architecture mis à jour ; lien pré‑flight vers flows4B.      |
| v6.2     | 2025-05-10 | Alignement dual‑target : tags OTEL edge, élargissement runtime, liaison bucket edge‑artifacts, service check. |
| v6.1     | 2025-05-09 | Simplification JWT auth, fix tunnel port.                                                                     |
| v6       | 2025-05-08 | Première version Edge‑Agent 6.                                                                                |
