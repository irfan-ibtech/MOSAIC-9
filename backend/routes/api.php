<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MissionController;
use App\Http\Controllers\Api\CrewController;
use App\Http\Controllers\Api\LedgerController;
use App\Http\Controllers\Api\IncidentController;
use App\Http\Controllers\Api\ScenarioController;
use App\Http\Controllers\Api\GroundCommunicationController;
use App\Http\Controllers\Api\SyncController;
use App\Http\Controllers\Api\IntelligenceBridgeController;
use App\Http\Controllers\Api\NasaEvidenceController;

Route::prefix('mission')->group(function () {
    Route::get('/', [MissionController::class, 'show']);
    Route::post('/status', [MissionController::class, 'updateStatus']);
});

Route::prefix('crew')->group(function () {
    Route::get('/', [CrewController::class, 'index']);
    Route::get('/{id}', [CrewController::class, 'show']);
    Route::get('/{id}/observations', [CrewController::class, 'observations']);
});

Route::prefix('ledger')->group(function () {
    Route::get('/', [LedgerController::class, 'index']);
    Route::get('/{id}', [LedgerController::class, 'show']);
    Route::post('/', [LedgerController::class, 'store']);
});

Route::prefix('incidents')->group(function () {
    Route::get('/', [IncidentController::class, 'index']);
    Route::get('/{id}', [IncidentController::class, 'show']);
    Route::get('/{id}/reconstruct', [IncidentController::class, 'reconstruct']);
    Route::get('/{id}/evidence-graph', [NasaEvidenceController::class, 'evidenceGraph']);
});

Route::prefix('evidence')->group(function () {
    Route::get('/studies', [NasaEvidenceController::class, 'index']);
    Route::get('/studies/{studyId}', [NasaEvidenceController::class, 'show']);
    Route::post('/osdr-lookup', [NasaEvidenceController::class, 'osdrLookup']);
});

Route::prefix('scenarios')->group(function () {
    Route::get('/', [ScenarioController::class, 'index']);
    Route::post('/compare', [ScenarioController::class, 'compare']);
    Route::post('/sensitivity', [ScenarioController::class, 'sensitivity']);
    Route::post('/simulate', [ScenarioController::class, 'simulate']);
    Route::get('/{id}', [ScenarioController::class, 'show']);
});

Route::prefix('ground-comms')->group(function () {
    Route::get('/', [GroundCommunicationController::class, 'index']);
    Route::get('/{id}', [GroundCommunicationController::class, 'show']);
    Route::post('/', [GroundCommunicationController::class, 'store']);
    Route::post('/{id}/transmit', [GroundCommunicationController::class, 'transmit']);
});

Route::prefix('sync')->group(function () {
    Route::get('/status', [SyncController::class, 'status']);
    Route::post('/trigger', [SyncController::class, 'triggerSync']);
    Route::post('/toggle-link', [SyncController::class, 'toggleLink']);
});

Route::prefix('intelligence')->group(function () {
    Route::match(['get', 'post'], '/temporal-analysis', [IntelligenceBridgeController::class, 'analyzeTemporalRelationships']);
    Route::match(['get', 'post'], '/temporal-relationships', [IntelligenceBridgeController::class, 'analyzeTemporalRelationships']);
});
