-- ============================================
-- Données de référence pour le marché français
-- ============================================

-- ============================================
-- DIPLÔMES ET FORMATIONS FRANÇAISES
-- ============================================

INSERT INTO french_diplomas (name, level, rncp, type, equivalents, european_level, domains) VALUES
-- Niveau Bac+8
('Doctorat', 'Bac+8', 8, 'Doctorat', ARRAY['PhD', 'Thèse'], 'Niveau 8', ARRAY['Tous domaines']),
('PhD', 'Bac+8', 8, 'Doctorat', ARRAY['Doctorat', 'Thèse'], 'Niveau 8', ARRAY['Tous domaines']),

-- Niveau Bac+5 - Masters
('Master', 'Bac+5', 7, 'Master', ARRAY['Master 2', 'DESS', 'DEA', 'Mastère'], 'Niveau 7', ARRAY['Tous domaines']),
('Master 2', 'Bac+5', 7, 'Master', ARRAY['Master', 'DESS', 'DEA'], 'Niveau 7', ARRAY['Tous domaines']),
('DESS', 'Bac+5', 7, 'Master', ARRAY['Master', 'Master 2', 'Master Pro'], 'Niveau 7', ARRAY['Tous domaines']),
('DEA', 'Bac+5', 7, 'Master', ARRAY['Master', 'Master 2', 'Master Recherche'], 'Niveau 7', ARRAY['Recherche']),
('Mastère Spécialisé', 'Bac+6', 7, 'Mastère', ARRAY['MS', 'Master of Science'], 'Niveau 7', ARRAY['Spécialisation']),
('MBA', 'Bac+5', 7, 'MBA', ARRAY['Master of Business Administration'], 'Niveau 7', ARRAY['Management', 'Business']),

-- Niveau Bac+5 - Écoles d'ingénieurs
('Diplôme d''ingénieur', 'Bac+5', 7, 'Ingénieur', ARRAY['Ingénieur diplômé', 'Master'], 'Niveau 7', ARRAY['Ingénierie']),
('Ingénieur INSA', 'Bac+5', 7, 'Ingénieur', ARRAY['Diplôme d''ingénieur'], 'Niveau 7', ARRAY['Ingénierie']),
('Ingénieur Centrale', 'Bac+5', 7, 'Ingénieur', ARRAY['Diplôme d''ingénieur'], 'Niveau 7', ARRAY['Ingénierie']),
('Ingénieur Mines', 'Bac+5', 7, 'Ingénieur', ARRAY['Diplôme d''ingénieur'], 'Niveau 7', ARRAY['Ingénierie']),
('Ingénieur Polytechnique', 'Bac+5', 7, 'Ingénieur', ARRAY['X', 'Diplôme d''ingénieur'], 'Niveau 7', ARRAY['Ingénierie']),

-- Niveau Bac+5 - Écoles de commerce
('Diplôme ESC', 'Bac+5', 7, 'Commerce', ARRAY['Master', 'Grande École'], 'Niveau 7', ARRAY['Commerce', 'Management']),
('HEC', 'Bac+5', 7, 'Commerce', ARRAY['Master', 'Grande École'], 'Niveau 7', ARRAY['Commerce', 'Management']),
('ESSEC', 'Bac+5', 7, 'Commerce', ARRAY['Master', 'Grande École'], 'Niveau 7', ARRAY['Commerce', 'Management']),
('ESCP', 'Bac+5', 7, 'Commerce', ARRAY['Master', 'Grande École'], 'Niveau 7', ARRAY['Commerce', 'Management']),
('EM Lyon', 'Bac+5', 7, 'Commerce', ARRAY['Master', 'Grande École'], 'Niveau 7', ARRAY['Commerce', 'Management']),

-- Niveau Bac+3/4
('Licence', 'Bac+3', 6, 'Licence', ARRAY['L3', 'Bachelor'], 'Niveau 6', ARRAY['Tous domaines']),
('Licence Pro', 'Bac+3', 6, 'Licence Pro', ARRAY['LP', 'Bachelor'], 'Niveau 6', ARRAY['Tous domaines']),
('Bachelor', 'Bac+3', 6, 'Bachelor', ARRAY['Licence'], 'Niveau 6', ARRAY['Tous domaines']),
('BUT', 'Bac+3', 6, 'BUT', ARRAY['Bachelor Universitaire de Technologie', 'ex-DUT'], 'Niveau 6', ARRAY['Technologie']),
('DCG', 'Bac+3', 6, 'DCG', ARRAY['Diplôme de Comptabilité et de Gestion'], 'Niveau 6', ARRAY['Comptabilité', 'Gestion']),
('Master 1', 'Bac+4', 6, 'Master 1', ARRAY['M1', 'Maîtrise'], 'Niveau 6', ARRAY['Tous domaines']),

-- Niveau Bac+2
('BTS', 'Bac+2', 5, 'BTS', ARRAY['Brevet de Technicien Supérieur'], 'Niveau 5', ARRAY['Tous domaines']),
('DUT', 'Bac+2', 5, 'DUT', ARRAY['Diplôme Universitaire de Technologie'], 'Niveau 5', ARRAY['Technologie']),
('DEUST', 'Bac+2', 5, 'DEUST', ARRAY['Diplôme d''Études Universitaires'], 'Niveau 5', ARRAY['Tous domaines']),
('BTS SIO', 'Bac+2', 5, 'BTS', ARRAY['Services Informatiques aux Organisations'], 'Niveau 5', ARRAY['Informatique']),
('BTS NDRC', 'Bac+2', 5, 'BTS', ARRAY['Négociation et Digitalisation de la Relation Client', 'BTS NRC'], 'Niveau 5', ARRAY['Commerce']),
('DUT Informatique', 'Bac+2', 5, 'DUT', ARRAY['DUT Info'], 'Niveau 5', ARRAY['Informatique']),
('DUT GEA', 'Bac+2', 5, 'DUT', ARRAY['Gestion des Entreprises et des Administrations'], 'Niveau 5', ARRAY['Gestion']),

-- Niveau Bac
('Baccalauréat', 'Bac', 4, 'Bac', ARRAY['Bac'], 'Niveau 4', ARRAY['Général']),
('Bac Général', 'Bac', 4, 'Bac', ARRAY['Bac S', 'Bac ES', 'Bac L'], 'Niveau 4', ARRAY['Général']),
('Bac Technologique', 'Bac', 4, 'Bac', ARRAY['Bac STI2D', 'Bac STMG', 'Bac ST2S'], 'Niveau 4', ARRAY['Technologique']),
('Bac Professionnel', 'Bac', 4, 'Bac Pro', ARRAY['Bac Pro'], 'Niveau 4', ARRAY['Professionnel'])

ON CONFLICT (name) DO NOTHING;

-- ============================================
-- COMPÉTENCES ET ONTOLOGIE
-- ============================================

INSERT INTO french_skill_ontology (skill_name, category, synonyms, related_skills, parent_skill, sectors, job_titles) VALUES
-- Langages de programmation
('JavaScript', 'technique', ARRAY['JS', 'ECMAScript', 'ES6', 'ES2015'], ARRAY['TypeScript', 'Node.js', 'React', 'Vue.js', 'Angular'], 'Développement Web', ARRAY['Tech', 'Digital'], ARRAY['Développeur Full-Stack', 'Développeur Front-End']),
('Python', 'technique', ARRAY['Python3', 'Python 3'], ARRAY['Django', 'Flask', 'NumPy', 'Pandas'], 'Programmation', ARRAY['Tech', 'Data', 'IA'], ARRAY['Data Scientist', 'Développeur Python']),
('Java', 'technique', ARRAY['Java EE', 'J2EE', 'Java SE'], ARRAY['Spring', 'Hibernate', 'Maven'], 'Programmation', ARRAY['Tech', 'Finance'], ARRAY['Développeur Java', 'Ingénieur Logiciel']),
('React', 'technique', ARRAY['React.js', 'ReactJS'], ARRAY['Redux', 'Next.js', 'React Native'], 'JavaScript', ARRAY['Tech', 'Digital'], ARRAY['Développeur React', 'Développeur Front-End']),

-- Frameworks et outils
('Spring', 'technique', ARRAY['Spring Boot', 'Spring Framework'], ARRAY['Spring Security', 'Spring Data'], 'Java', ARRAY['Tech', 'Finance'], ARRAY['Développeur Java', 'Architecte']),
('Docker', 'outil', ARRAY['Docker Engine', 'Conteneurisation'], ARRAY['Kubernetes', 'Docker Compose'], 'DevOps', ARRAY['Tech', 'Cloud'], ARRAY['DevOps Engineer', 'SRE']),
('Git', 'outil', ARRAY['GitHub', 'GitLab', 'Bitbucket'], ARRAY['Git Flow', 'Version Control'], 'Développement', ARRAY['Tech'], ARRAY['Tous développeurs']),

-- Soft Skills français
('Travail en équipe', 'comportementale', ARRAY['Esprit d''équipe', 'Collaboration', 'Teamwork'], ARRAY['Communication', 'Leadership'], NULL, ARRAY['Tous'], ARRAY['Tous']),
('Autonomie', 'comportementale', ARRAY['Autonome', 'Indépendant', 'Self-starter'], ARRAY['Initiative', 'Organisation'], NULL, ARRAY['Tous'], ARRAY['Tous']),
('Rigueur', 'comportementale', ARRAY['Rigoureux', 'Méthodique', 'Précis'], ARRAY['Organisation', 'Qualité'], NULL, ARRAY['Tous'], ARRAY['Tous']),
('Adaptabilité', 'comportementale', ARRAY['Flexible', 'Adaptation', 'Polyvalent'], ARRAY['Agilité', 'Réactivité'], NULL, ARRAY['Tous'], ARRAY['Tous']),
('Communication', 'comportementale', ARRAY['Communiquant', 'Relationnel', 'Expression'], ARRAY['Écoute', 'Pédagogie'], NULL, ARRAY['Tous'], ARRAY['Tous']),

-- Méthodologies
('Agile', 'technique', ARRAY['Agilité', 'Méthode Agile', 'Agile/Scrum'], ARRAY['Scrum', 'Kanban', 'SAFe'], 'Gestion de projet', ARRAY['Tech', 'Digital'], ARRAY['Scrum Master', 'Product Owner']),
('Scrum', 'technique', ARRAY['Méthode Scrum', 'Framework Scrum'], ARRAY['Agile', 'Sprint', 'Daily'], 'Agile', ARRAY['Tech', 'Digital'], ARRAY['Scrum Master', 'Développeur']),

-- Outils spécifiques France
('Sage', 'outil', ARRAY['Sage 100', 'Sage X3'], ARRAY['ERP', 'Comptabilité'], 'Logiciels de gestion', ARRAY['Finance', 'Comptabilité'], ARRAY['Comptable', 'Contrôleur de gestion']),
('Cegid', 'outil', ARRAY['Cegid Expert'], ARRAY['ERP', 'Paie'], 'Logiciels de gestion', ARRAY['RH', 'Comptabilité'], ARRAY['Gestionnaire de paie', 'Comptable'])

ON CONFLICT (skill_name) DO NOTHING;

-- ============================================
-- ENTREPRISES FRANÇAISES TYPES
-- ============================================

INSERT INTO french_companies (name, siret, size, sector, convention, culture_keywords, values) VALUES
-- CAC 40
('TotalEnergies', '54205118000066', 'grand_groupe', '06', 'Pétrole', ARRAY['International', 'Énergie', 'Transition'], ARRAY['Innovation', 'Sécurité', 'Environnement']),
('BNP Paribas', '66204244900014', 'grand_groupe', '64', 'Banque', ARRAY['Finance', 'International', 'Corporate'], ARRAY['Responsabilité', 'Expertise', 'Engagement']),
('L''Oréal', '63201241700013', 'grand_groupe', '20', 'Chimie', ARRAY['Luxe', 'International', 'Innovation'], ARRAY['Beauté', 'Diversité', 'Excellence']),
('Capgemini', '77569250700239', 'grand_groupe', '62', 'Syntec', ARRAY['Consulting', 'Tech', 'International'], ARRAY['Innovation', 'Collaboration', 'Excellence']),

-- Startups françaises
('Doctolib', '79426172800045', 'startup', '62', 'Syntec', ARRAY['HealthTech', 'Scale-up', 'Digital'], ARRAY['Impact', 'Excellence', 'Care']),
('Qonto', '81934306100034', 'startup', '64', 'Banque', ARRAY['FinTech', 'Scale-up', 'Néobanque'], ARRAY['Simplicité', 'Transparence', 'Ambition']),
('Ledger', '52973564600074', 'startup', '26', 'Métallurgie', ARRAY['Crypto', 'Hardware', 'Security'], ARRAY['Sécurité', 'Innovation', 'Pionnier']),

-- PME
('ESN Régionale', NULL, 'pme', '62', 'Syntec', ARRAY['Services', 'Local', 'B2B'], ARRAY['Proximité', 'Réactivité', 'Expertise']),

-- Service Public
('Pôle Emploi', '13000548100010', 'public', '84', 'Public', ARRAY['Service Public', 'Emploi', 'Insertion'], ARRAY['Service', 'Égalité', 'Accompagnement']),
('URSSAF', '13000843300019', 'public', '84', 'Public', ARRAY['Service Public', 'Social', 'Protection'], ARRAY['Service', 'Protection', 'Solidarité'])

ON CONFLICT DO NOTHING;

-- ============================================
-- SYNONYMES FRANÇAIS
-- ============================================

INSERT INTO french_synonyms_data (word, synonyms) VALUES
-- Synonymes métiers
('développeur', ARRAY['dev', 'developer', 'programmeur', 'ingénieur développement']),
('ingénieur', ARRAY['engineer', 'ing', 'ingé']),
('commercial', ARRAY['sales', 'vendeur', 'business developer', 'bizdev']),
('chef de projet', ARRAY['project manager', 'PM', 'CP', 'coordinateur projet']),
('responsable', ARRAY['manager', 'head of', 'leader', 'chef']),

-- Synonymes compétences
('gestion', ARRAY['management', 'pilotage', 'coordination', 'administration']),
('analyse', ARRAY['étude', 'diagnostic', 'évaluation', 'assessment']),
('conception', ARRAY['design', 'création', 'élaboration', 'développement']),
('formation', ARRAY['training', 'enseignement', 'apprentissage', 'éducation']),

-- Synonymes secteurs
('informatique', ARRAY['IT', 'numérique', 'digital', 'tech']),
('finance', ARRAY['banque', 'assurance', 'financial services']),
('industrie', ARRAY['manufacturing', 'production', 'usine'])

ON CONFLICT DO NOTHING;

-- ============================================
-- CONVENTIONS COLLECTIVES
-- ============================================

CREATE TABLE IF NOT EXISTS french_conventions (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    code TEXT,
    sectors TEXT[],
    typical_benefits TEXT[]
);

INSERT INTO french_conventions (name, code, sectors, typical_benefits) VALUES
('Syntec', '3018', ARRAY['Informatique', 'Ingénierie', 'Conseil'], ARRAY['RTT', 'Mutuelle famille', 'Tickets restaurant', 'Prime vacances']),
('Métallurgie', '3109', ARRAY['Industrie', 'Automobile', 'Aéronautique'], ARRAY['13ème mois', 'Prime ancienneté', 'Mutuelle', 'CE']),
('Banque', '2120', ARRAY['Banque', 'Finance'], ARRAY['13ème mois', '14ème mois', 'Intéressement', 'Participation']),
('Commerce', '3305', ARRAY['Retail', 'Distribution'], ARRAY['Prime sur objectifs', 'Mutuelle', 'Tickets restaurant']),
('Publicité', '3073', ARRAY['Communication', 'Marketing', 'Publicité'], ARRAY['RTT', 'Tickets restaurant', 'Mutuelle'])

ON CONFLICT DO NOTHING;

-- ============================================
-- NIVEAUX DE LANGUE CECRL
-- ============================================

CREATE TABLE IF NOT EXISTS language_levels (
    id SERIAL PRIMARY KEY,
    cecrl_code TEXT UNIQUE NOT NULL,
    description_fr TEXT,
    equivalents TEXT[]
);

INSERT INTO language_levels (cecrl_code, description_fr, equivalents) VALUES
('A1', 'Débutant - Découverte', ARRAY['Beginner', 'Notions', 'Élémentaire']),
('A2', 'Élémentaire - Survie', ARRAY['Elementary', 'Faux débutant', 'Basique']),
('B1', 'Intermédiaire - Seuil', ARRAY['Intermediate', 'Pré-intermédiaire', 'Moyen']),
('B2', 'Intermédiaire avancé - Indépendant', ARRAY['Upper-Intermediate', 'Avancé', 'Bon niveau']),
('C1', 'Avancé - Autonome', ARRAY['Advanced', 'Très bon niveau', 'Confirmé']),
('C2', 'Maîtrise - Maîtrise', ARRAY['Proficiency', 'Bilingue', 'Natif'])

ON CONFLICT DO NOTHING;

-- ============================================
-- VILLES ET RÉGIONS FRANÇAISES
-- ============================================

CREATE TABLE IF NOT EXISTS french_locations (
    id SERIAL PRIMARY KEY,
    city TEXT,
    department TEXT,
    region TEXT,
    is_major_city BOOLEAN DEFAULT FALSE
);

INSERT INTO french_locations (city, department, region, is_major_city) VALUES
-- Grandes métropoles
('Paris', '75', 'Île-de-France', TRUE),
('Lyon', '69', 'Auvergne-Rhône-Alpes', TRUE),
('Marseille', '13', 'Provence-Alpes-Côte d''Azur', TRUE),
('Toulouse', '31', 'Occitanie', TRUE),
('Nice', '06', 'Provence-Alpes-Côte d''Azur', TRUE),
('Nantes', '44', 'Pays de la Loire', TRUE),
('Strasbourg', '67', 'Grand Est', TRUE),
('Montpellier', '34', 'Occitanie', TRUE),
('Bordeaux', '33', 'Nouvelle-Aquitaine', TRUE),
('Lille', '59', 'Hauts-de-France', TRUE),
('Rennes', '35', 'Bretagne', TRUE),
('Reims', '51', 'Grand Est', FALSE),
('Le Havre', '76', 'Normandie', FALSE),
('Saint-Étienne', '42', 'Auvergne-Rhône-Alpes', FALSE),
('Toulon', '83', 'Provence-Alpes-Côte d''Azur', FALSE),
('Grenoble', '38', 'Auvergne-Rhône-Alpes', TRUE),
('Dijon', '21', 'Bourgogne-Franche-Comté', FALSE),
('Angers', '49', 'Pays de la Loire', FALSE),
('Nîmes', '30', 'Occitanie', FALSE),
('Aix-en-Provence', '13', 'Provence-Alpes-Côte d''Azur', FALSE)

ON CONFLICT DO NOTHING;

-- ============================================
-- CERTIFICATIONS RECONNUES EN FRANCE
-- ============================================

CREATE TABLE IF NOT EXISTS french_certifications (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    issuer TEXT,
    validity_years INTEGER,
    sectors TEXT[]
);

INSERT INTO french_certifications (name, category, issuer, validity_years, sectors) VALUES
-- Langues
('TOEIC', 'langue', 'ETS', 2, ARRAY['Tous']),
('TOEFL', 'langue', 'ETS', 2, ARRAY['Académique', 'Recherche']),
('BULATS', 'langue', 'Cambridge', 2, ARRAY['Business']),
('Certificat Voltaire', 'langue', 'Projet Voltaire', NULL, ARRAY['Tous']),
('DELF/DALF', 'langue', 'CIEP', NULL, ARRAY['FLE']),

-- IT
('AWS Certified Solutions Architect', 'technique', 'Amazon', 3, ARRAY['Cloud', 'Tech']),
('Microsoft Azure', 'technique', 'Microsoft', 2, ARRAY['Cloud', 'Tech']),
('Google Cloud Professional', 'technique', 'Google', 2, ARRAY['Cloud', 'Tech']),
('Cisco CCNA', 'technique', 'Cisco', 3, ARRAY['Réseau', 'Tech']),
('PMP', 'gestion', 'PMI', 3, ARRAY['Projet', 'Management']),
('Scrum Master', 'gestion', 'Scrum Alliance', 2, ARRAY['Agile', 'Tech']),
('ITIL', 'gestion', 'Axelos', NULL, ARRAY['IT Service Management']),

-- Finance/Compta
('DCG', 'diplôme', 'Éducation Nationale', NULL, ARRAY['Comptabilité']),
('DSCG', 'diplôme', 'Éducation Nationale', NULL, ARRAY['Comptabilité', 'Audit']),
('DEC', 'diplôme', 'Ordre des Experts-Comptables', NULL, ARRAY['Expertise Comptable']),
('CFA', 'certification', 'CFA Institute', NULL, ARRAY['Finance', 'Analyse Financière']),

-- Autres
('Permis B', 'permis', 'Préfecture', NULL, ARRAY['Tous']),
('CACES', 'permis', 'Organisme certifié', 5, ARRAY['Logistique', 'BTP']),
('Habilitation électrique', 'sécurité', 'Organisme agréé', 3, ARRAY['Électricité', 'Industrie'])

ON CONFLICT DO NOTHING;

-- ============================================
-- MESSAGES DE SUCCÈS
-- ============================================

DO $$
DECLARE
    diploma_count INTEGER;
    skill_count INTEGER;
    company_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO diploma_count FROM french_diplomas;
    SELECT COUNT(*) INTO skill_count FROM french_skill_ontology;
    SELECT COUNT(*) INTO company_count FROM french_companies;
    
    RAISE NOTICE 'Données françaises chargées avec succès !';
    RAISE NOTICE '% diplômes français référencés', diploma_count;
    RAISE NOTICE '% compétences dans l''ontologie', skill_count;
    RAISE NOTICE '% entreprises types', company_count;
    RAISE NOTICE 'Base de données prête pour le marché français !';
END $$;
