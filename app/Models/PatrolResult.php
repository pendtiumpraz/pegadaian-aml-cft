<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PatrolResult extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'execution_id',
        'customer_id',
        'txn_date',
        'gadai_amount',
        'tebus_amount',
        'outlet_count',
        'ira_score',
        'is_promoted',
        'promoted_to_alert_id',
        'promoted_by',
    ];

    protected function casts(): array
    {
        return [
            'txn_date'    => 'date',
            'is_promoted' => 'boolean',
        ];
    }

    public function execution()
    {
        return $this->belongsTo(PatrolExecution::class, 'execution_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function promotedBy()
    {
        return $this->belongsTo(User::class, 'promoted_by');
    }
}
