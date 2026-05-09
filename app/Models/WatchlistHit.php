<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WatchlistHit extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'watchlist_entry_id',
        'source_id',
        'confidence',
        'match_type',
        'action',
        'actioned_by',
        'actioned_at',
        'notes',
        'alert_id',
    ];

    protected function casts(): array
    {
        return [
            'actioned_at' => 'datetime',
        ];
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function entry()
    {
        return $this->belongsTo(WatchlistEntry::class, 'watchlist_entry_id');
    }

    public function source()
    {
        return $this->belongsTo(WatchlistSource::class, 'source_id');
    }

    public function actionedBy()
    {
        return $this->belongsTo(User::class, 'actioned_by');
    }

    public function alert()
    {
        return $this->belongsTo(Alert::class, 'alert_id', 'alert_id');
    }
}
