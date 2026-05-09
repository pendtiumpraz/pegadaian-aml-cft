<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DataSourceTable extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'data_source_id',
        'schema_name',
        'table_name',
        'row_count',
        'column_count',
        'sample_columns',
        'pii_column_count',
        'is_used_in_patrol',
    ];

    protected function casts(): array
    {
        return [
            'sample_columns'    => 'array',
            'is_used_in_patrol' => 'boolean',
        ];
    }

    public function dataSource()
    {
        return $this->belongsTo(DataSource::class);
    }
}
