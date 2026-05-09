<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    public function create()
    {
        return Inertia::render('Onboarding/Index');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'             => 'required|string|max:255',
            'nik'              => 'required|string|max:32',
            'npwp'             => 'nullable|string|max:50',
            'dob'              => 'nullable|date',
            'pob'              => 'nullable|string|max:255',
            'gender'           => 'nullable|string|max:5',
            'occupation'       => 'nullable|string|max:255',
            'income_range'     => 'nullable|string|max:100',
            'source_of_funds'  => 'nullable|string|max:255',
            'purpose'          => 'nullable|string|max:255',
            'address'          => 'nullable|string',
            'nationality'      => 'nullable|string|max:100',
            'phone'            => 'nullable|string|max:30',
            'email'            => 'nullable|email|max:255',
            'channel'          => 'nullable|string|max:50',
            'risk_level'       => 'nullable|string|max:20',
            'pep_flag'         => 'boolean',
            'is_blacklisted'   => 'boolean',
            'edd_required'     => 'boolean',
            'ira_score'        => 'nullable|integer|min:0|max:100',
        ]);

        $cif = 'CIF-' . str_pad((string) random_int(1000000, 9999999), 7, '0', STR_PAD_LEFT);

        $riskLevelMap = [
            'low'      => 'low',
            'medium'   => 'med',
            'med'      => 'med',
            'high'     => 'high',
            'critical' => 'high',
        ];

        $iraTier = ($data['ira_score'] ?? 0) >= 70
            ? 'tinggi'
            : (($data['ira_score'] ?? 0) >= 40 ? 'menengah' : 'rendah');

        $customer = Customer::create([
            'cif'             => $cif,
            'nik_encrypted'   => $data['nik'],
            'name'            => $data['name'],
            'dob'             => $data['dob'] ?? null,
            'pob'             => $data['pob'] ?? null,
            'gender'          => $data['gender'] ?? null,
            'occupation'      => $data['occupation'] ?? null,
            'income_range'    => $data['income_range'] ?? null,
            'source_of_funds' => $data['source_of_funds'] ?? null,
            'purpose'         => $data['purpose'] ?? null,
            'address'         => $data['address'] ?? null,
            'phone'           => $data['phone'] ?? null,
            'email'           => $data['email'] ?? null,
            'channel'         => in_array($data['channel'] ?? null, ['outlet', 'digital', 'both']) ? $data['channel'] : 'outlet',
            'onboarded_at'    => Carbon::now(),
            'pep_flag'        => $data['pep_flag'] ?? false,
            'risk_level'      => $riskLevelMap[$data['risk_level'] ?? 'low'] ?? 'low',
            'ira_score'       => $data['ira_score'] ?? 0,
            'ira_tier'        => $iraTier,
            'status'          => 'active',
            'created_by'      => auth()->id(),
        ]);

        return redirect()
            ->route('customers.show', $customer)
            ->with('success', "Onboarding selesai · Nasabah baru {$cif} berhasil dibuat.");
    }

    public function storeStep(Request $request, $step)
    {
        // Persist partial step data into session for resume.
        $payload = $request->all();
        session(["onboarding.step.{$step}" => $payload]);

        return back()->with('success', "Step {$step} disimpan.");
    }
}
