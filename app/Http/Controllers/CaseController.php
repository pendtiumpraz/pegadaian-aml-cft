<?php

namespace App\Http\Controllers;

use App\Models\AmlCase;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CaseController extends Controller
{
    public function index(Request $request)
    {
        $cases = AmlCase::with('customer', 'analyst', 'approver')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Cases/Index', [
            'cases' => $cases,
        ]);
    }

    public function create()
    {
        $customers = Customer::select('id', 'cif', 'name')->get();

        return Inertia::render('Cases/Create', [
            'customers' => $customers,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'case_id'     => 'nullable|string|unique:cases,case_id',
            'alert_id'    => 'nullable|string',
            'customer_id' => 'required|integer|exists:customers,id',
            'analyst_id'  => 'nullable|integer|exists:users,id',
            'state'       => 'nullable|string|max:50',
            'decision'    => 'nullable|string|max:50',
            'narrative'   => 'nullable|string',
            'sla_due_at'  => 'nullable|date',
        ]);

        AmlCase::create($data);

        return redirect()->route('cases.index')->with('success', 'Kasus berhasil dibuat.');
    }

    public function show(AmlCase $case)
    {
        $case->load('customer', 'analyst', 'approver', 'escalatedBy', 'alert', 'activities', 'documents');

        return Inertia::render('Cases/Show', [
            'case' => $case,
        ]);
    }

    public function update(Request $request, AmlCase $case)
    {
        $data = $request->validate([
            'analyst_id'  => 'nullable|integer|exists:users,id',
            'approver_id' => 'nullable|integer|exists:users,id',
            'state'       => 'nullable|string|max:50',
            'decision'    => 'nullable|string|max:50',
            'narrative'   => 'nullable|string',
            'sla_due_at'  => 'nullable|date',
        ]);

        $case->update($data);

        return redirect()->route('cases.show', $case)->with('success', 'Kasus berhasil diperbarui.');
    }

    public function destroy(AmlCase $case)
    {
        $case->delete();

        return redirect()->route('cases.index')->with('success', 'Kasus dipindahkan ke tempat sampah.');
    }

    public function trash()
    {
        $cases = AmlCase::onlyTrashed()->latest()->paginate(20);

        return Inertia::render('Cases/Trash', [
            'cases' => $cases,
        ]);
    }

    public function restore($id)
    {
        $case = AmlCase::withTrashed()->findOrFail($id);
        $case->restore();

        return redirect()->route('cases.trash')->with('success', 'Kasus berhasil dipulihkan.');
    }

    public function forceDelete($id)
    {
        $case = AmlCase::withTrashed()->findOrFail($id);
        $case->forceDelete();

        return redirect()->route('cases.trash')->with('success', 'Kasus berhasil dihapus permanen.');
    }
}
