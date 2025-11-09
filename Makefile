.PHONY: help dev prod logs stop clean

.DEFAULT_GOAL := help

BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m

help: ## Show available commands
	@echo "$(BLUE)Spotify Dashboard$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""

##@ Development
dev: ## Start dev environment (hot reload)
	docker compose -f docker-compose.dev.yml up

##@ Production
secrets: ## Create production secrets
	./init-secrets.sh

prod: ## Start production environment
	@echo "$(YELLOW)Run 'make secrets' first if you haven't!$(NC)"
	docker compose -f docker-compose.prod.yml up -d --build

##@ Common
logs: ## View logs (append 'service=backend' to filter)
	@docker compose -f docker-compose.dev.yml logs -f $(service) 2>/dev/null || docker compose -f docker-compose.prod.yml logs -f $(service)

stop: ## Stop all containers
	-docker compose -f docker-compose.dev.yml down 2>/dev/null
	-docker compose -f docker-compose.prod.yml down 2>/dev/null

clean: ## Remove everything (containers, volumes, images)
	@echo "$(YELLOW)This will delete ALL data. Press Ctrl+C to cancel...$(NC)"
	@sleep 3
	-docker compose -f docker-compose.dev.yml down -v
	-docker compose -f docker-compose.prod.yml down -v
	-docker rmi $$(docker images -q spotify-dashboard* 2>/dev/null) 2>/dev/null || true
	-rm -rf secrets/
	@echo "$(GREEN)Done!$(NC)"
