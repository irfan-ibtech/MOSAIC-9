<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Incident extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'mission_day' => 'integer',
        'incident_timestamp' => 'datetime',
        'reconstruction_summary' => 'array',
        'supporting_evidence_count' => 'integer',
        'missing_evidence_count' => 'integer',
    ];

    public function crewMember(): BelongsTo
    {
        return $this->belongsTo(CrewMember::class);
    }

    public function scenarios(): HasMany
    {
        return $this->hasMany(CountermeasureScenario::class);
    }

    public function groundCommunications(): HasMany
    {
        return $this->hasMany(GroundCommunication::class);
    }
}
