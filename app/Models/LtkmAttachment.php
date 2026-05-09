<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LtkmAttachment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ltkm_id',
        'name',
        'file_path',
        'upload_status',
        'uploaded_by',
    ];

    protected function casts(): array
    {
        return [];
    }

    public function ltkmReport()
    {
        return $this->belongsTo(LtkmReport::class, 'ltkm_id');
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
