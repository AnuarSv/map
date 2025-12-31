import { useState } from 'react';
import { FileCheck, Clock, XCircle, ExternalLink } from 'lucide-react';

interface Review {
    id: number;
    name: string;
    type: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    reviewedAt?: string;
}

const MOCK_REVIEWS: Review[] = [
    { id: 1, name: 'Lake Alakol Update', type: 'lake', status: 'approved', submittedAt: '2025-12-28', reviewedAt: '2025-12-29' },
    { id: 2, name: 'Syr Darya Delta', type: 'river', status: 'pending', submittedAt: '2025-12-30' },
    { id: 3, name: 'Small Spring #42', type: 'spring', status: 'rejected', submittedAt: '2025-12-25', reviewedAt: '2025-12-26' },
    { id: 4, name: 'Irtysh River Section', type: 'river', status: 'approved', submittedAt: '2025-12-20', reviewedAt: '2025-12-22' },
    { id: 5, name: 'Kapchagai Reservoir', type: 'reservoir', status: 'pending', submittedAt: '2025-12-31' },
];

const statusConfig = {
    pending: { label: 'Pending', icon: Clock, color: 'text-amber-400 bg-amber-400/10' },
    approved: { label: 'Approved', icon: FileCheck, color: 'text-emerald-400 bg-emerald-400/10' },
    rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-400 bg-red-400/10' },
};

export default function MyReviewsPage() {
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    const filteredReviews = filter === 'all'
        ? MOCK_REVIEWS
        : MOCK_REVIEWS.filter(r => r.status === filter);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">My Reviews</h1>
                    <p className="text-slate-400 mt-1">Track the status of your water object submissions</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab
                                ? 'bg-primary-500 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Reviews List */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-800/80">
                        <tr className="text-left text-sm text-slate-400">
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Type</th>
                            <th className="px-6 py-4 font-medium">Submitted</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {filteredReviews.map((review) => {
                            const status = statusConfig[review.status];
                            return (
                                <tr key={review.id} className="hover:bg-slate-700/20 transition-colors">
                                    <td className="px-6 py-4 text-slate-200 font-medium">{review.name}</td>
                                    <td className="px-6 py-4 text-slate-400 capitalize">{review.type}</td>
                                    <td className="px-6 py-4 text-slate-400">{review.submittedAt}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                            <status.icon className="w-3.5 h-3.5" />
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-primary-400 hover:text-primary-300 flex items-center gap-1 text-sm">
                                            <ExternalLink className="w-4 h-4" />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
