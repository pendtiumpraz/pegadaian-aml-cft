<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            [
                'key'         => 'ltkt_threshold',
                'value'       => '100000000',
                'type'        => 'integer',
                'group'       => 'aml',
                'description' => 'Batas nilai LTKT (Rp)',
            ],
            [
                'key'         => 'ltkm_threshold',
                'value'       => '500000000',
                'type'        => 'integer',
                'group'       => 'aml',
                'description' => 'Batas nilai LTKM (Rp)',
            ],
            [
                'key'         => 'ppatk_sftp_host',
                'value'       => '',
                'type'        => 'string',
                'group'       => 'integration',
                'description' => 'SFTP host PPATK goAML',
            ],
            [
                'key'         => 'ira_high_threshold',
                'value'       => '70',
                'type'        => 'integer',
                'group'       => 'ira',
                'description' => 'Skor IRA kategori tinggi (≥ nilai ini)',
            ],
            [
                'key'         => 'ira_med_threshold',
                'value'       => '40',
                'type'        => 'integer',
                'group'       => 'ira',
                'description' => 'Skor IRA kategori sedang (≥ nilai ini)',
            ],
            [
                'key'         => 'sla_hours_high',
                'value'       => '24',
                'type'        => 'integer',
                'group'       => 'sla',
                'description' => 'SLA jam untuk alert risiko tinggi',
            ],
            [
                'key'         => 'sla_hours_med',
                'value'       => '72',
                'type'        => 'integer',
                'group'       => 'sla',
                'description' => 'SLA jam untuk alert risiko sedang',
            ],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
