<?php

namespace App\Http\Controllers;

use App\Models\ScreeningRule;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScreeningRuleController extends Controller
{
    public function index(Request $request)
    {
        $rules = ScreeningRule::with('createdBy')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Rules/Index', [
            'rules' => $rules,
        ]);
    }

    public function create()
    {
        return Inertia::render('Rules/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'rule_id'         => 'nullable|string|unique:screening_rules,rule_id',
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'category'        => 'nullable|string|max:100',
            'conditions_json' => 'nullable|array',
            'threshold'       => 'nullable|numeric',
            'severity'        => 'required|string|max:50',
            'is_active'       => 'boolean',
            'version'         => 'nullable|string|max:50',
        ]);

        $data['created_by'] = auth()->id();

        ScreeningRule::create($data);

        return redirect()->route('rules.index')->with('success', 'Aturan berhasil ditambahkan.');
    }

    public function edit(ScreeningRule $rule)
    {
        return Inertia::render('Rules/Edit', [
            'rule' => $rule,
        ]);
    }

    public function update(Request $request, ScreeningRule $rule)
    {
        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'category'        => 'nullable|string|max:100',
            'conditions_json' => 'nullable|array',
            'threshold'       => 'nullable|numeric',
            'severity'        => 'required|string|max:50',
            'is_active'       => 'boolean',
            'version'         => 'nullable|string|max:50',
        ]);

        $rule->update($data);

        return redirect()->route('rules.index')->with('success', 'Aturan berhasil diperbarui.');
    }

    public function toggle(Request $request, ScreeningRule $rule)
    {
        $rule->update(['is_active' => ! $rule->is_active]);

        $status = $rule->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->route('rules.index')->with('success', "Aturan berhasil {$status}.");
    }

    public function destroy(ScreeningRule $rule)
    {
        $rule->delete();

        return redirect()->route('rules.index')->with('success', 'Aturan berhasil dihapus.');
    }
}
