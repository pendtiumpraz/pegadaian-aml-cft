<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrainingCompletion extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'module_id',
        'user_id',
        'completed_at',
        'score',
        'certificate_path',
    ];

    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
        ];
    }

    public function module()
    {
        return $this->belongsTo(TrainingModule::class, 'module_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
