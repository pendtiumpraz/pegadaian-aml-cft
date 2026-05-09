<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AiPatrolRule extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'rule_id',
        'name',
        'prompt_text',
        'generated_sql',
        'generated_formula',
        'step',
        'status',
        'category',
        'promoted_to_rule_id',
        'created_by',
    ];

    protected function casts(): array
    {
        return [];
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function executions()
    {
        return $this->hasMany(PatrolExecution::class, 'patrol_rule_id');
    }
}
