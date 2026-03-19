<?php

namespace App\Enums;

enum NotificationType: string
{
    case LATE = 'late';
    case ABSENT = 'absent';
    case LEAVE_APPROVED = 'leave_approved';
    case LEAVE_REJECTED = 'leave_rejected';
    case REPORT = 'report';
}
