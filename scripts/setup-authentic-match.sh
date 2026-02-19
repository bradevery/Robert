#!/bin/bash

# Script de configuration pour AUTHENTIC-MATCH
# Système de matching authentique pour le marché français

set -e

echo "🇫🇷 Configuration d'AUTHENTIC-MATCH"
echo "=================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier les prérequis
check_prerequisites() {
    print_status "Vérification des prérequis..."
    
    # Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js n'est pas installé"
        exit 1
    fi
    
    # npm/pnpm
    if ! command -v pnpm &> /dev/null; then
        print_warning "pnpm n'est pas installé, utilisation de npm"
        PACKAGE_MANAGER="npm"
    else
        PACKAGE_MANAGER="pnpm"
    fi
    
    # Git
    if ! command -v git &> /dev/null; then
        print_error "Git n'est pas installé"
        exit 1
    fi
    
    print_success "Prérequis vérifiés"
}

# Installer les dépendances
install_dependencies() {
    print_status "Installation des dépendances..."
    
    # Dépendances principales
    $PACKAGE_MANAGER install @mistralai/mistralai
    $PACKAGE_MANAGER install @upstash/redis
    $PACKAGE_MANAGER install @prisma/client
    $PACKAGE_MANAGER install zod
    
    # Dépendances de développement
    $PACKAGE_MANAGER install -D tsx
    
    print_success "Dépendances installées"
}

# Configurer la base de données
setup_database() {
    print_status "Configuration de la base de données..."
    
    # Vérifier si DATABASE_URL est définie
    if [ -z "$DATABASE_URL" ]; then
        print_warning "DATABASE_URL n'est pas définie"
        print_status "Veuillez configurer votre base de données Supabase:"
        echo "1. Créez un projet sur https://supabase.com"
        echo "2. Récupérez votre DATABASE_URL"
        echo "3. Ajoutez-la à votre fichier .env"
        echo ""
        read -p "Appuyez sur Entrée quand c'est fait..."
    fi
    
    # Générer le client Prisma
    npx prisma generate
    
    # Appliquer les migrations
    npx prisma db push
    
    print_success "Base de données configurée"
}

# Charger les données françaises
load_french_data() {
    print_status "Chargement des données françaises..."
    
    # Exécuter le script de seed
    npx tsx scripts/seed-french-data.ts
    
    print_success "Données françaises chargées"
}

# Configurer les services externes
setup_external_services() {
    print_status "Configuration des services externes..."
    
    echo ""
    echo "🔧 Configuration requise:"
    echo ""
    echo "1. Mistral AI (Recommandé pour le français):"
    echo "   - Créez un compte sur https://console.mistral.ai"
    echo "   - Récupérez votre API key"
    echo "   - Ajoutez MISTRAL_API_KEY à votre .env"
    echo ""
    echo "2. Upstash Redis (Cache):"
    echo "   - Créez un compte sur https://upstash.com"
    echo "   - Créez une base Redis"
    echo "   - Ajoutez UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN à votre .env"
    echo ""
    echo "3. Cloudflare R2 (Stockage):"
    echo "   - Activez R2 sur https://dash.cloudflare.com/r2"
    echo "   - Créez un bucket"
    echo "   - Ajoutez les clés R2 à votre .env"
    echo ""
    
    read -p "Appuyez sur Entrée quand tous les services sont configurés..."
    
    print_success "Services externes configurés"
}

# Tester la configuration
test_configuration() {
    print_status "Test de la configuration..."
    
    # Test de la base de données
    if npx prisma db pull --force > /dev/null 2>&1; then
        print_success "Base de données: OK"
    else
        print_error "Base de données: ERREUR"
        return 1
    fi
    
    # Test de l'API (si les clés sont configurées)
    if [ ! -z "$MISTRAL_API_KEY" ]; then
        print_success "Mistral AI: Configuré"
    else
        print_warning "Mistral AI: Non configuré"
    fi
    
    if [ ! -z "$UPSTASH_REDIS_REST_URL" ]; then
        print_success "Upstash Redis: Configuré"
    else
        print_warning "Upstash Redis: Non configuré"
    fi
    
    print_success "Configuration testée"
}

# Créer le fichier .env s'il n'existe pas
create_env_file() {
    if [ ! -f .env ]; then
        print_status "Création du fichier .env..."
        cp env.example .env
        print_success "Fichier .env créé à partir de env.example"
        print_warning "N'oubliez pas de configurer vos clés API dans .env"
    else
        print_status "Fichier .env existe déjà"
    fi
}

# Afficher les prochaines étapes
show_next_steps() {
    echo ""
    echo "🎉 Configuration terminée !"
    echo "=========================="
    echo ""
    echo "Prochaines étapes:"
    echo ""
    echo "1. Configurez vos clés API dans le fichier .env"
    echo "2. Démarrez le serveur de développement:"
    echo "   $PACKAGE_MANAGER run dev"
    echo ""
    echo "3. Testez l'API de matching:"
    echo "   curl -X POST http://localhost:3000/api/authentic-match \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"cvText\":\"...\", \"jobText\":\"...\"}'"
    echo ""
    echo "4. Accédez à l'interface:"
    echo "   http://localhost:3000/authentic-match"
    echo ""
    echo "📚 Documentation:"
    echo "- API: /api/authentic-match"
    echo "- Métriques: /api/authentic-match?type=metrics"
    echo "- Santé: /api/authentic-match?type=health"
    echo ""
    echo "🚀 Déploiement sur Vercel:"
    echo "1. vercel login"
    echo "2. vercel link"
    echo "3. vercel env add [VARIABLE_NAME]"
    echo "4. vercel --prod"
    echo ""
}

# Fonction principale
main() {
    echo "Démarrage de la configuration d'AUTHENTIC-MATCH..."
    echo ""
    
    check_prerequisites
    create_env_file
    install_dependencies
    setup_database
    load_french_data
    setup_external_services
    test_configuration
    show_next_steps
    
    print_success "Configuration terminée avec succès !"
}

# Exécuter le script
main "$@"

