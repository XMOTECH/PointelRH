<?php

namespace App\Enums;

enum AttendanceStatus: string
{
    case PRESENT = 'present';
    case LATE = 'late';
    case ABSENT = 'absent';
    case EXCUSED = 'excused';
    case HOLIDAY = 'holiday';
    case BAD_LOCATION = 'bad_location';

    public function label(): string
    {
        return match ($this) {
            self::PRESENT => 'Present',
            self::LATE => 'En retard',
            self::ABSENT => 'Absent',
            self::EXCUSED => 'Excuse',
            self::HOLIDAY => 'Ferie',
            self::BAD_LOCATION => 'Hors zone',
        };
    }

    public function isNegative(): bool
    {
        return in_array($this, [self::LATE, self::ABSENT, self::BAD_LOCATION]);
    }
}
