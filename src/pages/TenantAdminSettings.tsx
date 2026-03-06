import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTenantSettings, upsertTenantSettings, uploadTenantLogo } from '../services/tenantSettingsService';
import type { TenantSettings } from '../lib/database.types';
import './TenantAdminSettings.css';

export function TenantAdminSettings() {
    const { user } = useAuth();
    const [, setSettings] = useState<TenantSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const [form, setForm] = useState({
        platform_name: 'SafeHands Portal',
        primary_color: '#2563eb',
        secondary_color: '#64748b',
        footer_text: '',
        support_email: '',
        logo_url: '',
    });

    useEffect(() => {
        if (user?.tenant_id) loadSettings(user.tenant_id);
        else setLoading(false);
    }, [user]);

    async function loadSettings(tenantId: string) {
        try {
            setLoading(true);
            const data = await getTenantSettings(tenantId);
            if (data) {
                setSettings(data);
                setForm({
                    platform_name: data.platform_name,
                    primary_color: data.primary_color,
                    secondary_color: data.secondary_color,
                    footer_text: data.footer_text ?? '',
                    support_email: data.support_email ?? '',
                    logo_url: data.logo_url ?? '',
                });
            }
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }

    function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!user?.tenant_id) return;
        try {
            setSaving(true);
            let logoUrl = form.logo_url;
            if (logoFile) {
                logoUrl = await uploadTenantLogo(user.tenant_id, logoFile);
            }
            await upsertTenantSettings(user.tenant_id, { ...form, logo_url: logoUrl });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (e: any) { setError(e.message); }
        finally { setSaving(false); }
    }

    if (loading) return <div className="loading-state">Loading settings…</div>;

    return (
        <div className="ta-settings">
            <div className="ta-settings__header">
                <div>
                    <h1>Portal Settings</h1>
                    <p>Customise your branded tenant portal experience</p>
                </div>
            </div>

            {error && <div className="alert-error">{error}<button onClick={() => setError(null)}>✕</button></div>}
            {success && <div className="alert-success">✓ Settings saved successfully</div>}

            <form className="settings-grid" onSubmit={handleSave}>
                {/* Branding */}
                <section className="settings-section card">
                    <h2>🎨 Branding</h2>
                    <div className="setting-field">
                        <label>Platform Name</label>
                        <input value={form.platform_name} onChange={e => setForm(f => ({ ...f, platform_name: e.target.value }))} placeholder="e.g. SecureHome Portal" />
                        <span className="hint">Shown in the navigation bar and emails</span>
                    </div>
                    <div className="setting-field">
                        <label>Logo</label>
                        <div className="logo-uploader">
                            {(logoPreview || form.logo_url) && (
                                <img src={logoPreview ?? form.logo_url} alt="Logo preview" className="logo-preview" />
                            )}
                            <input type="file" accept="image/*" onChange={handleLogoChange} />
                        </div>
                    </div>
                    <div className="color-row">
                        <div className="setting-field">
                            <label>Primary Colour</label>
                            <div className="color-input-row">
                                <input type="color" value={form.primary_color} onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))} />
                                <input type="text" value={form.primary_color} onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))} placeholder="#2563eb" />
                            </div>
                        </div>
                        <div className="setting-field">
                            <label>Secondary Colour</label>
                            <div className="color-input-row">
                                <input type="color" value={form.secondary_color} onChange={e => setForm(f => ({ ...f, secondary_color: e.target.value }))} />
                                <input type="text" value={form.secondary_color} onChange={e => setForm(f => ({ ...f, secondary_color: e.target.value }))} placeholder="#64748b" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section className="settings-section card">
                    <h2>📞 Contact & Footer</h2>
                    <div className="setting-field">
                        <label>Support Email</label>
                        <input type="email" value={form.support_email} onChange={e => setForm(f => ({ ...f, support_email: e.target.value }))} placeholder="support@yourcompany.com" />
                    </div>
                    <div className="setting-field">
                        <label>Footer Text</label>
                        <textarea value={form.footer_text} onChange={e => setForm(f => ({ ...f, footer_text: e.target.value }))} placeholder="© 2025 Your Company. All rights reserved." rows={3} />
                    </div>
                </section>

                <div className="settings-actions">
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? 'Saving…' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
