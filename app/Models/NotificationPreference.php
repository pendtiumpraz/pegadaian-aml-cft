<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class NotificationPreference extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'notification_name',
        'frequency',
        'channel_inapp',
        'channel_email',
        'channel_teams',
        'channel_sms',
        'is_enabled',
    ];

    protected function casts(): array
    {
        return [
            'channel_inapp' => 'boolean',
            'channel_email' => 'boolean',
            'channel_teams' => 'boolean',
            'channel_sms'   => 'boolean',
            'is_enabled'    => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
