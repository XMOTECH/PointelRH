<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class MissionAssignment extends Pivot
{
    use HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $table = 'mission_assignments';
}
