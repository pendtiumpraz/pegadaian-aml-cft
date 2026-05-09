<?php

namespace App\Http\Controllers;

use App\Models\WatchlistEntry;
use App\Models\WatchlistHit;
use App\Models\WatchlistSource;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WatchlistController extends Controller
{
    public function index()
    {
        $sources = WatchlistSource::withCount('entries', 'hits')->get();

        return Inertia::render('Watchlist/Index', [
            'sources' => $sources,
        ]);
    }

    public function entries(Request $request)
    {
        $query = WatchlistEntry::with('source');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        $entries = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Watchlist/Entries', [
            'entries' => $entries,
            'filters' => $request->only('search'),
        ]);
    }

    public function showEntry($id)
    {
        $entry = WatchlistEntry::with('source', 'hits.customer')->findOrFail($id);

        return Inertia::render('Watchlist/ShowEntry', [
            'entry' => $entry,
        ]);
    }

    public function hits(Request $request)
    {
        $query = WatchlistHit::with('customer', 'entry', 'source', 'actionedBy');

        $hits = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Watchlist/Hits', [
            'hits' => $hits,
        ]);
    }

    public function reviewHit(Request $request, WatchlistHit $hit)
    {
        $data = $request->validate([
            'action' => 'required|string|in:confirm,dismiss',
            'notes'  => 'nullable|string',
        ]);

        $hit->update([
            'action'      => $data['action'],
            'notes'       => $data['notes'] ?? $hit->notes,
            'actioned_by' => auth()->id(),
            'actioned_at' => now(),
        ]);

        return redirect()->route('watchlist.hits')->with('success', 'Hit berhasil direview.');
    }
}
