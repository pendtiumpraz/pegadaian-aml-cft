<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OnboardingApplication extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'application_id',
        'nik_encrypted',
        'name',
        'dob',
        'pob',
        'occupation',
        'income_range',
        'source_of_funds',
        'purpose',
        'channel',
        'outlet_id',
        'stage',
        'screening_result',
        'dukcapil_verified',
        'biometric_verified',
        'ira_score',
        'risk_level',
        'status',
        'processed_by',
        'customer_id',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'dob'                => 'date',
            'dukcapil_verified'  => 'boolean',
            'biometric_verified' => 'boolean',
            'screening_result'   => 'array',
        ];
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
