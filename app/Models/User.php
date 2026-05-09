<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'portal_user_id',
        'name',
        'email',
        'password',
        'avatar_initials',
        'role',
        'job_title',
        'is_active',
        'last_seen_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'is_active'     => 'boolean',
            'last_seen_at'  => 'datetime',
            'password'      => 'hashed',
        ];
    }

    public function alerts()
    {
        return $this->hasMany(Alert::class, 'assigned_to');
    }

    public function cases()
    {
        return $this->hasMany(AmlCase::class, 'analyst_id');
    }

    public function trainingCompletions()
    {
        return $this->hasMany(TrainingCompletion::class);
    }

    public function trainingCertifications()
    {
        return $this->hasMany(TrainingCertification::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function notificationPreferences()
    {
        return $this->hasMany(NotificationPreference::class);
    }
}
