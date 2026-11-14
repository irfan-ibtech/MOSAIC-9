<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mission extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'current_day' => 'integer',
        'elapsed_hours' => 'integer',
        'launch_timestamp' => 'datetime',
        'communication_latency_seconds' => 'integer',
        'radiation_ambient_usv_per_h' => 'float',
        'cabin_pressure_kpa' => 'float',
        'cabin_o2_percent' => 'float',
        'cabin_co2_mmhg' => 'float',
    ];

    public function crewMembers(): HasMany
    {
        return $this->hasMany(CrewMember::class);
    }
}
