<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Alert extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'alert_id',
        'customer_id',
        'txn_id',
        'rule_id',
        'type',
        'severity',
        'risk_score',
        'status',
        'priority',
        'assigned_to',
        'assigned_at',
        'sla_due_at',
        'factors_json',
        'notes',
        'closed_at',
        'closed_by',
        'close_reason',
        'source',
    ];

    protected function casts(): array
    {
        return [
            'assigned_at'  => 'datetime',
            'sla_due_at'   => 'datetime',
            'closed_at'    => 'datetime',
            'factors_json' => 'array',
        ];
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function closedBy()
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    public function cases()
    {
        return $this->hasMany(AmlCase::class, 'alert_id', 'alert_id');
    }

    public function watchlistHits()
    {
        return $this->hasMany(WatchlistHit::class, 'alert_id', 'alert_id');
    }
}
