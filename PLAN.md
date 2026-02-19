# Plan pour rendre l'app "Dossiers de competences" production-ready

Ce plan cible principalement le **dashboard** (back-office) et la qualite globale du produit. Il est base sur le code et les ecrans existants (dashboard + modules IA).

---

## 1) Vision, positionnement, et objectifs

**Vision**  
Plateforme SaaS pour ESN/SSII et cabinets de recrutement permettant de generer, personnaliser, collaborer et livrer des dossiers de competences en quelques minutes, avec un matching explicable et de qualite.

**Objectifs business (12 mois)**

- Taux d'adoption: 70% des dossiers produits via l'outil
- Temps moyen de creation d'un DC: < 10 minutes
- NPS >= 45
- Reduire le taux de retours clients sur la forme a < 5%

**Objectifs produit**

- Dashboard clair, oriente flux de travail
- IA fiable, explicable, et parametrable
- Templates Word/Docx preservant 100% des styles
- RGPD (France) + securite entreprise

---

## 2) Personas et flux principaux

**Personas**

- Responsable recrutement (manager): pilotage, KPIs, validation finale
- Charge de recrutement: creation et enrichissement dossiers, envoi client
- Consultant/Operateur: import CV, extraction, correction rapide
- Candidat invite: complique son dossier, 3 minutes max

**Flux principaux**

1. Import CV -> Extraction -> Dossier -> Edition -> Export/Envoi client
2. Creation dossier via template + adaptation au job offer
3. Matching candidat/offre + justification -> decision
4. Collaboration (commentaires, mentions, validations)

---

## 3) Redesign du dashboard (priorite)

### 3.1 IA des taches (Quick Actions)

- "Nouveau DC" (CV, template, job offer)
- "Importer une AO"
- "Inviter un candidat"
- "Dupliquer un template"

### 3.2 Blocs principaux

- **KPI cards**: DCs ce mois, temps moyen, taux de completion, candidats invites, DCs envoyes
- **Pipeline** (kanban mini): Brouillon -> En cours -> Termine -> Envoye
- **Alertes**: DCs en attente candidat, invitations expirant, dossiers a relire
- **Activite recente**: 5 derniers dossiers, 5 derniers candidats
- **Templates les plus utilises**

### 3.3 Layout propose

- Colonne gauche: KPIs + actions rapides
- Colonne droite: pipeline + alertes
- Bas de page: activite recente + templates

### 3.4 Style/UX

- Typo plus elegante (ex: "Manrope" + "Source Serif 4" pour titres)
- Palette "pro" (bleu profond + accents verts pour succes)
- Espacement 16/24/32, cartes a coins 16px, ombres tres legeres
- Contraste AA minimum

---

## 4) Architecture applicative

### 4.1 Separation des domaines

- **Core**: dossiers, candidats, clients, templates, exports
- **AI**: extraction, matching, scoring, summarization, rewrite
- **Collab**: commentaires, mentions, revisions
- **Admin**: billing, roles, audit

### 4.2 Services proposes

- API Next.js (REST) + background jobs (queue)
- Workers (Node) pour:
  - parsing PDF/DOCX
  - generation DOCX/PDF
  - embeddings + matching
  - traduction multilingue

### 4.3 Stockage fichiers

- Fichiers bruts: S3/MinIO (France)
- Versioning: associer chaque export a une version de template + dataset
- Chiffrement server-side et liens pre-signes

---

## 5) Database / Prisma (schema cible)

### 5.1 Multi-tenant

Ajouter:

- Organization, OrganizationMember (role: owner, admin, editor, viewer)
- RBAC par ressources (dossier, template, client)

### 5.2 Dossiers & templates

Modeles a creer/renforcer:

- Dossier (id, orgId, clientId, templateId, status, version, score, lastExportAt)
- DossierSection (order, type, data, aiMetadata)
- Template (orgId, baseTemplateId, name, version, docxFileId)
- TemplateVersion (diff/metadata)

### 5.3 Collaboration & audit

- Comment, Mention, ChangeLog, AuditLog
- ActivityLog (qui a modifie quoi, quand)

### 5.4 Matching et scoring

- JobOffer (source: LinkedIn, ATS, import)
- MatchingRun (scores, criteria)
- MatchingEvidence (justification, source sentences, passages)

### 5.5 RGPD & securite

- DataRetentionPolicy
- DataProcessingAgreement
- Consent (candidat)

---

## 6) Systeme IA (prompts + scoring)

### 6.1 Extraction CV (PDF/DOCX)

**Objectif**: JSON structure normalisee + evidence par section

- Schema strict (Zod) + validation
- Extraction par sections (experience, skills, education, languages)
- Output inclut:
  - resume_text_clean
  - experiences[] (role, client, stack, dates, impact)
  - skills (hard, soft, tools)
  - certifications
  - language levels (CEFR)
  - availability & salary if found

### 6.2 Extraction job offer (AO/ATS)

- Schema: hard requirements / nice-to-have / context / mission / stack
- Extraction des mots-clés + importance (poids 1-5)

### 6.3 Matching & scoring

Score composite:

- Fit technique (0-50)
- Fit mission (0-25)
- Seniorite/experience (0-15)
- Soft skills (0-5)
- Fit cultural / domain (0-5)
  **Sorties**:
- Score global /100
- Justifications (evidence citations)
- Gaps & risks
- Questions a poser

### 6.4 Guardrails

- Cite source text pour chaque claim
- "Unknown" si manque d'evidence
- Interdiction hallucination (schema validation)
- Journaliser prompts & versions

### 6.5 Evaluation et qualite

- Jeux de tests internes (CV + AO)
- Bench: precision extraction, recall skills, accuracy matching
- Monitoring drift + feedback utilisateur

---

## 7) UX / UI (dashboard)

### 7.1 Navigation

Simplifier sidebar:

- Tableau de bord
- Dossiers
- Candidats
- Templates
- Matching
- Integrations
- Parametres
  Modules IA regroupes dans "IA Studio"

### 7.2 Patterns d'interaction

- Skeletons pour loading
- Empty states guides (CTA + aide)
- Bulk actions sur dossiers
- Quick filters (status, client, date)

### 7.3 Accessibilite

- Focus visible
- Shortcuts clavier
- Contraste AA

---

## 8) Security & RGPD

- Auth: SSO (SAML/OAuth), MFA option
- RBAC multi-tenant, scopes par ressource
- Encryption at rest + in transit
- Data residency France
- Logs d'acces et audit
- Consentement candidat explicite
- DPIA (Data Protection Impact Assessment)

---

## 9) Observabilite & resiliency

- Monitoring (latence extraction, errors parsing)
- Alerting (queue backlog)
- Retries + dead-letter queue
- Sentry + structured logs

---

## 10) Roadmap de delivery (phases)

### Phase 1: Foundations (2-4 semaines)

- Schema DB multi-tenant + RBAC
- Refactor dashboard layout + sidebar
- Standardisation data models (dossiers, templates)

### Phase 2: IA + Matching (4-6 semaines)

- Pipeline extraction CV/AO
- Scoring explicable + evidence
- Jobs queue + batch processing

### Phase 3: Production ready (4-6 semaines)

- Export DOCX/PDF stable
- Audit + RGPD + logs
- Integrations ATS/CRM basiques

### Phase 4: Scale & polish

- Multi-language
- Templates avancés
- Analytics & A/B tests

---

## 11) Work packages (dashboard en detail)

1. Refonte layout `src/app/(app)/dashboard/page.tsx`
2. Nouveau composant KPIs + pipeline
3. Nouveau "Quick Actions" component
4. Stats API enrichies `src/app/api/dashboard/stats/route.ts`
5. Sidebar regroupement des modules
6. UI kit (typography, cards, tags, empty states)

---

## 12) Next steps concrets (shortlist)

- Valider la nouvelle structure de dashboard (wireframe)
- Definir schema JSON extraction CV/AO
- Ajouter Organization + RBAC
- Mettre en place queue jobs (BullMQ/Temporal)
