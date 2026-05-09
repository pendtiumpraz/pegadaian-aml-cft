<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AlertController extends Controller
{
    public function index(Request $request)
    {
        $query = Alert::with('customer', 'assignedTo');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('severity')) {
            $query->where('severity', $request->severity);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        $alerts = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Alerts/Index', [
            'alerts'  => $alerts,
            'filters' => $request->only(['status', 'severity', 'assigned_to']),
        ]);
    }

    public function show(Alert $alert)
    {
        $alert->load('customer', 'assignedTo', 'closedBy');

        $transaction = $alert->txn_id
            ? \App\Models\Transaction::where('txn_id', $alert->txn_id)->first()
            : null;

        $case = $alert->cases()->first();

        return Inertia::render('Alerts/Show', [
            'alert'       => $alert,
            'transaction' => $transaction,
            'case'        => $case,
        ]);
    }

    public function triage(Request $request, Alert $alert)
    {
        $alert->update(['status' => 'triage']);

        return redirect()->route('alerts.show', $alert)->with('success', 'Alert dipindahkan ke triage.');
    }

    public function assign(Request $request, Alert $alert)
    {
        $data = $request->validate([
            'assigned_to' => 'required|integer|exists:users,id',
        ]);

        $alert->update([
            'assigned_to' => $data['assigned_to'],
            'assigned_at' => now(),
        ]);

        return redirect()->route('alerts.show', $alert)->with('success', 'Alert berhasil di-assign.');
    }

    public function close(Request $request, Alert $alert)
    {
        $data = $request->validate([
            'close_reason' => 'required|string',
        ]);

        $alert->update([
            'status'       => 'selesai',
            'close_reason' => $data['close_reason'],
            'closed_at'    => now(),
            'closed_by'    => auth()->id(),
        ]);

        return redirect()->route('alerts.show', $alert)->with('success', 'Alert berhasil ditutup.');
    }

    public function escalate(Request $request, Alert $alert)
    {
        $alert->update(['status' => 'eskalasi']);

        return redirect()->route('alerts.show', $alert)->with('success', 'Alert berhasil dieskalasi.');
    }

    public function trash()
    {
        $alerts = Alert::onlyTrashed()->latest()->paginate(20);

        return Inertia::render('Alerts/Trash', [
            'alerts' => $alerts,
        ]);
    }

    public function restore($id)
    {
        $alert = Alert::withTrashed()->findOrFail($id);
        $alert->restore();

        return redirect()->route('alerts.trash')->with('success', 'Alert berhasil dipulihkan.');
    }

    public function forceDelete($id)
    {
        $alert = Alert::withTrashed()->findOrFail($id);
        $alert->forceDelete();

        return redirect()->route('alerts.trash')->with('success', 'Alert berhasil dihapus permanen.');
    }
}
