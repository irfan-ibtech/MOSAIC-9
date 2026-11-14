<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LedgerEvent extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'mission_day' => 'integer',
        'event_timestamp' => 'datetime',
        'recorded_timestamp' => 'datetime',
        'value' => 'float',
        'data_provenance' => 'array',
        'confidence_score' => 'float',
        'is_synthetic' => 'boolean',
    ];

    public function crewMember(): BelongsTo
    {
        return $this->belongsTo(CrewMember::class);
    }
}
