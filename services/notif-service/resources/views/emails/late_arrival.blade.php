<x-mail::message>
# Alerte retard — {{ $employeeName }}
 
Bonjour {{ $managerName }},
 
**{{ $employeeName }}** a pointé ce matin à **{{ $clockInTime }}**
avec un retard de **{{ $lateMinutes }} minutes**.
 
| Heure prévue | Heure réelle | Retard |
|---|---|---|
| {{ $expectedTime }} | {{ $clockInTime }} | {{ $lateMinutes }} min |
 
<x-mail::button url="{{ $dashboardUrl }}" color="orange">
Voir le dashboard
</x-mail::button>
 
Cordialement,
**Pointel RH** — Plateforme de Pointage
</x-mail::message>
