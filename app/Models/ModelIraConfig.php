<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ModelIraConfig extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'version',
        'algorithm',
        'auc',
        'precision_at_70',
        'recall_at_70',
        'fp_rate',
        'retrain_schedule',
        'weight_profil',
        'weight_geografi',
        'weight_produk',
        'weight_pola_tx',
        'weight_channel',
        'is_active',
        'activated_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active'    => 'boolean',
            'activated_at' => 'datetime',
        ];
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
