# Fonctionnalites Detaillees

## Vue d'ensemble par role

```
+------------------------------------------------------------------+
|                        SUPER ADMIN                                |
|  Gestion multi-entreprise | Stats globales | Activation clients   |
+------------------------------------------------------------------+
|                     ADMINISTRATEUR                                |
|  Dashboard | Employes | Departements | Plannings | Parametres     |
|  Missions | Taches | Conges | Sites QR | Live Monitor | Managers  |
+------------------------------------------------------------------+
|                        MANAGER                                    |
|  Dashboard | Planning | Missions | Taches Equipe | Conges         |
|  Live Monitor | Notifications                                     |
+------------------------------------------------------------------+
|                        EMPLOYE                                    |
|  Pointage | Mes Missions | Mes Taches | Mon Planning              |
|  Mon Profil | Mon Historique | Notifications                      |
+------------------------------------------------------------------+
```

---

## 1. Pointage (Clock-In / Clock-Out)

### Interface Web Employe
- Horloge temps reel avec affichage des secondes
- Choix du mode : Web (QR Code) ou Reconnaissance Faciale
- Statut en direct : "Non pointe", "Pointe a 08:32", "Journee terminee"
- Messages de succes/erreur animes
- Detection automatique si deja pointe aujourd'hui

### Mode Kiosque (ecran partage)
- Interface plein ecran optimisee pour tablette
- Choix de l'action : Entree ou Sortie
- Choix du mode : PIN ou Reconnaissance Faciale
- Clavier numerique (Numpad) grand format
- Auto-reset apres chaque pointage (securite)
- Affichage du nom de l'employe apres pointage

### Reconnaissance Faciale
- Inscription faciale depuis le profil employe (quelques secondes)
- Detection en temps reel via la camera
- Comparaison des descripteurs faciaux
- Fonctionne sur navigateur standard (pas d'app dediee)
- Utilise la librairie face-api.js (modeles locaux, pas de cloud externe)

### Backend Pointage
- Service dedie (pointage-service) avec sa propre base de donnees
- Validation : employe existe, site valide, pas de double pointage
- Calcul automatique du statut : a l'heure, en retard, absent
- Publication d'evenements RabbitMQ : LateArrivalDetected, AbsenceDetected

---

## 2. Geofencing et Sites QR

### Gestion des sites
- Carte interactive Leaflet avec vue de tous les sites
- Creation de site : nom, adresse, latitude, longitude, rayon (metres)
- Le rayon definit la zone de validite du pointage
- Visualisation du perimetre sur la carte (cercle colore)

### QR Codes
- QR Code unique genere automatiquement pour chaque site
- Affichage dans l'interface avec apercu visuel
- Export PDF pour impression et affichage sur site
- Le QR contient un token unique lie au site

---

## 3. Dashboard et Analytics

### Tableau de bord executif
- **KPI cards** : employes total, presents aujourd'hui, taux de presence, retards
- **Selecteur de periode** : jour / semaine / mois
- **Selecteur de date** : naviguer dans l'historique
- **Graphique de tendance** : evolution de la presence sur 7 ou 30 jours (Recharts)
- **Repartition des effectifs** : par departement, par statut
- **Pointages recents echoues** : alertes visuelles

### Live Monitor (temps reel)
- **Flux en direct** : chaque pointage affiche en temps reel
- **Alertes de geofencing** : employes hors zone
- **Carte des alertes** : localisation des incidents sur carte interactive

---

## 4. Gestion des Employes

### CRUD complet
- Creation avec saga pattern (employee-service + auth-service synchronises)
- Informations : nom, prenom, email, telephone, departement, planning, contrat
- Types de contrat : CDI, CDD, Stage, Freelance
- Statuts : Actif, Inactif, Suspendu

### Fonctionnalites avancees
- Generation de PIN unique (avec prefixe anti-collision)
- Generation de QR Token personnel
- Inscription faciale (enregistrement + suppression)
- Envoi automatique des identifiants par email
- Vue detail en modal avec toutes les informations
- Filtrage par departement, statut, recherche textuelle

---

## 5. Gestion des Departements

- CRUD avec structure hierarchique (parent_id)
- Sous-departements supportes
- Assignation d'employes aux departements
- Scoping automatique : un manager ne voit que son departement

---

## 6. Gestion des Managers

- Liste dediee des managers
- Attribution du role manager a un employe existant
- Perimetre limite au departement assigne
- Middleware backend pour filtrer automatiquement les donnees

---

## 7. Plannings et Modeles

### Modeles de plannings
- Nom, jours de travail (JSON), horaire debut/fin
- Minutes de tolerance (grace_minutes) pour les retards
- Reutilisables sur plusieurs employes

### Planning hebdomadaire
- Vue calendrier de la semaine
- Assignation des employes aux creneaux
- Surcharge ponctuelle (override) possible
- Vue employe "Mon Planning" en lecture seule

---

## 8. Missions

### Cote Manager/Admin
- Creation : titre, description, lieu, dates debut/fin
- Assignation d'employes (multi-selection)
- Statuts : brouillon, active, terminee, annulee
- Vue cards avec avatars des assignes
- Page de suivi (tracking) par mission

### Cote Employe
- Page "Mes Missions" avec groupement par statut
- Badges de statut mission + statut d'assignation
- Commentaire du manager visible
- Notification automatique a l'assignation

---

## 9. Taches Quotidiennes

### Cote Manager/Admin
- Creation avec : titre, description, priorite, echeance, temps estime
- Assignation a un employe
- Liaison optionnelle avec une mission
- Vue equipe groupee par employe
- Barre de progression par employe (X/Y terminees)
- Filtres : statut, priorite, recherche
- Changement de statut et suppression

### Cote Employe
- Page "Mes Taches" avec stats rapides (a faire, en cours, terminees, temps total)
- Filtrage par onglets
- Changement de statut en un clic (todo → en cours → terminee)
- Chronometre integre (demarrer/arreter = temps enregistre)
- Ajout de commentaires
- Badge mission visible si la tache est liee a une mission
- Indicateur de retard si echeance depassee
- Barre de progression (temps reel vs estime)

### Notifications
- Tache assignee → notification employe
- Tache terminee → notification manager

---

## 10. Gestion des Conges

- Soumission par l'employe : type, dates, motif
- Liste pour le manager avec filtrage par statut
- Approbation / Refus en un clic
- Statuts : en attente, approuve, refuse
- Escalade automatique si non traite (evenement RabbitMQ)

---

## 11. Notifications

### Types de notifications
| Evenement | Destinataire | Type |
|-----------|-------------|------|
| Mission assignee | Employe | info |
| Tache assignee | Employe | info |
| Tache terminee | Manager | success |
| Retard detecte | Manager | warning |
| Absence detectee | Manager | error |
| PIN genere | Employe | email |
| Compte cree | Employe | email |
| Conge approuve/refuse | Employe | success/error |

### Interface
- Page Notifications avec filtre lu/non-lu
- Icone cloche avec indicateur de non-lus dans le header
- Marquage lu unitaire ou global
- Suppression de notifications

---

## 12. Profil Employe

- Informations personnelles en lecture
- Statut d'inscription faciale avec bouton d'enregistrement
- QR Code personnel
- Changement de mot de passe
- Historique de pointage (Mon Historique)

---

## 13. Multi-Entreprise (Super Admin)

- Back-office dedie avec stats globales
- Liste des entreprises avec recherche et pagination
- Creation d'entreprise (nom, email admin, etc.)
- Activation/desactivation en un clic
- Isolation totale des donnees (company_id sur chaque table)

---

## 14. Parametres Entreprise

- **Profil entreprise** : nom, adresse, contact
- **Politiques de pointage** : tolerance retard, regles absence
- **Jours feries** : configuration par entreprise

---

## 15. Application Mobile (React Native)

- Theme et design system coherent avec le web
- Store d'authentification (JWT)
- Utilitaires API pre-configures
- Composants UI reutilisables (Button, Card, Badge, Input)
- Pointage en mobilite
