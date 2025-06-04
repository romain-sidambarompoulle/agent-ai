# ADR‑Exceptions — Journal des dérogations aux contraintes invariantes

> **Version v1.1 – 10 mai 2025**
> Aligné sur *Boussole d’état – 10 mai 2025* (pivot « LangFlow → React‑Flow Builder »)
> 🔗 Référence centrale : `docs/boussole_2025-05-10.md`

---

> **But :** conserver la trace, dans un fichier unique et chronologique, de chaque exception ou écart assumé par rapport aux « Contraintes invariantes » du projet (modèle **une stack ActivePieces CE par client**).
>
> * Pas de numérotation complexe ; on incrémente simplement la date et un *slug*.
> * Une entrée = une décision, avec cause, portée, plan de retrait.

```md
## 2025‑05‑08 — [OBSOLETE – pivot B] ignore‑tenant‑header‑dev
**Contexte**   : Traefik middleware `X‑Tenant` désactivé en local.
**Cause**      : simplifier les tests UI avant mise en place du vhost.
**Décision**   : accepter l’absence d’en‑tête en dev **uniquement**.
**Plan retrait** : réactiver middleware dès le sprint 4B.
**Clôture**    : 2025‑05‑10 – Scénario B abandonne le middleware X‑Tenant ; exception résolue.
```

⚠️ Toute équipe ajoutant une entrée **doit** la mentionner dans le commit message :
`docs: add adr‑exception <slug>`

---

*(Aucune exception ouverte à ce jour – journal remis à zéro le 10 mai 2025 lors du pivot Scénario B.)*
