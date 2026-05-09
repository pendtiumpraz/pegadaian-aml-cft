<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PatrolExecution extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'patrol_rule_id',
        'data_source_id',
        'executed_by',
        'started_at',
        'finished_at',
        'duration_seconds',
        'data_scanned_gb',
        'hit_count',
        'promoted_count',
        'status',
        'error_msg',
    ];

    protected function casts(): array
    {
        return [
            'started_at'  => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    public function patrolRule()
    {
        return $this->belongsTo(AiPatrolRule::class, 'patrol_rule_id');
    }

    public function dataSource()
    {
        return $this->belongsTo(DataSource::class);
    }

    public function executedBy()
    {
        return $this->belongsTo(User::class, 'executed_by');
    }

    public function results()
    {
        return $this->hasMany(PatrolResult::class, 'execution_id');
    }
}
