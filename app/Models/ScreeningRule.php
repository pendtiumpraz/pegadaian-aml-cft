<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ScreeningRule extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'rule_id',
        'name',
        'description',
        'category',
        'conditions_json',
        'threshold',
        'severity',
        'is_active',
        'version',
        'hit_count_30d',
        'fp_rate',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'conditions_json' => 'array',
            'is_active'       => 'boolean',
        ];
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
