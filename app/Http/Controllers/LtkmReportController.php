<?php

namespace App\Http\Controllers;

use App\Models\AmlCase;
use App\Models\Customer;
use App\Models\LtkmReport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LtkmReportController extends Controller
{
    public function index(Request $request)
    {
        $reports = LtkmReport::with('customer', 'analyst', 'approver')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Ltkm/Index', [
            'reports' => $reports,
        ]);
    }

    public function create()
    {
        $customers = Customer::select('id', 'cif', 'name')->get();
        $cases     = AmlCase::select('id', 'case_id')->get();

        return Inertia::render('Ltkm/Create', [
            'customers' => $customers,
            'cases'     => $cases,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'ltkm_id'                 => 'nullable|string|unique:ltkm_reports,ltkm_id',
            'case_id'                 => 'nullable|integer|exists:cases,id',
            'customer_id'             => 'required|integer|exists:customers,id',
            'pelapor_pjk'             => 'nullable|string|max:255',
            'pelapor_name'            => 'nullable|string|max:255',
            'terlapor_name'           => 'required|string|max:255',
            'terlapor_nik_encrypted'  => 'nullable|string',
            'terlapor_cif'            => 'nullable|string|max:100',
            'terlapor_occupation'     => 'nullable|string|max:255',
            'terlapor_address'        => 'nullable|string',
            'terlapor_phone'          => 'nullable|string|max:50',
            'narrative'               => 'required|string',
            'type'                    => 'nullable|string|max:50',
        ]);

        $data['analyst_id'] = auth()->id();
        $data['status']     = 'draft';

        LtkmReport::create($data);

        return redirect()->route('ltkm.index')->with('success', 'Laporan LTKM berhasil dibuat.');
    }

    public function show(LtkmReport $ltkm)
    {
        $ltkm->load('customer', 'case', 'analyst', 'approver', 'transactions', 'attachments');

        return Inertia::render('Ltkm/Show', [
            'ltkm' => $ltkm,
        ]);
    }

    public function update(Request $request, LtkmReport $ltkm)
    {
        $data = $request->validate([
            'pelapor_pjk'            => 'nullable|string|max:255',
            'pelapor_name'           => 'nullable|string|max:255',
            'terlapor_name'          => 'required|string|max:255',
            'terlapor_nik_encrypted' => 'nullable|string',
            'terlapor_cif'           => 'nullable|string|max:100',
            'terlapor_occupation'    => 'nullable|string|max:255',
            'terlapor_address'       => 'nullable|string',
            'terlapor_phone'         => 'nullable|string|max:50',
            'narrative'              => 'required|string',
            'type'                   => 'nullable|string|max:50',
        ]);

        $ltkm->update($data);

        return redirect()->route('ltkm.show', $ltkm)->with('success', 'Laporan LTKM berhasil diperbarui.');
    }

    public function submit(Request $request, LtkmReport $ltkm)
    {
        $ltkm->update([
            'status'      => 'submitted',
            'analyst_id'  => auth()->id(),
            'submitted_at' => now(),
        ]);

        return redirect()->route('ltkm.show', $ltkm)->with('success', 'Laporan berhasil disubmit.');
    }

    public function approve(Request $request, LtkmReport $ltkm)
    {
        if ($ltkm->analyst_id === auth()->id()) {
            return redirect()->route('ltkm.show', $ltkm)->with('error', 'Anda tidak dapat menyetujui laporan yang Anda buat sendiri (4-eyes principle).');
        }

        $ltkm->update([
            'status'      => 'approved',
            'approver_id' => auth()->id(),
        ]);

        return redirect()->route('ltkm.show', $ltkm)->with('success', 'Laporan berhasil disetujui.');
    }

    public function reject(Request $request, LtkmReport $ltkm)
    {
        $data = $request->validate([
            'rejection_reason' => 'required|string',
        ]);

        $ltkm->update([
            'status'      => 'rejected',
            'approver_id' => auth()->id(),
            'narrative'   => $ltkm->narrative . "\n\n[Ditolak]: " . $data['rejection_reason'],
        ]);

        return redirect()->route('ltkm.show', $ltkm)->with('error', 'Laporan ditolak.');
    }
}
