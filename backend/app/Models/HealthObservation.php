<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HealthObservation extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'mission_day' => 'integer',
        'timestamp' => 'datetime',
        'value' => 'float',
        'baseline_reference' => 'float',
        'deviation_zscore' => 'float',
        'is_synthetic' => 'boolean',
        'confidence_score' => 'float',
    ];

    public function crewMember(): BelongsTo
    {
        return $this->belongsTo(CrewMember::class);
    }
}
