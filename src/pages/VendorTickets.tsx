import { useState } from 'react';
import { Plus, MoreHorizontal, Clock, MapPin, Truck } from 'lucide-react';
import vendorData from '../data/vendorData.json';
import './VendorTickets.css';

export function VendorTickets() {
    const { serviceQueue } = vendorData;

    // Group tickets by status for Kanban columns
    const columns = [
        { id: 'URGENT', title: 'Critical / Urgent', color: '#ef4444' },
        { id: 'SCHEDULED', title: 'Scheduled', color: '#3b82f6' },
        { id: 'PENDING', title: 'Pending Triage', color: '#f59e0b' },
    ];

    const [tickets] = useState(serviceQueue);

    return (
        <div className="vendor-tickets-page">
            <div className="tickets-header-row">
                <div>
                    <h2>Service Ticket Queue</h2>
                    <p>Manage your active maintenance and repair requests.</p>
                </div>
                <button className="create-ticket-btn">
                    <Plus size={18} /> New Request
                </button>
            </div>

            <div className="kanban-board">
                {columns.map(col => (
                    <div key={col.id} className="kanban-column">
                        <div className="kanban-column-header">
                            <div className="kanban-column-title">
                                <span className="kanban-dot" style={{ backgroundColor: col.color }}></span>
                                <h3>{col.title}</h3>
                                <span className="kanban-count">
                                    {tickets.filter(t => t.status === col.id).length}
                                </span>
                            </div>
                            <button className="icon-btn" style={{ opacity: 0.5 }}><MoreHorizontal size={18} /></button>
                        </div>

                        <div className="kanban-cards">
                            {tickets.filter(t => t.status === col.id).map(ticket => (
                                <div key={ticket.id} className="kanban-card">
                                    <div className="kanban-card-top">
                                        <span className="kanban-ticket-id">{ticket.id}</span>
                                        <Truck size={14} className="kanban-card-icon" />
                                    </div>
                                    <h4 className="kanban-card-title">{ticket.item}</h4>
                                    <span className="kanban-card-type">{ticket.type}</span>

                                    <div className="kanban-card-footer">
                                        <div className="kanban-meta-item">
                                            <MapPin size={12} />
                                            <span>{ticket.location}</span>
                                        </div>
                                        <div className="kanban-meta-item">
                                            <Clock size={12} />
                                            <span>{ticket.created}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {tickets.filter(t => t.status === col.id).length === 0 && (
                                <div className="kanban-empty">No tickets</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
