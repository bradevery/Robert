# TODO — Robert.IA vs Cahier des Charges

## Légende

- 🔴 MVP (Phase 1) — Prioritaire
- 🟡 V1 (Phase 2) — Important
- 🟢 V2 (Phase 3) — Nice to have
- ✅ Fait | ⬜ À faire | 🔧 Partiel

---

## 🏗️ GLOBAL — Architecture & Pipeline

| #   | Tâche                                                                     | Prio | Statut |
| --- | ------------------------------------------------------------------------- | ---- | ------ |
| G1  | Pipeline Guidée 8 étapes (page dédiée `/pipeline`)                        | 🔴   | ✅     |
| G2  | Transmission JSON inter-étapes (fiche_mission → score → prequalif → etc.) | 🔴   | ✅     |
| G3  | Barre de progression étapes 1/8 visible en permanence                     | 🔴   | ✅     |
| G4  | Sauvegarde automatique à chaque étape pipeline                            | 🔴   | ✅     |
| G5  | Profil ESN persistant (logo, couleurs, pitch) — onglet Settings           | 🔴   | ✅     |
| G6  | Auto-injection profil ESN dans CV, Propale, Library                       | 🔴   | ⬜     |
| G7  | Export dual PDF + PPTX pour tous les livrables                            | 🔴   | ⬜     |
| G8  | Mode One-Shot accessible en 1 clic depuis dashboard                       | 🔴   | 🔧     |
| G9  | Notifications contextuelles inter-étapes                                  | 🟡   | ⬜     |
| G10 | Collaboration multi-utilisateurs (partage dossier AO)                     | 🟢   | ⬜     |

---

## 📄 Module 1 — AO Reader (`/modules/ao-reader`)

| #   | Tâche                                                             | Prio | Statut |
| --- | ----------------------------------------------------------------- | ---- | ------ |
| AO1 | ✅ Import multi-format (PDF, DOCX, texte)                         | 🔴   | ✅     |
| AO2 | ✅ Extraction fiche mission structurée (≥8 champs)                | 🔴   | ✅     |
| AO3 | Bouton "Matcher des Profils" → lien vers Score avec fiche_mission | 🔴   | ✅     |
| AO4 | Bouton "Créer un Dossier" → créer DossierAO en DB                 | 🔴   | ✅     |
| AO5 | Persister résultat analyse en DB (AOAnalysis)                     | 🔴   | ⬜     |
| AO6 | Export fiche mission PDF                                          | 🔴   | ⬜     |
| AO7 | Output JSON conforme schéma `fiche_mission` du cahier des charges | 🔴   | 🔧     |
| AO8 | Intégration email (réception AO auto)                             | 🟢   | ⬜     |

---

## 🎯 Module 2 — Score (`/modules/score`)

| #   | Tâche                                                          | Prio | Statut |
| --- | -------------------------------------------------------------- | ---- | ------ |
| SC1 | ✅ Scoring multicritère 4 dimensions (tech, fonc, fit, global) | 🔴   | ✅     |
| SC2 | ✅ Ranking multi-CV simultané                                  | 🔴   | ✅     |
| SC3 | Persister ScoreResult en DB                                    | 🔴   | ⬜     |
| SC4 | Recevoir fiche_mission depuis AO Reader (pipeline)             | 🔴   | ⬜     |
| SC5 | Bouton "Sélectionner profil" → passage étape 3 (pipeline)      | 🔴   | ⬜     |
| SC6 | Export rapport scoring PDF                                     | 🔴   | ⬜     |
| SC7 | Scoring depuis CVthèque interne                                | 🟡   | ⬜     |

---

## 📞 Module 3 — Pré-Qualif (`/modules/pre-qualif`)

| #   | Tâche                                                  | Prio | Statut |
| --- | ------------------------------------------------------ | ---- | ------ |
| PQ1 | ✅ Script d'appel structuré (≥5 questions)             | 🔴   | ✅     |
| PQ2 | ✅ Multi-langue (FR/EN/ES/PT)                          | 🔴   | ✅     |
| PQ3 | Recevoir profil_selectionne + fiche_mission (pipeline) | 🔴   | ⬜     |
| PQ4 | Grille d'évaluation remplissable par l'utilisateur     | 🟡   | ⬜     |
| PQ5 | Persister résultat préqualif en DB                     | 🟡   | ⬜     |
| PQ6 | Export questionnaire PDF                               | 🟡   | ⬜     |

---

## 🎨 Module 4 — Robert CV / CV Builder (`/cv-builder`)

| #   | Tâche                                                          | Prio | Statut |
| --- | -------------------------------------------------------------- | ---- | ------ |
| CV1 | ✅ Harmonisation CV avec templates                             | 🔴   | ✅     |
| CV2 | ✅ Export PDF                                                  | 🔴   | ✅     |
| CV3 | Export PPTX                                                    | 🔴   | ⬜     |
| CV4 | Auto-injection charte ESN (logo, couleurs) depuis profil       | 🔴   | ⬜     |
| CV5 | Abstract candidat IA (rewriting fidèle)                        | 🔴   | 🔧     |
| CV6 | Implémenter les stubs : handleTextReview, handleATSCheck       | 🔴   | ⬜     |
| CV7 | Implémenter handleCopyCV, handleAdaptForJob, handleTranslateCV | 🟡   | ⬜     |
| CV8 | Undo/Redo fonctionnel                                          | 🟡   | ⬜     |

---

## ✂️ Module 5 — CV Reviewer (`/modules/reviewer`)

| #   | Tâche                                                         | Prio | Statut |
| --- | ------------------------------------------------------------- | ---- | ------ |
| RV1 | ✅ Audit ATS (score, checklist, keywords)                     | 🔴   | ✅     |
| RV2 | ✅ Optimisation IA (rewrite section par section)              | 🔴   | ✅     |
| RV3 | Chaque modification liée à un critère AO (rapport explicatif) | 🔴   | 🔧     |
| RV4 | Export CV optimisé Word/PDF                                   | 🔴   | ⬜     |
| RV5 | Export CV optimisé PPTX                                       | 🔴   | ⬜     |
| RV6 | Persister ResumeImprovement en DB                             | 🟡   | ⬜     |

---

## 📊 Module 6 — Propale (`/modules/proposal`)

| #   | Tâche                               | Prio | Statut |
| --- | ----------------------------------- | ---- | ------ |
| PR1 | ✅ Génération propale (≥6 sections) | 🔴   | ✅     |
| PR2 | Export PPTX premium branded         | 🔴   | ⬜     |
| PR3 | Export PDF                          | 🔴   | ⬜     |
| PR4 | Intégration logos ESN + client      | 🔴   | ⬜     |
| PR5 | TJM / Planning inclus (formulaire)  | 🔴   | 🔧     |
| PR6 | Persister Propale en DB             | 🔴   | ⬜     |
| PR7 | Versioning des propales             | 🟡   | ⬜     |

---

## 🎤 Module 7 — Coaching (`/chat`)

| #   | Tâche                                                  | Prio | Statut |
| --- | ------------------------------------------------------ | ---- | ------ |
| CO1 | Briefing mission complet (page dédiée, pas juste chat) | 🟡   | ✅     |
| CO2 | Q&A probables (min. 10 questions/réponses)             | 🟡   | ✅     |
| CO3 | Fiche "2min pour convaincre"                           | 🟡   | ✅     |
| CO4 | Points forts / Risques à maîtriser                     | 🟡   | ✅     |
| CO5 | Export coaching kit PDF                                | 🟡   | ⬜     |
| CO6 | Mode Sketching (dialogue IA entraînement)              | 🟢   | ⬜     |

---

## 🗂️ Module 8 — Library (`/modules/library`)

| #   | Tâche                                               | Prio | Statut |
| --- | --------------------------------------------------- | ---- | ------ |
| LB1 | Remplacer données mock par backend DB (API + model) | 🟡   | ⬜     |
| LB2 | Archivage automatique fin de pipeline               | 🟡   | ⬜     |
| LB3 | Upload manuel de templates                          | 🟡   | ⬜     |
| LB4 | Recherche full-text + tags                          | 🟡   | ⬜     |
| LB5 | Suggestions contextuelles (templates similaires)    | 🟢   | ⬜     |

---

## 📈 Dashboard (`/dashboard`)

| #   | Tâche                                                      | Prio | Statut |
| --- | ---------------------------------------------------------- | ---- | ------ |
| DB1 | ✅ KPI cards + stats depuis API                            | 🔴   | ✅     |
| DB2 | Bouton "Démarrer Pipeline" → lien vers /pipeline           | 🔴   | ⬜     |
| DB3 | Implémenter upload CV dans modal "Créer à partir d'un CV"  | 🔴   | ⬜     |
| DB4 | Pipeline items cliquables (lien vers dossier)              | 🟡   | ⬜     |
| DB5 | Analytics : AO traités, propales envoyées, taux conversion | 🟢   | ⬜     |

---

## ⚙️ Settings (`/settings`)

| #   | Tâche                                                     | Prio | Statut |
| --- | --------------------------------------------------------- | ---- | ------ |
| ST1 | Onglet "Profil ESN" (nom, logo, couleurs, pitch, polices) | 🔴   | ⬜     |
| ST2 | Validation logo (PNG/SVG, ≥300px)                         | 🔴   | ⬜     |
| ST3 | Wirer changement mot de passe, 2FA, export données        | 🟡   | ⬜     |
| ST4 | Intégration Stripe (billing réel)                         | 🟢   | ⬜     |

---

## 🗄️ Base de Données (Prisma)

| #   | Tâche                                                                  | Prio | Statut |
| --- | ---------------------------------------------------------------------- | ---- | ------ |
| PB1 | Ajouter model `PipelineSession` (étape courante, données inter-étapes) | 🔴   | ⬜     |
| PB2 | Ajouter model `ESNProfile` (logo_url, couleurs, pitch, polices)        | 🔴   | ⬜     |
| PB3 | Ajouter model `CoachingKit` (briefing, qa[], fiche_2min)               | 🟡   | ⬜     |
| PB4 | Ajouter model `LibraryResource` (type, file_url, tags[], usage_count)  | 🟡   | ⬜     |
| PB5 | Activer pgvector pour embeddings CVthèque                              | 🟡   | ⬜     |

---

## Ordre d'implémentation recommandé (MVP first)

1. **ST1** — Profil ESN dans Settings (fondation pour tout le reste)
2. **PB1 + PB2** — Models Prisma (PipelineSession + ESNProfile)
3. **G1→G4** — Pipeline Guidée (page + progression + sauvegarde)
4. **AO3→AO6** — AO Reader : persistance + liens
5. **SC3→SC6** — Score : persistance + export
6. **CV3→CV6** — CV Builder : PPTX + ESN branding
7. **PR2→PR6** — Propale : exports + persistance
8. **RV4→RV5** — CV Reviewer : exports
9. **CO1→CO5** — Coaching : page dédiée soutenance
10. **LB1→LB4** — Library : backend réel
