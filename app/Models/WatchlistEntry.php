<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WatchlistEntry extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'source_id',
        'name',
        'aliases_json',
        'dob',
        'nationality',
        'id_numbers_json',
        'address',
        'type',
        'metadata_json',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'dob'             => 'date',
            'aliases_json'    => 'array',
            'id_numbers_json' => 'array',
            'metadata_json'   => 'array',
            'is_active'       => 'boolean',
        ];
    }

    public function source()
    {
        return $this->belongsTo(WatchlistSource::class, 'source_id');
    }

    public function hits()
    {
        return $this->hasMany(WatchlistHit::class, 'watchlist_entry_id');
    }
}
