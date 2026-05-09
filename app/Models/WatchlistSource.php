<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WatchlistSource extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'display_name',
        'source_org',
        'type',
        'entry_count',
        'last_synced_at',
        'sync_mode',
        'sync_status',
        'sync_url',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'last_synced_at' => 'datetime',
            'is_active'      => 'boolean',
        ];
    }

    public function entries()
    {
        return $this->hasMany(WatchlistEntry::class, 'source_id');
    }

    public function hits()
    {
        return $this->hasMany(WatchlistHit::class, 'source_id');
    }

    public function auditLogs()
    {
        return $this->hasMany(WatchlistAuditLog::class, 'source_id');
    }
}
