<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrainingCertification extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'certification',
        'issued_at',
        'expires_at',
        'days_remaining',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'issued_at'  => 'date',
            'expires_at' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
