<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerIraComponent extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'scored_at',
        'total_score',
        'profil_score',
        'geografi_score',
        'produk_score',
        'pola_tx_score',
        'channel_score',
        'prev_score',
        'delta_score',
        'triggered_rescore',
        'rescore_reason',
        'scored_by',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'scored_at'         => 'datetime',
            'triggered_rescore' => 'boolean',
        ];
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
