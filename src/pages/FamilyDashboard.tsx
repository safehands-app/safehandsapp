import { Activity, Heart, Moon } from 'lucide-react';
import './FamilyDashboard.css';
import familyData from '../data/familyData.json';

export function FamilyDashboard() {
    const { healthVitals, homeProperty, liveCameras } = familyData;

    return (
        <div className="family-dashboard">

            {/* Vitals Grid */}
            <section className="dashboard-section">
                <div className="section-header">
                    <h3>Health Vitals</h3>
                    <span className={`status-badge ${healthVitals.statusColor}`}>{healthVitals.status}</span>
                </div>

                <div className="vitals-grid">
                    <div className="vital-card">
                        <div className="vital-icon heartbeat"><Heart size={20} /></div>
                        <div className="vital-data">
                            <span className="vital-value">{healthVitals.heartRate.value}</span>
                            <span className="vital-unit">{healthVitals.heartRate.unit}</span>
                        </div>
                        <div className="vital-label">Heart Rate</div>
                    </div>

                    <div className="vital-card">
                        <div className="vital-icon walk"><Activity size={20} /></div>
                        <div className="vital-data">
                            <span className="vital-value">{healthVitals.activity.value}</span>
                            <span className="vital-unit">{healthVitals.activity.unit}</span>
                        </div>
                        <div className="vital-label">Activity</div>
                    </div>

                    <div className="vital-card full-width">
                        <div className="vital-icon sleep"><Moon size={20} /></div>
                        <div className="vital-data">
                            <span className="vital-value">{healthVitals.sleep.value}</span>
                            <span className={`vital-tag ${healthVitals.sleep.tagColor}`}>{healthVitals.sleep.tag}</span>
                        </div>
                        <div className="vital-label">Last Night Rest</div>
                    </div>
                </div>
            </section>

            {/* Safety Status Grid */}
            <section className="dashboard-section">
                <div className="section-header">
                    <h3>Home Property</h3>
                    <span className={`status-badge ${homeProperty.overallColor}`}>{homeProperty.overallStatus}</span>
                </div>

                <div className="safety-grid">
                    {homeProperty.sensors.map((sensor) => (
                        <div key={sensor.id} className={`safety-card ${sensor.state}`}>
                            <div className="safety-header">{sensor.name}</div>
                            <div className="safety-status">{sensor.status}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Video Feed Placeholder */}
            <section className="dashboard-section">
                <div className="section-header">
                    <h3>Live Cameras</h3>
                </div>
                {liveCameras.map((cam) => (
                    <div key={cam.id} className="video-card">
                        <div className="video-placeholder">
                            {cam.isLive && <span className="live-badge">LIVE</span>}
                            <div className="video-label">{cam.name}</div>
                        </div>
                    </div>
                ))}
            </section>

        </div>
    );
}
