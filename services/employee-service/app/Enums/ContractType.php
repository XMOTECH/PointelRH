<?php

namespace App\Enums;

enum ContractType: string
{
    case CDI = 'cdi';
    case CDD = 'cdd';
    case FREELANCE = 'freelance';
    case INTERN = 'intern';

    public function label(): string
    {
        return match ($this) {
            self::CDI => 'CDI',
            self::CDD => 'CDD',
            self::FREELANCE => 'Freelance',
            self::INTERN => 'Stagiaire',
        };
    }
}
