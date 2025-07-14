#!/bin/bash

# Script di deployment per SORE
# Uso: ./deploy.sh [start|stop|restart|logs|backup|restore]

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funzione per stampare messaggi colorati
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Controlla se Docker è installato
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker non è installato. Installa Docker prima di continuare."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose non è installato. Installa Docker Compose prima di continuare."
        exit 1
    fi
}

# Controlla se il file .env esiste
check_env() {
    if [ ! -f .env ]; then
        print_warning "File .env non trovato. Creo .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_message "File .env creato da .env.example. Modifica le variabili d'ambiente prima di continuare."
            exit 1
        else
            print_error "File .env.example non trovato. Crea il file .env manualmente."
            exit 1
        fi
    fi
}

# Funzione per avviare i servizi
start_services() {
    print_message "Avvio dei servizi SORE..."
    docker-compose up -d
    print_message "Servizi avviati con successo!"
    
    # Aspetta che i servizi siano pronti
    print_message "Attendo che i servizi siano pronti..."
    sleep 10
    
    # Controlla lo stato dei servizi
    docker-compose ps
}

# Funzione per fermare i servizi
stop_services() {
    print_message "Fermata dei servizi SORE..."
    docker-compose down
    print_message "Servizi fermati con successo!"
}

# Funzione per riavviare i servizi
restart_services() {
    print_message "Riavvio dei servizi SORE..."
    docker-compose down
    docker-compose up -d
    print_message "Servizi riavviati con successo!"
}

# Funzione per visualizzare i log
show_logs() {
    print_message "Visualizzazione dei log..."
    docker-compose logs -f
}

# Funzione per backup
backup_data() {
    print_message "Creazione backup dei dati..."
    
    # Crea directory backup se non esiste
    mkdir -p backups/$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    
    # Backup del database
    print_message "Backup del database..."
    docker-compose exec -T db mysqldump -u root -p${MYSQL_ROOT_PASSWORD:-rootpassword} sore > "$BACKUP_DIR/database.sql" 2>/dev/null || {
        print_warning "Impossibile fare backup del database. Il servizio potrebbe non essere avviato."
    }
    
    # Backup dei file media
    print_message "Backup dei file media..."
    docker run --rm -v sore_backend_media:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf /backup/media.tar.gz -C /data . 2>/dev/null || {
        print_warning "Impossibile fare backup dei file media. Il volume potrebbe non esistere."
    }
    
    print_message "Backup completato in $BACKUP_DIR"
}

# Funzione per restore
restore_data() {
    if [ -z "$1" ]; then
        print_error "Specifica la directory del backup da ripristinare"
        echo "Uso: ./deploy.sh restore <backup_directory>"
        exit 1
    fi
    
    BACKUP_DIR="$1"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        print_error "Directory backup $BACKUP_DIR non trovata"
        exit 1
    fi
    
    print_warning "ATTENZIONE: Questa operazione sovrascriverà i dati esistenti!"
    read -p "Sei sicuro di voler continuare? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_message "Operazione annullata"
        exit 0
    fi
    
    print_message "Ripristino dei dati da $BACKUP_DIR..."
    
    # Restore del database
    if [ -f "$BACKUP_DIR/database.sql" ]; then
        print_message "Ripristino del database..."
        docker-compose exec -T db mysql -u root -p${MYSQL_ROOT_PASSWORD:-rootpassword} sore < "$BACKUP_DIR/database.sql" || {
            print_error "Errore nel ripristino del database"
            exit 1
        }
    fi
    
    # Restore dei file media
    if [ -f "$BACKUP_DIR/media.tar.gz" ]; then
        print_message "Ripristino dei file media..."
        docker run --rm -v sore_backend_media:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine tar xzf /backup/media.tar.gz -C /data || {
            print_error "Errore nel ripristino dei file media"
            exit 1
        }
    fi
    
    print_message "Ripristino completato!"
}

# Funzione per aggiornare i servizi
update_services() {
    print_message "Aggiornamento dei servizi..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    print_message "Servizi aggiornati con successo!"
}

# Funzione per pulire i volumi non utilizzati
cleanup() {
    print_warning "ATTENZIONE: Questa operazione rimuoverà tutti i volumi non utilizzati!"
    read -p "Sei sicuro di voler continuare? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_message "Operazione annullata"
        exit 0
    fi
    
    print_message "Pulizia dei volumi non utilizzati..."
    docker volume prune -f
    print_message "Pulizia completata!"
}

# Funzione per mostrare l'aiuto
show_help() {
    echo "Script di deployment per SORE"
    echo ""
    echo "Uso: ./deploy.sh [COMANDO]"
    echo ""
    echo "Comandi disponibili:"
    echo "  start     - Avvia tutti i servizi"
    echo "  stop      - Ferma tutti i servizi"
    echo "  restart   - Riavvia tutti i servizi"
    echo "  logs      - Visualizza i log in tempo reale"
    echo "  backup    - Crea un backup dei dati"
    echo "  restore   - Ripristina i dati da un backup"
    echo "  update    - Aggiorna i servizi (rebuild)"
    echo "  cleanup   - Pulisce i volumi non utilizzati"
    echo "  status    - Mostra lo stato dei servizi"
    echo "  help      - Mostra questo messaggio"
    echo ""
    echo "Esempi:"
    echo "  ./deploy.sh start"
    echo "  ./deploy.sh restore backups/20241201_143022"
}

# Funzione per mostrare lo stato
show_status() {
    print_message "Stato dei servizi:"
    docker-compose ps
    
    echo ""
    print_message "Volumi:"
    docker volume ls | grep sore || echo "Nessun volume SORE trovato"
    
    echo ""
    print_message "Risorse utilizzate:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

# Controlli iniziali
check_docker
check_env

# Parsing degli argomenti
case "${1:-help}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs
        ;;
    backup)
        backup_data
        ;;
    restore)
        restore_data "$2"
        ;;
    update)
        update_services
        ;;
    cleanup)
        cleanup
        ;;
    status)
        show_status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Comando sconosciuto: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 