<x-mail::message>
@if($credentialType === 'pin')
# Votre code PIN et accès

Bonjour **{{ $employeeName }}**,

@if($password)
Vos accès PointelRH ont été mis à jour. Voici vos identifiants pour pointer et vous connecter :

| | |
|---|---|
| **Espace Web/Mobile** | {{ $email }} |
| **Mot de passe** | `{{ $password }}` |
| **Code PIN Kiosque** | **{{ $credentialValue }}** |

<x-mail::button url="{{ $loginUrl }}">
Accéder à mon espace
</x-mail::button>
@else
Votre code PIN pour le pointage a été généré :

<x-mail::panel>
<div style="text-align:center; font-size:32px; font-weight:bold; letter-spacing:8px;">
{{ $credentialValue }}
</div>
</x-mail::panel>

**Ne partagez ce code avec personne.** Il vous permettra de pointer votre présence via le terminal de votre site.
@endif

@else
# Vos identifiants de connexion

Bonjour **{{ $employeeName }}**,

Votre compte PointelRH a été créé. Voici vos identifiants :

| | |
|---|---|
| **Email** | {{ $email }} |
| **Mot de passe temporaire** | `{{ $credentialValue }}` |

> Nous vous recommandons de changer votre mot de passe dès votre première connexion.

<x-mail::button url="{{ $loginUrl }}">
Se connecter
</x-mail::button>
@endif

Cordialement,
**Pointel RH** — Plateforme de Pointage
</x-mail::message>
