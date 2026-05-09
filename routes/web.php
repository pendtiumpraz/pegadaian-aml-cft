<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\CaseController;
use App\Http\Controllers\EddCaseController;
use App\Http\Controllers\WatchlistController;
use App\Http\Controllers\LtkmReportController;
use App\Http\Controllers\RegulatoryReportController;
use App\Http\Controllers\ScreeningRuleController;
use App\Http\Controllers\TrainingController;
use App\Http\Controllers\SystemSettingController;
use App\Http\Controllers\PatrolController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Auth\LoginController;

Route::get('/login',  [LoginController::class, 'showLogin'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->name('login.post');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout')->middleware('auth');

// Portal SSO callback flow
Route::get('/auth/portal/redirect', [LoginController::class, 'portalRedirect'])->name('auth.portal.redirect');
Route::get('/auth/portal/callback', [LoginController::class, 'portalCallback'])->name('auth.portal.callback');

Route::middleware('auth')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Customers — CDD/IRA
    Route::prefix('nasabah')->name('customers.')->group(function () {
        Route::get('/',                   [CustomerController::class, 'index'])->name('index');
        Route::get('/create',             [CustomerController::class, 'create'])->name('create');
        Route::post('/',                  [CustomerController::class, 'store'])->name('store');
        Route::get('/{customer}',         [CustomerController::class, 'show'])->name('show');
        Route::get('/{customer}/edit',    [CustomerController::class, 'edit'])->name('edit');
        Route::put('/{customer}',         [CustomerController::class, 'update'])->name('update');
        Route::delete('/{customer}',      [CustomerController::class, 'destroy'])->name('destroy');
        Route::get('/trash',              [CustomerController::class, 'trash'])->name('trash');
        Route::post('/{id}/restore',      [CustomerController::class, 'restore'])->name('restore');
        Route::delete('/{id}/force',      [CustomerController::class, 'forceDelete'])->name('force-delete');
    });

    // Transactions
    Route::prefix('transaksi')->name('transactions.')->group(function () {
        Route::get('/',                      [TransactionController::class, 'index'])->name('index');
        Route::get('/{transaction}',         [TransactionController::class, 'show'])->name('show');
        Route::put('/{transaction}/flag',    [TransactionController::class, 'flag'])->name('flag');
        Route::put('/{transaction}/review',  [TransactionController::class, 'review'])->name('review');
    });

    // Alerts
    Route::prefix('alerts')->name('alerts.')->group(function () {
        Route::get('/',                   [AlertController::class, 'index'])->name('index');
        Route::get('/{alert}',            [AlertController::class, 'show'])->name('show');
        Route::put('/{alert}/triage',     [AlertController::class, 'triage'])->name('triage');
        Route::put('/{alert}/assign',     [AlertController::class, 'assign'])->name('assign');
        Route::put('/{alert}/close',      [AlertController::class, 'close'])->name('close');
        Route::put('/{alert}/escalate',   [AlertController::class, 'escalate'])->name('escalate');
        Route::get('/trash',              [AlertController::class, 'trash'])->name('trash');
        Route::post('/{id}/restore',      [AlertController::class, 'restore'])->name('restore');
        Route::delete('/{id}/force',      [AlertController::class, 'forceDelete'])->name('force-delete');
    });

    // Cases
    Route::prefix('kasus')->name('cases.')->group(function () {
        Route::get('/',                  [CaseController::class, 'index'])->name('index');
        Route::get('/create',            [CaseController::class, 'create'])->name('create');
        Route::post('/',                 [CaseController::class, 'store'])->name('store');
        Route::get('/{case}',            [CaseController::class, 'show'])->name('show');
        Route::put('/{case}',            [CaseController::class, 'update'])->name('update');
        Route::delete('/{case}',         [CaseController::class, 'destroy'])->name('destroy');
        Route::get('/trash',             [CaseController::class, 'trash'])->name('trash');
        Route::post('/{id}/restore',     [CaseController::class, 'restore'])->name('restore');
        Route::delete('/{id}/force',     [CaseController::class, 'forceDelete'])->name('force-delete');
    });

    // EDD
    Route::prefix('edd')->name('edd.')->group(function () {
        Route::get('/',                  [EddCaseController::class, 'index'])->name('index');
        Route::get('/create',            [EddCaseController::class, 'create'])->name('create');
        Route::post('/',                 [EddCaseController::class, 'store'])->name('store');
        Route::get('/{edd}',             [EddCaseController::class, 'show'])->name('show');
        Route::put('/{edd}',             [EddCaseController::class, 'update'])->name('update');
        Route::delete('/{edd}',          [EddCaseController::class, 'destroy'])->name('destroy');
    });

    // Watchlist
    Route::prefix('watchlist')->name('watchlist.')->group(function () {
        Route::get('/',                     [WatchlistController::class, 'index'])->name('index');
        Route::get('/entries',              [WatchlistController::class, 'entries'])->name('entries');
        Route::get('/entries/{entry}',      [WatchlistController::class, 'showEntry'])->name('entries.show');
        Route::get('/hits',                 [WatchlistController::class, 'hits'])->name('hits');
        Route::put('/hits/{hit}/review',    [WatchlistController::class, 'reviewHit'])->name('hits.review');
    });

    // LTKM Reports (4-eyes approval)
    Route::prefix('ltkm')->name('ltkm.')->group(function () {
        Route::get('/',                  [LtkmReportController::class, 'index'])->name('index');
        Route::get('/create',            [LtkmReportController::class, 'create'])->name('create');
        Route::post('/',                 [LtkmReportController::class, 'store'])->name('store');
        Route::get('/{ltkm}',            [LtkmReportController::class, 'show'])->name('show');
        Route::put('/{ltkm}',            [LtkmReportController::class, 'update'])->name('update');
        Route::post('/{ltkm}/submit',    [LtkmReportController::class, 'submit'])->name('submit');
        Route::post('/{ltkm}/approve',   [LtkmReportController::class, 'approve'])->name('approve');
        Route::post('/{ltkm}/reject',    [LtkmReportController::class, 'reject'])->name('reject');
    });

    // Regulatory Reports (LTKT)
    Route::prefix('laporan')->name('reports.')->group(function () {
        Route::get('/',              [RegulatoryReportController::class, 'index'])->name('index');
        Route::get('/{report}',      [RegulatoryReportController::class, 'show'])->name('show');
        Route::post('/{report}/send', [RegulatoryReportController::class, 'send'])->name('send');
    });

    // Screening Rules
    Route::prefix('aturan')->name('rules.')->group(function () {
        Route::get('/',               [ScreeningRuleController::class, 'index'])->name('index');
        Route::get('/create',         [ScreeningRuleController::class, 'create'])->name('create');
        Route::post('/',              [ScreeningRuleController::class, 'store'])->name('store');
        Route::get('/{rule}/edit',    [ScreeningRuleController::class, 'edit'])->name('edit');
        Route::put('/{rule}',         [ScreeningRuleController::class, 'update'])->name('update');
        Route::put('/{rule}/toggle',  [ScreeningRuleController::class, 'toggle'])->name('toggle');
        Route::delete('/{rule}',      [ScreeningRuleController::class, 'destroy'])->name('destroy');
    });

    // Training
    Route::prefix('pelatihan')->name('training.')->group(function () {
        Route::get('/',                [TrainingController::class, 'index'])->name('index');
        Route::get('/create',          [TrainingController::class, 'create'])->name('create');
        Route::post('/',               [TrainingController::class, 'store'])->name('store');
        Route::get('/{module}',        [TrainingController::class, 'show'])->name('show');
        Route::put('/{module}',        [TrainingController::class, 'update'])->name('update');
        Route::delete('/{module}',     [TrainingController::class, 'destroy'])->name('destroy');
    });

    // Settings
    Route::prefix('pengaturan')->name('settings.')->group(function () {
        Route::get('/',      [SystemSettingController::class, 'index'])->name('index');
        Route::put('/{key}', [SystemSettingController::class, 'update'])->name('update');
    });

    // AI Patrol — natural language → SQL
    Route::prefix('patrol')->name('patrol.')->group(function () {
        Route::get('/',                  [PatrolController::class, 'index'])->name('index');
        Route::get('/create',            [PatrolController::class, 'create'])->name('create');
        Route::post('/',                 [PatrolController::class, 'store'])->name('store');
        Route::get('/{patrol}',          [PatrolController::class, 'show'])->name('show');
        Route::post('/{patrol}/execute', [PatrolController::class, 'execute'])->name('execute');
    });

    // Onboarding — standalone CDD wizard
    Route::prefix('onboarding')->name('onboarding.')->group(function () {
        Route::get('/',       [OnboardingController::class, 'create'])->name('create');
        Route::post('/',      [OnboardingController::class, 'store'])->name('store');
        Route::post('/{step}',[OnboardingController::class, 'storeStep'])->name('store-step');
    });

    // Notifications
    Route::get('/notifikasi', [NotificationController::class, 'index'])->name('notifications.index');
});
