<?php

namespace App\Http\Controllers;

use App\Models\AmlCase;
use App\Models\Customer;
use App\Models\EddCase;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EddCaseController extends Controller
{
    public function index(Request $request)
    {
        $eddCases = EddCase::with('customer', 'analyst', 'approver')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Edd/Index', [
            'edd_cases' => $eddCases,
        ]);
    }

    public function create()
    {
        $customers = Customer::select('id', 'cif', 'name')->get();
        $cases     = AmlCase::select('id', 'case_id')->get();

        return Inertia::render('Edd/Create', [
            'customers' => $customers,
            'cases'     => $cases,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'edd_id'           => 'nullable|string|unique:edd_cases,edd_id',
            'customer_id'      => 'required|integer|exists:customers,id',
            'case_id'          => 'nullable|integer|exists:cases,id',
            'trigger_reason'   => 'required|string',
            'risk_score'       => 'nullable|numeric',
            'stage'            => 'nullable|string|max:50',
            'status'           => 'nullable|string|max:50',
            'analyst_id'       => 'nullable|integer|exists:users,id',
            'approver_id'      => 'nullable|integer|exists:users,id',
            'sla_due_at'       => 'nullable|date',
        ]);

        EddCase::create($data);

        return redirect()->route('edd.index')->with('success', 'EDD berhasil dibuat.');
    }

    public function show(EddCase $edd)
    {
        $edd->load('customer', 'case', 'analyst', 'approver', 'questionnaireAnswers', 'documents');

        return Inertia::render('Edd/Show', [
            'edd' => $edd,
        ]);
    }

    public function update(Request $request, EddCase $edd)
    {
        $data = $request->validate([
            'trigger_reason'    => 'nullable|string',
            'risk_score'        => 'nullable|numeric',
            'stage'             => 'nullable|string|max:50',
            'status'            => 'nullable|string|max:50',
            'analyst_id'        => 'nullable|integer|exists:users,id',
            'approver_id'       => 'nullable|integer|exists:users,id',
            'sla_due_at'        => 'nullable|date',
            'approval_decision' => 'nullable|string|max:50',
            'rejection_reason'  => 'nullable|string',
        ]);

        $edd->update($data);

        return redirect()->route('edd.show', $edd)->with('success', 'EDD berhasil diperbarui.');
    }

    public function destroy(EddCase $edd)
    {
        $edd->delete();

        return redirect()->route('edd.index')->with('success', 'EDD berhasil dihapus.');
    }
}
