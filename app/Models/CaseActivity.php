<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CaseActivity extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'case_id',
        'user_id',
        'type',
        'title',
        'body',
        'tone',
        'metadata_json',
    ];

    protected function casts(): array
    {
        return [
            'metadata_json' => 'array',
        ];
    }

    public function case()
    {
        return $this->belongsTo(AmlCase::class, 'case_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
