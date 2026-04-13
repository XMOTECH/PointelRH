# La Solution PointelRH

## Vision

Offrir a chaque entreprise, quelle que soit sa taille, une plateforme complete de gestion RH operationnelle accessible depuis n'importe quel ecran, sans investissement materiel.

## Les piliers de la solution

### Pilier 1 : Pointage Intelligent Multi-Mode

PointelRH propose **3 modes de pointage** qui s'adaptent a chaque contexte :

**QR Code**
- Chaque site de travail dispose d'un QR Code unique
- L'employe scanne avec son telephone ou depuis le kiosque
- Le code est genere par la plateforme et telechargebale en PDF
- Ideal pour les entreprises multi-sites

**Code PIN (Kiosque)**
- Un ecran partage a l'entree de l'entreprise (tablette standard)
- L'employe saisit son code PIN a 4 chiffres
- Interface epuree avec grande horloge temps reel
- Ideal pour les usines, entrepots, chantiers

**Reconnaissance Faciale**
- Pointage biometrique sans contact via la camera
- Inscription faciale en quelques secondes depuis le profil employe
- Detection de vivacite (anti-photo)
- Fonctionne sur tablette ou smartphone standard
- Zero materiel biometrique dedie

### Pilier 2 : Supervision Temps Reel

**Dashboard executif**
- KPI en temps reel : presents, absents, retards, taux de presence
- Vue par jour, semaine ou mois
- Graphiques de tendance de presence
- Repartition des effectifs par departement

**Live Monitor**
- Flux en direct de chaque pointage
- Alertes de geofencing (employe hors zone)
- Carte interactive des incidents
- Visibilite immediate pour les managers

**Geofencing GPS**
- Chaque site est defini par latitude/longitude/rayon
- Verification automatique de la position au moment du pointage
- Alerte si l'employe pointe en dehors de la zone autorisee
- Carte Leaflet interactive pour la gestion des sites

### Pilier 3 : Gestion Operationnelle Complete

**Missions terrain**
- Creation de missions avec titre, lieu, dates, equipe
- Assignation d'employes avec notification automatique
- Suivi de progression et statuts (brouillon, active, terminee)
- Vue employe "Mes Missions" avec details complets

**Taches quotidiennes**
- Assignation de taches avec priorite (haute/moyenne/basse) et echeance
- Liaison optionnelle avec une mission
- Chronometre integre pour tracker le temps passe
- Commentaires et echanges sur chaque tache
- Vue manager groupee par employe avec barres de progression
- Notification automatique a l'assignation et a la completion

**Gestion des conges**
- Soumission de demandes par l'employe
- Approbation/refus par le manager en un clic
- Historique complet avec filtrage par statut
- Escalade automatique si non traite

**Planning hebdomadaire**
- Modeles de plannings reutilisables
- Jours de travail, horaires, minutes de tolerance
- Assignation aux employes
- Vue employe "Mon Planning"
- Surcharge ponctuelle possible

### Pilier 4 : Communication Automatisee

**Notifications intelligentes**
- Architecture evenementielle (RabbitMQ)
- Notifications in-app en temps reel
- Emails automatiques (identifiants, PIN)
- Evenements couverts :
  - Mission assignee
  - Tache assignee / terminee
  - Retard detecte
  - Absence detectee
  - Identifiants generes

### Pilier 5 : Multi-Entreprise SaaS

**Back-office super-admin**
- Gestion de toutes les entreprises clientes
- Creation/activation/desactivation en un clic
- Statistiques globales (nombre d'entreprises, employes, etc.)
- Isolation totale des donnees entre entreprises

## La stack technique comme avantage

| Composant | Technologie | Avantage |
|-----------|-------------|----------|
| Frontend Web | React 19 + TypeScript + Vite | Performances, maintenabilite |
| Mobile | React Native | iOS + Android avec un seul code |
| Backend | 5 microservices Laravel 12 | Scalabilite independante |
| Base de donnees | MySQL 8.0 + PostgreSQL | Fiabilite, performance |
| Message broker | RabbitMQ | Notifications temps reel |
| API Gateway | Kong | Routage, rate limiting, securite |
| Cache | Redis | Sessions, performance |
| Conteneurisation | Docker Compose | Deploiement reproductible |
| Auth | JWT + Google OAuth | Securite moderne |
| IA | Face API (reconnaissance faciale) | Pointage biometrique |
