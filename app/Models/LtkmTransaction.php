<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LtkmTransaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ltkm_id',
        'txn_id',
        'txn_time',
        'type',
        'outlet',
        'amount',
        'rules_triggered',
    ];

    protected function casts(): array
    {
        return [
            'txn_time'        => 'datetime',
            'rules_triggered' => 'array',
        ];
    }

    public function ltkmReport()
    {
        return $this->belongsTo(LtkmReport::class, 'ltkm_id');
    }
}
