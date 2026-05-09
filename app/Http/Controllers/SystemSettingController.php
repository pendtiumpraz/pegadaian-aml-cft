<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemSettingController extends Controller
{
    public function index()
    {
        $settings = SystemSetting::all()->groupBy('group');

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request, $key)
    {
        $data = $request->validate([
            'value' => 'present',
        ]);

        $setting = SystemSetting::where('key', $key)->firstOrFail();
        $setting->update(['value' => $data['value']]);

        return redirect()->route('settings.index')->with('success', 'Pengaturan berhasil disimpan.');
    }
}
