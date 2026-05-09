<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'cif',
        'nik_encrypted',
        'name',
        'dob',
        'pob',
        'gender',
        'occupation',
        'income_range',
        'source_of_funds',
        'purpose',
        'address',
        'domicili_area',
        'phone',
        'email',
        'channel',
        'onboarded_at',
        'onboarded_branch',
        'pep_flag',
        'pep_tier',
        'risk_level',
        'ira_score',
        'ira_tier',
        'dukcapil_verified',
        'dukcapil_verified_at',
        'biometric_verified',
        'biometric_updated_at',
        'cdd_due_date',
        'status',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'dob'                    => 'date',
            'cdd_due_date'           => 'date',
            'pep_flag'               => 'boolean',
            'dukcapil_verified'      => 'boolean',
            'biometric_verified'     => 'boolean',
            'onboarded_at'           => 'datetime',
            'dukcapil_verified_at'   => 'datetime',
            'biometric_updated_at'   => 'datetime',
        ];
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function iraComponents()
    {
        return $this->hasMany(CustomerIraComponent::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function alerts()
    {
        return $this->hasMany(Alert::class);
    }

    public function cases()
    {
        return $this->hasMany(AmlCase::class);
    }

    public function watchlistHits()
    {
        return $this->hasMany(WatchlistHit::class);
    }

    public function eddCases()
    {
        return $this->hasMany(EddCase::class);
    }

    public function ltkmReports()
    {
        return $this->hasMany(LtkmReport::class);
    }

    public function patrolResults()
    {
        return $this->hasMany(PatrolResult::class);
    }
}
