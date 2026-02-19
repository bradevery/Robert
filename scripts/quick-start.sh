#!/bin/bash

# Script de démarrage rapide pour AUTHENTIC-MATCH
# Pour tester le système sans configuration complète

set -e

echo "🚀 Démarrage rapide AUTHENTIC-MATCH"
echo "==================================="

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Vérifier si .env existe
if [ ! -f .env ]; then
    print_warning "Fichier .env non trouvé"
    print_status "Création d'un fichier .env de base..."
    
    cat > .env << EOF
# Configuration de base pour AUTHENTIC-MATCH
# Remplacez les valeurs par vos vraies clés API

# Base de données (optionnel pour le test)
# DATABASE_URL="postgresql://..."

# Mistral AI (requis pour l'IA)
# MISTRAL_API_KEY="sk-..."

# Cache Redis (optionnel)
# UPSTASH_REDIS_REST_URL="https://..."
# UPSTASH_REDIS_REST_TOKEN="..."

# Mode développement
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key
EOF
    
    print_success "Fichier .env créé"
    print_warning "Configurez vos clés API dans .env avant de continuer"
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    print_status "Installation des dépendances..."
    pnpm install
    print_success "Dépendances installées"
fi

# Vérifier les variables d'environnement critiques
if [ -z "$MISTRAL_API_KEY" ]; then
    print_warning "MISTRAL_API_KEY non configurée"
    print_status "Le système fonctionnera en mode démo sans IA"
    print_status "Pour une expérience complète, configurez MISTRAL_API_KEY dans .env"
fi

# Démarrer le serveur de développement
print_status "Démarrage du serveur de développement..."
print_status "Interface disponible sur: http://localhost:3000/authentic-match"
print_status "API disponible sur: http://localhost:3000/api/authentic-match"
echo ""

# Démarrer Next.js
pnpm run dev

