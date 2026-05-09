<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IntegrationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'integration',
        'operation',
        'request_json',
        'response_json',
        'status',
        'duration_ms',
        'error_msg',
    ];

    protected function casts(): array
    {
        return [
            'request_json'  => 'array',
            'response_json' => 'array',
        ];
    }
}
