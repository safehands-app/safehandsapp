import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHomes } from '../services/homeService';
import { createVisit, uploadVisitPhoto } from '../services/visitService';
import type { Home } from '../lib/database.types';
import { useAuth } from '../context/AuthContext';
import './FieldExecutiveHomeVisit.css';

export function FieldExecutiveHomeVisit() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [homes, setHomes] = useState<Home[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

    const [form, setForm] = useState({
        home_id: '',
        status: 'completed' as const,
        notes: '',
    });

    useEffect(() => {
        loadHomes();
    }, []);

    async function loadHomes() {
        try {
            const data = await getHomes();
            setHomes(data as Home[]);
            if (data.length > 0) setForm(f => ({ ...f, home_id: (data[0] as Home).id }));
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }

    function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        setPhotos(prev => [...prev, ...files]);
        const previews = files.map(f => URL.createObjectURL(f));
        setPhotoPreviews(prev => [...prev, ...previews]);
    }

    function removePhoto(idx: number) {
        setPhotos(prev => prev.filter((_, i) => i !== idx));
        setPhotoPreviews(prev => prev.filter((_, i) => i !== idx));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;
        try {
            setSubmitting(true);
            const visit = await createVisit({
                home_id: form.home_id,
                executive_id: user.id,
                notes: form.notes,
            });

            // Upload all photos
            for (const photo of photos) {
                await uploadVisitPhoto(visit.id, photo);
            }

            setSuccess('Visit report submitted successfully!');
            setTimeout(() => navigate('/field-exec'), 2000);
        } catch (e: any) { setError(e.message); }
        finally { setSubmitting(false); }
    }

    if (loading) return <div className="loading-state">Loading homes…</div>;

    return (
        <div className="fe-visit">
            <div className="fe-visit__header">
                <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
                <div>
                    <h1>Submit Home Visit Report</h1>
                    <p>Record your inspection findings and upload photos</p>
                </div>
            </div>

            {error && <div className="alert-error">{error}<button onClick={() => setError(null)}>✕</button></div>}
            {success && <div className="alert-success">✓ {success}</div>}

            <form className="visit-form card" onSubmit={handleSubmit}>
                <div className="form-section">
                    <label>
                        <span>Property *</span>
                        <select required value={form.home_id} onChange={e => setForm(f => ({ ...f, home_id: e.target.value }))}>
                            <option value="">Select home…</option>
                            {homes.map(h => (
                                <option key={h.id} value={h.id}>{h.address}, {h.city}</option>
                            ))}
                        </select>
                    </label>

                    <label>
                        <span>Visit Status *</span>
                        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}>
                            <option value="completed">Completed — All OK</option>
                            <option value="in-progress">In Progress</option>
                            <option value="pending">Pending — Follow-up Required</option>
                        </select>
                    </label>

                    <label className="full-width">
                        <span>Inspection Notes *</span>
                        <textarea
                            required
                            rows={5}
                            placeholder="Describe the home condition, tasks completed, anything unusual noticed…"
                            value={form.notes}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        />
                    </label>
                </div>

                {/* Photo upload */}
                <div className="photo-section">
                    <h3>📷 Visit Photos</h3>
                    <p className="hint">Upload photos showing the home condition during your visit</p>

                    <label className="photo-upload-btn">
                        <input type="file" accept="image/*" multiple onChange={handlePhotoSelect} />
                        + Add Photos
                    </label>

                    {photoPreviews.length > 0 && (
                        <div className="photo-grid">
                            {photoPreviews.map((src, i) => (
                                <div key={i} className="photo-thumb">
                                    <img src={src} alt={`Photo ${i + 1}`} />
                                    <button type="button" className="photo-remove" onClick={() => removePhoto(i)}>✕</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={submitting || !form.home_id}>
                        {submitting ? 'Submitting…' : 'Submit Report'}
                    </button>
                </div>
            </form>
        </div>
    );
}
