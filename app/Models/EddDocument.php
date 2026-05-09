<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EddDocument extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'edd_case_id',
        'name',
        'file_path',
        'status',
        'uploaded_by',
    ];

    protected function casts(): array
    {
        return [];
    }

    public function eddCase()
    {
        return $this->belongsTo(EddCase::class, 'edd_case_id');
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
