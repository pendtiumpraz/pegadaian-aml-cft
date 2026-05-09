<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WatchlistAuditLog extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'source_id',
        'operation',
        'delta_added',
        'delta_removed',
        'actor',
        'actor_id',
        'status',
        'error_msg',
    ];

    protected function casts(): array
    {
        return [];
    }

    public function source()
    {
        return $this->belongsTo(WatchlistSource::class, 'source_id');
    }

    public function actorUser()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
