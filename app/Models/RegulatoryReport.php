<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RegulatoryReport extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'report_id',
        'type',
        'recipient',
        'period_start',
        'period_end',
        'item_count',
        'pct_complete',
        'status',
        'xml_payload',
        'file_path',
        'submitted_at',
        'due_date',
        'ppatk_receipt',
        'submission_note',
        'submitted_by',
    ];

    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end'   => 'date',
            'due_date'     => 'date',
            'submitted_at' => 'datetime',
        ];
    }

    public function submittedBy()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
}
