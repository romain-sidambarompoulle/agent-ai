## Texte d’ouverture – « Preambule de Vision »
*(à coller au début de chaque nouveau chat pour aligner humains & IA)*

---

### 1. Vision 360 °

1. **Empiler du 100 % open-source** : LangChain / CrewAI / LangGraph, observabilité Phoenix, gateway LiteLLM, vecteurs Chroma, vault Secret MCP, etc.  
2. **Cloud d’abord, Docker local ensuite** : même stack portable ; on débranche le convoyeur du cloud pour le poser sur le poste client.  
3. **Isolation multi-tenant stricte** : chaque client vit dans son workspace ActivePieces, sa branche Git `tenant/<slug>`, et son coffre secrets dédié.  
4. **Compiler Service auto-codegen** : à chaque sauvegarde d’un flow, Jinja² génère le runner Python dans la branche du locataire.  
5. **Tests & évolutions**  
   - **Workflows** : toute expérimentation passe dans une *branche locataire simulée* `tenant/<slug-test>`, jamais sur `main`.  
   - **Composants communs** (logo, nouveaux agents, scripts partagés…) : développement dans une branche `feature/common-<topic>` puis *Pull Request* → `main`.  
6. **Pédagogie GPS** : commandes YAML + explication, puis on attend le « OK » avant l’étape suivante.  

*Métaphore globale : nous construisons un immeuble LEGO. `main` est la charpente ; chaque locataire dispose d’un appartement séparé que l’on meuble à la demande.*

---

### 2. Règles d’or (toujours vraies)

| # | Règle | Image mentale |
|---|-------|---------------|
| 1 | **On-boarding locataire** = badge + cage d’ascenseur **avant** tout flow. | On remet les clés dès que la valise franchit l’entrée. |
| 2 | **Jamais de code spécifique dans `main`** ; uniquement l’ossature **et les composants communs validés**. | On n’entrepose pas de canapé privé dans le hall. |
| 3 | **Webhook `flow.saved`** pousse du code **dans la branche locataire** et exécute les tests. | Le traceur de plans dépose les plans dans l’appartement, pas ailleurs. |
| 4 | **Idempotence & rollback** partout : relancer un même on-boarding ne casse rien ; tout échec annule les ressources créées. | Un bouton « annuler » géant sur chaque machine. |
| 5 | **Pas de sur-anticipation** : on donne une seule commande indispensable, puis on attend la confirmation. | GPS : « Tournez à gauche, j’attends. » |

---

### 3. Checklist rapide avant toute tâche

- [ ] Le **slug** du locataire est-il clairement identifié ?  
- [ ] Travaillons-nous bien dans la branche `tenant/<slug>` (ou `feature/common-<topic>` si besoin) ?  
- [ ] Les secrets sont-ils rangés dans `tenant/<slug>` du vault MCP ?  
- [ ] Les tests passent-ils localement **avant** le push ?  
- [ ] Avons-nous expliqué la prochaine commande en YAML + chemin + venv on/off ?  

---

### 4. Références-clés

- `docs/00_OVERVIEW_INSTRUCTIONS.md` – cage d’ascenseur (signup ➜ workspace ➜ Git ➜ secrets)  
- `UI.md` – détails front & redirections  
- `Gitstrategymultitenant.md` – règles de branches et nettoyage  
- `activepieces_4A.md` – middleware `X-Tenant` & isolation HTTP  
- `Compiler Service 4C` – pipeline de génération et tests  

---

**À retenir** : *Toute nouvelle action commence par vérifier le locataire, la branche et le coffre-fort. Le reste n’est qu’assemblage de briques LEGO.*  