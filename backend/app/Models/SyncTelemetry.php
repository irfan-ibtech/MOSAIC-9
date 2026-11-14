<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SyncTelemetry extends Model
{
    use HasFactory;

    protected $table = 'sync_telemetry';
    protected $guarded = [];

    protected $casts = [
        'last_successful_sync_at' => 'datetime',
        'queued_items_count' => 'integer',
        'round_trip_latency_sec' => 'integer',
        'local_db_integrity_pct' => 'float',
        'offline_mode_active' => 'boolean',
    ];
}
