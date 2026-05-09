<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PatrolQuery extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'prompt',
        'formula',
        'generated_sql',
        'executed_at',
        'execution_time_ms',
        'result_count',
        'cost_estimate',
        'status',
        'user_id',
        'result_json',
    ];

    protected function casts(): array
    {
        return [
            'executed_at'       => 'datetime',
            'execution_time_ms' => 'integer',
            'result_count'      => 'integer',
            'cost_estimate'     => 'decimal:4',
            'result_json'       => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
