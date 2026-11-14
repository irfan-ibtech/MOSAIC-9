<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroundCommunication extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'evidence_ledger_ids' => 'array',
        'transmitted_at' => 'datetime',
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
