<?php

namespace App\Http\Controllers;

use App\Models\RegulatoryReport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RegulatoryReportController extends Controller
{
    public function index(Request $request)
    {
        $reports = RegulatoryReport::with('submittedBy')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Laporan/Index', [
            'reports' => $reports,
        ]);
    }

    public function show(RegulatoryReport $report)
    {
        $report->load('submittedBy');

        return Inertia::render('Laporan/Show', [
            'report' => $report,
        ]);
    }

    public function send(Request $request, RegulatoryReport $report)
    {
        $report->update([
            'status'          => 'sent',
            'submitted_at'    => now(),
            'submitted_by'    => auth()->id(),
        ]);

        return redirect()->route('reports.show', $report)->with('success', 'Laporan berhasil dikirim ke PPATK.');
    }
}
