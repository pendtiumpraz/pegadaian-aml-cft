<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use App\Models\LtkmReport;
use App\Models\Transaction;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Dashboard/Index', [
            'total_alerts'   => Alert::where('status', '!=', 'selesai')->count(),
            'high_alerts'    => Alert::where('severity', 'high')->where('status', '!=', 'selesai')->count(),
            'pending_ltkm'   => LtkmReport::where('status', 'draft')->count(),
            'flagged_today'  => Transaction::where('flagged', true)->whereDate('created_at', today())->count(),
        ]);
    }
}
