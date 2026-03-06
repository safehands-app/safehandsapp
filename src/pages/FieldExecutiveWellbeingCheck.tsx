import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHomes } from '../services/homeService';
import { createWellbeingCheck } from '../services/wellbeingService';
import type { Home, WellbeingCheck } from '../lib/database.types';
import { useAuth } from '../context/AuthContext';
import './FieldExecutiveWellbeingCheck.css';

const STATUS_OPTIONS: { value: WellbeingCheck['status']; label: string; icon: string; desc: string }[] = [
    { value: 'ok', label: 'All Good', icon: '✅', desc: 'Elderly person is healthy, safe, and in good spirits.' },
    { value: 'attention-required', label: 'Attention Required', icon: '⚠️', desc: 'Minor concern — monitoring needed, family should be informed.' },
    { value: 'emergency', label: 'Emergency', icon: '🚨', desc: 'Immediate medical or safety intervention required.' },
];

export function FieldExecutiveWellbeingCheck() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [homes, setHomes] = useState<Home[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<{ home_id: string; status: WellbeingCheck['status']; notes: string }>({
        home_id: '',
        status: 'ok',
        notes: '',
    });

    useEffect(() => {
        loadHomes();
    }, []);

    async function loadHomes() {
        try {
            const data = await getHomes();
            const elderlyHomes = (data as Home[]).filter(h => h.elderly_present);
            setHomes(elderlyHomes);
            if (elderlyHomes.length > 0) setForm(f => ({ ...f, home_id: elderlyHomes[0].id }));
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;
        try {
            setSubmitting(true);
            await createWellbeingCheck(form);
            setSuccess(true);
            setTimeout(() => navigate('/field-exec'), 2000);
        } catch (e: any) { setError(e.message); }
        finally { setSubmitting(false); }
    }

    if (loading) return <div className="loading-state">Loading homes…</div>;

    if (homes.length === 0) {
        return (
            <div className="wb-check">
                <div className="empty-state">
                    <span>💙</span>
                    <p>No homes with elderly monitoring are assigned to you.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="wb-check">
            <div className="wb-check__header">
                <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
                <div>
                    <h1>Wellbeing Check</h1>
                    <p>Record the welfare status of elderly residents during your visit</p>
                </div>
            </div>

            {error && <div className="alert-error">{error}<button onClick={() => setError(null)}>✕</button></div>}
            {success && <div className="alert-success">✓ Wellbeing check submitted. Returning to dashboard…</div>}

            <form className="wb-form card" onSubmit={handleSubmit}>
                <div className="wb-form__field">
                    <label>Property</label>
                    <select required value={form.home_id} onChange={e => setForm(f => ({ ...f, home_id: e.target.value }))}>
                        {homes.map(h => (
                            <option key={h.id} value={h.id}>{h.address}, {h.city}</option>
                        ))}
                    </select>
                </div>

                <div className="wb-form__field">
                    <label>Wellbeing Status</label>
                    <div className="status-options">
                        {STATUS_OPTIONS.map(opt => (
                            <label
                                key={opt.value}
                                className={`status-option ${form.status === opt.value ? `status-option--${opt.value}` : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    value={opt.value}
                                    checked={form.status === opt.value}
                                    onChange={() => setForm(f => ({ ...f, status: opt.value }))}
                                />
                                <span className="status-option__icon">{opt.icon}</span>
                                <div>
                                    <strong>{opt.label}</strong>
                                    <p>{opt.desc}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="wb-form__field">
                    <label>Observations / Notes</label>
                    <textarea
                        rows={4}
                        placeholder="Describe the person's condition, mood, any concerns noticed…"
                        value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    />
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={submitting || !form.home_id}>
                        {submitting ? 'Submitting…' : 'Submit Check'}
                    </button>
                </div>
            </form>
        </div>
    );
}
