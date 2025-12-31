import { Bell, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react';

interface Notification {
    id: number;
    type: 'success' | 'warning' | 'info';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    { id: 1, type: 'success', title: 'Submission Approved', message: 'Your "Lake Alakol Update" has been approved and published.', time: '2 hours ago', read: false },
    { id: 2, type: 'warning', title: 'Review Required', message: 'An admin requested changes to "Syr Darya Delta". Please review.', time: '5 hours ago', read: false },
    { id: 3, type: 'info', title: 'System Update', message: 'New features have been added to the map editor.', time: '1 day ago', read: true },
    { id: 4, type: 'success', title: 'Submission Approved', message: 'Your "Irtysh River Section" has been approved.', time: '3 days ago', read: true },
];

const typeConfig = {
    success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    warning: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-400/10' },
};

export default function NotificationsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Notifications</h1>
                    <p className="text-slate-400 mt-1">Stay updated on your submissions and system alerts</p>
                </div>
                <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm">
                    Mark all as read
                </button>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {MOCK_NOTIFICATIONS.map((notification) => {
                    const config = typeConfig[notification.type];
                    return (
                        <div
                            key={notification.id}
                            className={`bg-slate-800/50 border rounded-xl p-4 flex gap-4 transition-colors ${notification.read
                                    ? 'border-slate-700/50 opacity-70'
                                    : 'border-primary-500/30 bg-slate-800/70'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                                <config.icon className={`w-5 h-5 ${config.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-medium text-slate-100">{notification.title}</h3>
                                        <p className="text-slate-400 text-sm mt-0.5">{notification.message}</p>
                                    </div>
                                    <button className="text-slate-500 hover:text-red-400 transition-colors p-1">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-slate-500 text-xs mt-2">{notification.time}</p>
                            </div>
                            {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {MOCK_NOTIFICATIONS.length === 0 && (
                <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No notifications yet</p>
                </div>
            )}
        </div>
    );
}
