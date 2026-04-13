
● Voici toutes les commandes Docker :

  # ═══════════════════════════════════════════════════════════
  # 1. DÉMARRER L'INFRASTRUCTURE
  # ═══════════════════════════════════════════════════════════

  # Rebuild les services modifiés (employee-service, pointage-service, frontend)
  docker compose build employee-service pointage-service frontend

  # Démarrer tout
  docker compose up -d

  # Vérifier que tous les containers sont up
  docker compose ps

  # ═══════════════════════════════════════════════════════════
  # 2. MIGRATIONS — Employee-Service (table face_descriptors)
  # ═══════════════════════════════════════════════════════════

  # Exécuter la migration
  docker compose exec employee-service php artisan migrate

  # Vérifier que la table est créée
  docker compose exec employee-service php artisan migrate:status

  # Vérifier la structure de la table
  docker compose exec employee-service php artisan db:show --counts

  # ═══════════════════════════════════════════════════════════
  # 3. VÉRIFICATION DES ROUTES — Employee-Service
  # ═══════════════════════════════════════════════════════════

  # Lister toutes les routes (vérifier resolve-face + face-enrollment)
  docker compose exec employee-service php artisan route:list --path=face

  # Devrait afficher :
  #   POST  /employees/resolve-face         → EmployeeController@resolveFace
  #   GET   /employees/{id}/face-enrollment  → FaceEnrollmentController@show
  #   POST  /employees/{id}/face-enrollment  → FaceEnrollmentController@store
  #   DELETE /employees/{id}/face-enrollment → FaceEnrollmentController@destroy

  # ═══════════════════════════════════════════════════════════
  # 4. VÉRIFICATION DES ROUTES — Pointage-Service
  # ═══════════════════════════════════════════════════════════

  # Vérifier que le canal 'face' est enregistré
  docker compose exec pointage-service php artisan route:list --path=clock

  # Tester la santé du service
  docker compose exec pointage-service php artisan about

  # ═══════════════════════════════════════════════════════════
  # 5. TESTS UNITAIRES (si disponibles)
  # ═══════════════════════════════════════════════════════════

  # Tests employee-service
  docker compose exec employee-service php artisan test

  # Tests pointage-service
  docker compose exec pointage-service php artisan test

  # ═══════════════════════════════════════════════════════════
  # 6. TESTS FONCTIONNELS MANUELS (curl via Kong)
  # ═══════════════════════════════════════════════════════════

  # 6a. Health checks
  docker compose exec employee-service curl -s http://localhost/api/health | head
  docker compose exec pointage-service curl -s http://localhost/api/health | head

  # 6b. Test resolve-face (devrait retourner 404 "Aucune donnée faciale")
  docker compose exec pointage-service curl -s -X POST
  http://employee-service/api/employees/resolve-face \
    -H "Content-Type: application/json" \
    -d '{"descriptor": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  ,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  ,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "company_id": "test-company"}'

  # 6c. Test clock-in avec channel face (devrait retourner 404 visage non reconnu)
  docker compose exec pointage-service curl -s -X POST
  http://localhost/api/pointage/clock-in \
    -H "Content-Type: application/json" \
    -d '{"channel": "face", "payload": {"descriptor": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  ,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}}'

  # ═══════════════════════════════════════════════════════════
  # 7. VÉRIFIER LA DB DIRECTEMENT
  # ═══════════════════════════════════════════════════════════

  # Se connecter à la DB employee
  docker compose exec employee-db mysql -u emp_user -pemp_pass employee_db -e "SHOW
  TABLES LIKE 'face%';"
  docker compose exec employee-db mysql -u emp_user -pemp_pass employee_db -e
  "DESCRIBE face_descriptors;"

  # ═══════════════════════════════════════════════════════════
  # 8. VÉRIFIER LE FRONTEND (modèles face-api.js)
  # ═══════════════════════════════════════════════════════════

  # Vérifier que les modèles sont dans le build
  docker compose exec frontend ls -lh /usr/share/nginx/html/models/

  # Tester l'accès via le navigateur
  # → http://localhost:3000/models/ssd_mobilenetv1_model-weights_manifest.json

  # ═══════════════════════════════════════════════════════════
  # 9. LOGS EN CAS DE PROBLÈME
  # ═══════════════════════════════════════════════════════════

  # Logs employee-service
  docker compose logs employee-service --tail=50

  # Logs pointage-service
  docker compose logs pointage-service --tail=50

  # Logs en temps réel (toute la stack)
  docker compose logs -f employee-service pointage-service frontend

  # ═══════════════════════════════════════════════════════════
  # 10. CLEAR CACHE (si les routes ne sont pas reconnues)
  # ═══════════════════════════════════════════════════════════

  docker compose exec employee-service php artisan config:clear
  docker compose exec employee-service php artisan route:clear
  docker compose exec employee-service php artisan cache:clear

  docker compose exec pointage-service php artisan config:clear
  docker compose exec pointage-service php artisan route:clear
  docker compose exec pointage-service php artisan cache:clear

  Ordre d'exécution recommandé : 1 → 2 → 3 → 4 → 7 → 6 → 8. Les étapes 3-4 valident
  les routes, 7 valide la DB, 6 fait les tests end-to-end inter-services.


  Le probleme est visible dans la sortie Docker : seul frontend a ete "Recreated", tous les autres services montrent "Running" (pas
  redemarres). Le code PHP et le kong.yml ne sont pas pris en compte.
                                                                                                                                          
  Tu dois :                                                                                                                               
                                                                                                                                          
  1. Reconstruire et redemarrer employee-service et kong pour charger les nouvelles routes :                                              
                                                                                                                                        
  docker compose up -d --build employee-service kong

  2. Executer les migrations dans le container :

  docker exec employee-service php artisan migrate

  3. Executer le seeder :

  docker exec employee-service php artisan db:seed --class=LeaveTypeSeeder

  4. Redemarrer notif-service pour le nouveau consumer :

  docker compose up -d --build notif-service

  Le --build force la reconstruction de l'image avec le code mis a jour. Sans ca, les containers reutilisent l'ancienne image en cache.

● Ran 1 stop hook (ctrl+o to expand)
  ⎿  Stop hook error: Failed with non-blocking status code: /usr/bin/bash: line 1: C:Program: command not found