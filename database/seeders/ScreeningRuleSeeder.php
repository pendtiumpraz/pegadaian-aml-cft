<?php

namespace Database\Seeders;

use App\Models\ScreeningRule;
use Illuminate\Database\Seeder;

class ScreeningRuleSeeder extends Seeder
{
    public function run(): void
    {
        $rules = [
            [
                'rule_id'        => 'RULE-001',
                'name'           => 'LTKT Harian ≥ 100jt',
                'category'       => 'LTKT',
                'threshold'      => '100000000',
                'is_active'      => true,
                'conditions_json' => ['operator' => 'gte', 'field' => 'amount', 'value' => 100000000],
            ],
            [
                'rule_id'        => 'RULE-002',
                'name'           => 'Transaksi Tunai ≥ 500jt',
                'category'       => 'LTKT',
                'threshold'      => '500000000',
                'is_active'      => true,
                'conditions_json' => ['operator' => 'gte', 'field' => 'amount', 'value' => 500000000],
            ],
            [
                'rule_id'        => 'RULE-003',
                'name'           => 'Structuring Pattern',
                'category'       => 'Anomaly',
                'threshold'      => null,
                'is_active'      => true,
                'conditions_json' => ['pattern' => 'multiple_below_threshold', 'window_days' => 3, 'count' => 3, 'total' => 300000000],
            ],
            [
                'rule_id'        => 'RULE-004',
                'name'           => 'Watchlist Hit',
                'category'       => 'Sanctions',
                'threshold'      => null,
                'is_active'      => true,
                'conditions_json' => ['match_fields' => ['nama', 'nik', 'ktp']],
            ],
            [
                'rule_id'        => 'RULE-005',
                'name'           => 'Gadai Emas Berulang',
                'category'       => 'Anomaly',
                'threshold'      => null,
                'is_active'      => true,
                'conditions_json' => ['type' => 'gadai_emas', 'count' => 5, 'window_days' => 30],
            ],
        ];

        foreach ($rules as $rule) {
            ScreeningRule::updateOrCreate(
                ['rule_id' => $rule['rule_id']],
                $rule
            );
        }
    }
}
