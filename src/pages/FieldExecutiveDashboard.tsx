import { Link } from 'react-router-dom';
import { Clock, MapPin, CheckCircle, Navigation, Phone, ShieldAlert } from 'lucide-react';
import './FieldExecutiveDashboard.css';
import fieldExecData from '../data/fieldExecData.json';

export function FieldExecutiveDashboard() {
    const { currentShift, todayItinerary } = fieldExecData;

    // Filter to find the urgent or in-progress job
    const activeJob = todayItinerary.find(job => job.status === 'IN PROGRESS' || job.urgent);

    return (
        <div className="fe-dashboard">
            {/* Urgent / Active Alert Area if applicable */}
            {activeJob?.urgent && (
                <div className="fe-urgent-alert">
                    <ShieldAlert size={32} />
                    <div>
                        <strong>URGENT: {activeJob.type}</strong>
                        <span>{activeJob.client} - {activeJob.address}</span>
                    </div>
                </div>
            )}

            {/* Shift Summary Section */}
            <section className="fe-section">
                <div className="fe-section-header">
                    <h3>Today's Shift</h3>
                    <span className="fe-badge green">ON DUTY</span>
                </div>

                <div className="fe-shift-card">
                    <div className="fe-shift-stat">
                        <span className="fe-stat-label">Started</span>
                        <span className="fe-stat-value">{currentShift.startTime}</span>
                    </div>
                    <div className="fe-shift-divider"></div>
                    <div className="fe-shift-stat">
                        <span className="fe-stat-label">Hours Logged</span>
                        <span className="fe-stat-value" style={{ color: 'var(--text-color)' }}>{currentShift.hoursLogged}</span>
                    </div>
                </div>
            </section>

            {/* Daily Itinerary Section */}
            <section className="fe-section">
                <div className="fe-section-header">
                    <h3>My Itinerary</h3>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{todayItinerary.length} visits</span>
                </div>

                <div className="fe-itinerary-list">
                    {todayItinerary.map((job) => (
                        <div key={job.id} className={`fe-job-card ${job.statusColor}`}>
                            <div className="fe-job-header">
                                <div className="fe-job-time">
                                    <Clock size={14} />
                                    {job.time}
                                </div>
                                <span className={`fe-job-status ${job.statusColor}`}>
                                    {job.status}
                                </span>
                            </div>

                            <div>
                                <Link to={`/field-exec/patient/${job.id}`} style={{ textDecoration: 'none' }}>
                                    <h4 className="fe-job-client" style={{ display: 'inline-block' }}>{job.client}</h4>
                                </Link>
                                <br />
                                <span className="fe-job-type">{job.type}</span>
                            </div>

                            <div className="fe-job-address">
                                <MapPin size={14} />
                                {job.address}
                            </div>

                            {/* Show Action Buttons if not completed */}
                            {job.status !== 'COMPLETED' ? (
                                <div className="fe-action-bar">
                                    {job.status === 'PENDING' ? (
                                        <button className="fe-btn fe-btn-primary">
                                            Start Travel
                                            <Navigation size={16} />
                                        </button>
                                    ) : (
                                        <>
                                            <button className="fe-btn fe-btn-secondary">
                                                <Phone size={16} /> Contact
                                            </button>
                                            <button className="fe-btn fe-btn-primary">
                                                Check In
                                                <CheckCircle size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
