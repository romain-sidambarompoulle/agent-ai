# ADR‑Exceptions — Journal des dérogations multi‑tenant

> **But :** conserver la trace, dans un fichier unique et chronologique, de chaque exception ou écart assumé par rapport aux « Contraintes invariantes ».
>
> * Pas de numérotation complexe ; on incrémente simplement la date et un slug.
> * Une entrée = une décision, avec cause, portée, plan de retrait.
>
> ```md
> ## 2025‑05‑08 — ignore‑tenant‑header‑dev
> **Contexte**  : Traefik middleware `X‑Tenant` désactivé en local.
> **Cause**     : simplifier les tests UI avant mise en place du vhost.
> **Décision**  : accepter l’absence d’en‑tête en dev **uniquement**.
> **Plan retrait** : réactiver middleware dès le sprint 4B.
> ```
>
> ⚠️ Toute équipe ajoutant une entrée **doit** la mentionner dans le commit message :
> `docs: add adr‑exception ignore‑tenant‑header‑dev`

---

*(Aucune exception enregistrée pour l’instant)*
