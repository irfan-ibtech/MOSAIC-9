<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CountermeasureScenario extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'inputs' => 'array',
        'projections' => 'array',
        'is_active' => 'boolean',
    ];

    public function crewMember(): BelongsTo
    {
        return $this->belongsTo(CrewMember::class);
    }

    public function incident(): BelongsTo
    {
        return $this->belongsTo(Incident::class);
    }
}
