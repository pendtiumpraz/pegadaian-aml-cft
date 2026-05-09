<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LtkmReport extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ltkm_id',
        'case_id',
        'customer_id',
        'analyst_id',
        'approver_id',
        'status',
        'pelapor_pjk',
        'pelapor_name',
        'terlapor_name',
        'terlapor_nik_encrypted',
        'terlapor_cif',
        'terlapor_occupation',
        'terlapor_address',
        'terlapor_phone',
        'narrative',
        'submitted_at',
        'ppatk_receipt',
        'type',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
        ];
    }

    public function case()
    {
        return $this->belongsTo(AmlCase::class, 'case_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function analyst()
    {
        return $this->belongsTo(User::class, 'analyst_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function transactions()
    {
        return $this->hasMany(LtkmTransaction::class, 'ltkm_id');
    }

    public function attachments()
    {
        return $this->hasMany(LtkmAttachment::class, 'ltkm_id');
    }
}
