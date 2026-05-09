<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'txn_id',
        'customer_id',
        'cif',
        'outlet_id',
        'channel',
        'type',
        'amount',
        'txn_time',
        'flagged',
        'flag_tone',
        'risk_score',
        'rules_triggered',
        'reviewed',
        'reviewed_by',
        'reviewed_at',
        'counterparty',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'txn_time'        => 'datetime',
            'reviewed_at'     => 'datetime',
            'flagged'         => 'boolean',
            'reviewed'        => 'boolean',
            'rules_triggered' => 'array',
        ];
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
