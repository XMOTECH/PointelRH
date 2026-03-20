## 📋 Notification Service Architecture

Cette documentation décrit l'architecture refactorisée du service Notification.

### 📂 Structure

```
app/
├── Http/
│   └── Controllers/Api/
│       ├── BaseApiController.php       ← Contrôleur de base
│       └── NotificationController.php  ← CRUD notifications
├── Services/
│   ├── NotificationService.php         ← Logique métier notifications
│   ├── NotificationRouter.php          ← Routeur notifications
│   ├── DeduplicationService.php        ← Déduplication
│   ├── LoggingService.php              ← Logs centralisés
│   └── Channels/
│       ├── EmailChannel.php
│       ├── WhatsAppChannel.php
│       ├── InAppChannel.php
│       └── SMSChannel.php
├── Exceptions/
│   ├── BaseApiException.php
│   ├── ResourceNotFoundException.php
│   ├── InvalidDataException.php
│   └── NotificationSendException.php
```

### 🔄 Endpoints Disponibles

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/notifications` | GET | Lister les notifications |
| `/api/notifications/{id}` | GET | Récupérer une notification |
| `/api/notifications/{id}/read` | POST | Marquer comme lue |
| `/api/notifications/{id}` | DELETE | Supprimer une notification |

### ✅ Contrôleurs Refactorisés

| Contrôleur | Statut | Détails |
|-----------|--------|---------|
| NotificationController | ✅ | CRUD créé avec logging et gestion erreurs |

### 🎯 Architecture des Canaux

Les notifications peuvent être envoyées via différents canaux:
- 📧 **Email** - Via SMTP
- 💬 **WhatsApp** - Via API WhatsApp
- 📱 **In-App** - Stockées en base
- 📞 **SMS** - Via provider SMS

### 📊 Examples

#### Lister les notifications
```
GET /api/notifications
```

#### Marquer comme lue
```
POST /api/notifications/{id}/read
```

Response:
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```
