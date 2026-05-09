<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EddQuestionnaireAnswer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'edd_case_id',
        'question',
        'answer',
        'status',
    ];

    protected function casts(): array
    {
        return [];
    }

    public function eddCase()
    {
        return $this->belongsTo(EddCase::class, 'edd_case_id');
    }
}
