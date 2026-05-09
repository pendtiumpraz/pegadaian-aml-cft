<?php

namespace App\Http\Controllers;

use App\Models\TrainingModule;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrainingController extends Controller
{
    public function index(Request $request)
    {
        $modules = TrainingModule::latest()->paginate(20)->withQueryString();

        return Inertia::render('Training/Index', [
            'modules' => $modules,
        ]);
    }

    public function create()
    {
        return Inertia::render('Training/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'              => 'required|string|max:255',
            'description'       => 'nullable|string',
            'audience'          => 'nullable|string|max:255',
            'duration_minutes'  => 'nullable|integer|min:1',
            'status_type'       => 'nullable|string|max:50',
            'completion_pct'    => 'nullable|numeric|min:0|max:100',
            'is_active'         => 'boolean',
        ]);

        TrainingModule::create($data);

        return redirect()->route('training.index')->with('success', 'Modul pelatihan berhasil ditambahkan.');
    }

    public function show(TrainingModule $module)
    {
        $module->load('completions');

        return Inertia::render('Training/Show', [
            'module' => $module,
        ]);
    }

    public function update(Request $request, TrainingModule $module)
    {
        $data = $request->validate([
            'name'             => 'required|string|max:255',
            'description'      => 'nullable|string',
            'audience'         => 'nullable|string|max:255',
            'duration_minutes' => 'nullable|integer|min:1',
            'status_type'      => 'nullable|string|max:50',
            'completion_pct'   => 'nullable|numeric|min:0|max:100',
            'is_active'        => 'boolean',
        ]);

        $module->update($data);

        return redirect()->route('training.show', $module)->with('success', 'Modul pelatihan berhasil diperbarui.');
    }

    public function destroy(TrainingModule $module)
    {
        $module->delete();

        return redirect()->route('training.index')->with('success', 'Modul pelatihan berhasil dihapus.');
    }
}
