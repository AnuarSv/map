import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetType: string;
    targetName: string;
    targetId: string | number;
}

export function FeedbackModal({ isOpen, onClose, targetType, targetName, targetId }: FeedbackModalProps) {
    const [type, setType] = useState('error');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    target_type: targetType,
                    target_id_str: String(targetId),
                    message: `[${targetName}] ${message}`
                })
            });

            if (response.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    onClose();
                    setIsSuccess(false);
                    setMessage('');
                }, 2000);
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-emerald-600" />
                        Предложить изменения
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {isSuccess ? (
                    <div className="p-10 text-center">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Send className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">Спасибо!</h4>
                        <p className="text-slate-500 dark:text-slate-400">Ваше сообщение отправлено на модерацию.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Объект</p>
                            <p className="font-bold text-slate-900 dark:text-white">{targetName}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Тип обращения</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setType('error')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all ${type === 'error' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700' : 'border-slate-200 dark:border-slate-800 text-slate-500'}`}
                                >
                                    Ошибка
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('suggestion')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all ${type === 'suggestion' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700' : 'border-slate-200 dark:border-slate-800 text-slate-500'}`}
                                >
                                    Предложение
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Комментарий</label>
                            <textarea
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Опишите, что нужно изменить..."
                                className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !message.trim()}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'Отправка...' : 'Отправить'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
