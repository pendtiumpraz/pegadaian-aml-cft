<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\NotificationPreference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth()->id();

        $notifications = Schema::hasTable('notifications')
            ? Notification::query()
                ->when($userId, fn ($q) => $q->where('user_id', $userId))
                ->latest('created_at')
                ->limit(100)
                ->get()
                ->map(fn ($n) => [
                    'id'         => $n->id,
                    'type'       => $n->type,
                    'title'      => $n->title,
                    'body'       => $n->body,
                    'tone'       => $n->tone,
                    'is_read'    => (bool) $n->is_read,
                    'read_at'    => optional($n->read_at)->toIso8601String(),
                    'action_url' => $n->action_url,
                    'created_at' => optional($n->created_at)->toIso8601String(),
                ])
                ->values()
                ->all()
            : [];

        $preferences = Schema::hasTable('notification_preferences') && $userId
            ? NotificationPreference::query()
                ->where('user_id', $userId)
                ->get()
                ->map(fn ($p) => [
                    'id'                => $p->id,
                    'notification_name' => $p->notification_name,
                    'frequency'         => $p->frequency,
                    'channel_inapp'     => (bool) $p->channel_inapp,
                    'channel_email'     => (bool) $p->channel_email,
                    'channel_teams'     => (bool) $p->channel_teams,
                    'channel_sms'       => (bool) $p->channel_sms,
                    'is_enabled'        => (bool) $p->is_enabled,
                ])
                ->values()
                ->all()
            : [];

        return Inertia::render('Notifikasi/Index', [
            'notifications' => $notifications,
            'preferences'   => $preferences,
        ]);
    }
}
