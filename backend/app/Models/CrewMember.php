<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrewMember extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'baseline_profile' => 'array',
        'domain_status' => 'array',
        'overall_data_completeness' => 'float',
        'overall_confidence_score' => 'float',
    ];

    public function mission(): BelongsTo
    {
        return $this->belongsTo(Mission::class);
    }

    public function healthObservations(): HasMany
    {
        return $this->hasMany(HealthObservation::class);
    }

    public function ledgerEvents(): HasMany
    {
        return $this->hasMany(LedgerEvent::class);
    }

    public function incidents(): HasMany
    {
        return $this->hasMany(Incident::class);
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
