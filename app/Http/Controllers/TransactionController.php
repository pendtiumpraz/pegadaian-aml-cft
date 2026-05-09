<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with('customer', 'outlet');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('channel')) {
            $query->where('channel', $request->channel);
        }

        if ($request->filled('flagged')) {
            $query->where('flagged', filter_var($request->flagged, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('txn_time', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('txn_time', '<=', $request->date_to);
        }

        $transactions = $query->latest('txn_time')->paginate(20)->withQueryString();

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'filters'      => $request->only(['type', 'channel', 'flagged', 'date_from', 'date_to']),
        ]);
    }

    public function show(Transaction $transaction)
    {
        $transaction->load('customer', 'outlet', 'reviewedBy');

        $alerts = \App\Models\Alert::where('txn_id', $transaction->txn_id)->get();

        return Inertia::render('Transactions/Show', [
            'transaction' => $transaction,
            'alerts'      => $alerts,
        ]);
    }

    public function flag(Request $request, Transaction $transaction)
    {
        $data = $request->validate([
            'flag_tone' => 'required|string|max:100',
            'notes'     => 'nullable|string',
        ]);

        $transaction->update([
            'flagged'   => true,
            'flag_tone' => $data['flag_tone'],
            'notes'     => $data['notes'] ?? $transaction->notes,
        ]);

        return redirect()->route('transactions.show', $transaction)->with('success', 'Transaksi berhasil diflag.');
    }

    public function review(Request $request, Transaction $transaction)
    {
        $transaction->update([
            'reviewed'    => true,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return redirect()->route('transactions.show', $transaction)->with('success', 'Transaksi berhasil direview.');
    }
}
