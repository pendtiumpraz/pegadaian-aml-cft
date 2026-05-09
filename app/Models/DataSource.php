<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DataSource extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'slug',
        'name',
        'type',
        'host',
        'port',
        'database_name',
        'db_user',
        'password_vault_ref',
        'ssl_enabled',
        'validate_view_only',
        'auto_discovery',
        'table_count',
        'latency_ms',
        'status',
        'is_primary',
        'last_scanned_at',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'ssl_enabled'       => 'boolean',
            'validate_view_only'=> 'boolean',
            'auto_discovery'    => 'boolean',
            'is_primary'        => 'boolean',
            'last_scanned_at'   => 'datetime',
        ];
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function tables()
    {
        return $this->hasMany(DataSourceTable::class);
    }

    public function patrolExecutions()
    {
        return $this->hasMany(PatrolExecution::class);
    }
}
