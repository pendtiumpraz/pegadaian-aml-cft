<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AmlCase extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'cases';

    protected $fillable = [
        'case_id',
        'alert_id',
        'customer_id',
        'analyst_id',
        'approver_id',
        'state',
        'decision',
        'narrative',
        'sla_due_at',
        'escalated_at',
        'escalated_by',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'sla_due_at'   => 'datetime',
            'escalated_at' => 'datetime',
            'closed_at'    => 'datetime',
        ];
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

    public function escalatedBy()
    {
        return $this->belongsTo(User::class, 'escalated_by');
    }

    public function alert()
    {
        return $this->belongsTo(Alert::class, 'alert_id', 'alert_id');
    }

    public function activities()
    {
        return $this->hasMany(CaseActivity::class, 'case_id');
    }

    public function documents()
    {
        return $this->hasMany(CaseDocument::class, 'case_id');
    }

    public function eddCases()
    {
        return $this->hasMany(EddCase::class, 'case_id');
    }

    public function ltkmReports()
    {
        return $this->hasMany(LtkmReport::class, 'case_id');
    }
}
