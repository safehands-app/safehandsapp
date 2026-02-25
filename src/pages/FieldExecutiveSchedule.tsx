import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation, MapPin, CheckCircle } from 'lucide-react';
import './FieldExecutiveSchedule.css';
import fieldExecData from '../data/fieldExecData.json';

// Generate dummy dates relative to today
const today = new Date();
const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i - 1); // Start from yesterday
    return {
        id: i,
        dayStr: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateNum: d.getDate(),
        isToday: i === 1
    };
});

export function FieldExecutiveSchedule() {
    const { todayItinerary } = fieldExecData;
    const [selectedDateId, setSelectedDateId] = useState(1); // Default to today

    return (
        <div className="fe-schedule-container">
            <div className="fe-schedule-header">
                <h2>Schedule</h2>
                <p className="fe-schedule-subtitle">Tap a date to view assignments</p>
            </div>

            {/* Date Carousel */}
            <div className="fe-date-carousel">
                {dates.map(date => (
                    <div
                        key={date.id}
                        className={`fe-date-card ${selectedDateId === date.id ? 'active' : ''}`}
                        onClick={() => setSelectedDateId(date.id)}
                    >
                        <span className="fe-date-day">{date.isToday ? 'Today' : date.dayStr}</span>
                        <span className="fe-date-num">{date.dateNum}</span>
                    </div>
                ))}
            </div>

            {/* Vertical Timeline */}
            <div className="fe-timeline">
                {todayItinerary.map((job) => {
                    // Determine classes based on status
                    let itemClass = '';
                    if (job.status === 'COMPLETED') itemClass = 'completed';
                    else if (job.status === 'IN PROGRESS') itemClass = 'current';
                    else if (job.urgent) itemClass = 'urgent';

                    return (
                        <div key={job.id} className={`fe-timeline-item ${itemClass}`}>
                            <div className="fe-timeline-dot"></div>
                            <div className="fe-timeline-content">
                                <span className="fe-timeline-time">{job.time}</span>
                                <Link to={`/field-exec/patient/${job.id}`} style={{ textDecoration: 'none' }}>
                                    <span className="fe-timeline-client" style={{ display: 'inline-block' }}>{job.client}</span>
                                </Link>
                                <span className="fe-timeline-type" style={{ display: 'block' }}>{job.type}</span>

                                <div className="fe-timeline-details">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.7, fontSize: '0.8rem' }}>
                                        <MapPin size={14} />
                                        <span>Oakridge Sector</span>
                                    </div>
                                    <button className="fe-btn-map">
                                        Directions <Navigation size={14} />
                                    </button>
                                </div>
                                {job.status === 'COMPLETED' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 600 }}>
                                        <CheckCircle size={14} /> Checked-Out Manually
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                <div className="fe-timeline-item">
                    <div className="fe-timeline-dot" style={{ backgroundColor: 'transparent', borderColor: 'var(--border-color)', borderStyle: 'dashed' }}></div>
                    <div style={{ padding: '0.5rem 1rem', opacity: 0.5, fontSize: '0.9rem', fontWeight: 500 }}>
                        End of Shift
                    </div>
                </div>
            </div>
        </div>
    );
}
