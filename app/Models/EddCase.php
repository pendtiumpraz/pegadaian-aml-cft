<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EddCase extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'edd_id',
        'customer_id',
        'case_id',
        'trigger_reason',
        'risk_score',
        'stage',
        'status',
        'analyst_id',
        'approver_id',
        'sla_due_at',
        'completed_at',
        'approval_decision',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'sla_due_at'   => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function case()
    {
        return $this->belongsTo(AmlCase::class, 'case_id');
    }

    public function analyst()
    {
        return $this->belongsTo(User::class, 'analyst_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function questionnaireAnswers()
    {
        return $this->hasMany(EddQuestionnaireAnswer::class, 'edd_case_id');
    }

    public function documents()
    {
        return $this->hasMany(EddDocument::class, 'edd_case_id');
    }
}
