<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('cif', 'like', "%{$search}%")
                  ->orWhere('nik_encrypted', 'like', "%{$search}%");
            });
        }

        $customers = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'filters'   => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Customers/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'cif'              => 'required|string|unique:customers,cif',
            'nik_encrypted'    => 'nullable|string',
            'name'             => 'required|string|max:255',
            'dob'              => 'nullable|date',
            'pob'              => 'nullable|string|max:255',
            'gender'           => 'nullable|string|max:20',
            'occupation'       => 'nullable|string|max:255',
            'income_range'     => 'nullable|string|max:100',
            'source_of_funds'  => 'nullable|string|max:255',
            'purpose'          => 'nullable|string|max:255',
            'address'          => 'nullable|string',
            'domicili_area'    => 'nullable|string|max:255',
            'phone'            => 'nullable|string|max:50',
            'email'            => 'nullable|email|max:255',
            'channel'          => 'nullable|string|max:100',
            'onboarded_at'     => 'nullable|date',
            'onboarded_branch' => 'nullable|string|max:255',
            'pep_flag'         => 'boolean',
            'pep_tier'         => 'nullable|string|max:50',
            'risk_level'       => 'nullable|string|max:50',
            'status'           => 'nullable|string|max:50',
        ]);

        $data['created_by'] = auth()->id();

        Customer::create($data);

        return redirect()->route('customers.index')->with('success', 'Nasabah berhasil ditambahkan.');
    }

    public function show(Customer $customer)
    {
        $customer->load('createdBy', 'iraComponents');

        $recentTransactions = $customer->transactions()->latest('txn_time')->limit(10)->get();
        $recentAlerts       = $customer->alerts()->latest()->limit(10)->get();

        return Inertia::render('Customers/Show', [
            'customer'            => $customer,
            'recent_transactions' => $recentTransactions,
            'recent_alerts'       => $recentAlerts,
        ]);
    }

    public function edit(Customer $customer)
    {
        return Inertia::render('Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        $data = $request->validate([
            'cif'              => 'required|string|unique:customers,cif,' . $customer->id,
            'nik_encrypted'    => 'nullable|string',
            'name'             => 'required|string|max:255',
            'dob'              => 'nullable|date',
            'pob'              => 'nullable|string|max:255',
            'gender'           => 'nullable|string|max:20',
            'occupation'       => 'nullable|string|max:255',
            'income_range'     => 'nullable|string|max:100',
            'source_of_funds'  => 'nullable|string|max:255',
            'purpose'          => 'nullable|string|max:255',
            'address'          => 'nullable|string',
            'domicili_area'    => 'nullable|string|max:255',
            'phone'            => 'nullable|string|max:50',
            'email'            => 'nullable|email|max:255',
            'channel'          => 'nullable|string|max:100',
            'onboarded_at'     => 'nullable|date',
            'onboarded_branch' => 'nullable|string|max:255',
            'pep_flag'         => 'boolean',
            'pep_tier'         => 'nullable|string|max:50',
            'risk_level'       => 'nullable|string|max:50',
            'status'           => 'nullable|string|max:50',
        ]);

        $customer->update($data);

        return redirect()->route('customers.show', $customer)->with('success', 'Nasabah berhasil diperbarui.');
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();

        return redirect()->route('customers.index')->with('success', 'Nasabah dipindahkan ke tempat sampah.');
    }

    public function trash()
    {
        $customers = Customer::onlyTrashed()->latest()->paginate(20);

        return Inertia::render('Customers/Trash', [
            'customers' => $customers,
        ]);
    }

    public function restore($id)
    {
        $customer = Customer::withTrashed()->findOrFail($id);
        $customer->restore();

        return redirect()->route('customers.trash')->with('success', 'Nasabah berhasil dipulihkan.');
    }

    public function forceDelete($id)
    {
        $customer = Customer::withTrashed()->findOrFail($id);
        $customer->forceDelete();

        return redirect()->route('customers.trash')->with('success', 'Nasabah berhasil dihapus permanen.');
    }
}
