import { Search, Filter, Download, MoreHorizontal } from 'lucide-react';
import './GenericSubPage.css';

interface GenericSubPageProps {
    title: string;
    description: string;
    columns: string[];
}

const generateRealisticData = (col: string, i: number) => {
    const c = col.toLowerCase();

    // IDs
    if (c.includes('id')) return `${col.split(' ')[0].toUpperCase()}-${1000 + i * 17}`;

    // Names & People
    if (c.includes('contact') || c.includes('caregiver') || c.includes('assigned') || c.includes('executive') || c.includes('user') || c.includes('by')) {
        const names = ['Sarah Jenkins', 'Michael Chang', 'John Smith', 'Eleanor Vance', 'David Kim', 'Emily Rodriguez', 'Robert Johnson', 'System Admin'];
        return names[i % names.length];
    }

    // Tenants & Clients & Families
    if (c.includes('tenant') || c.includes('family') || c.includes('client') || c === 'name' || c.includes('name')) {
        const families = ['The Smiths', 'Oakridge Care', 'CareTech Boston', 'Sunrise Senior', 'Chen Residence', 'Williams Family', 'The Johnsons', 'Holden Family'];
        return families[i % families.length];
    }

    // Dates & Times
    if (c.includes('date') || c.includes('time') || c.includes('until') || c.includes('updated')) {
        const dates = ['Today, 10:00 AM', 'Yesterday', '2 Days Ago', 'Oct 12, 2025', 'Nov 05, 2025', 'Jan 15, 2026', 'Feb 20, 2026', 'March 1, 2026'];
        return dates[i % dates.length];
    }

    // Phones
    if (c.includes('phone')) return `+1 (555) ${100 + i}-${8000 + i}`;

    // Status
    if (c.includes('status') || c.includes('result') || c.includes('level') || c.includes('state')) {
        const statuses = ['Active', 'Completed', 'Pending', 'Warning', 'Healthy', 'Inactive', 'Success', 'Review'];
        return statuses[i % statuses.length];
    }

    // Severity
    if (c.includes('severity')) {
        const severities = ['Low', 'Medium', 'High', 'Critical'];
        return severities[i % severities.length];
    }

    // Money / MRR / Amount
    if (c.includes('mrr') || c.includes('amount')) {
        return `$${(450 * (i + 1)).toLocaleString()}`;
    }

    // Numeric metrics
    if (c.includes('users') || c.includes('score')) {
        return `${85 + (i * 12)}`;
    }

    // Role / Plan
    if (c.includes('plan') || c.includes('role') || c.includes('subscription')) {
        const plans = ['Premium', 'Standard', 'Basic', 'Admin', 'Medical Staff', 'Global Scale', 'Pro', 'Manager'];
        return plans[i % plans.length];
    }

    if (c.includes('duration') || c.includes('spent')) return `${45 + (i * 15)} mins`;
    if (c.includes('service type')) return ['Wellness Check', 'Security Patrol', 'Alarm Reset', 'Medical Assistance'][i % 4];
    if (c.includes('action')) return ['User Login', 'Settings Changed', 'Report Filed', 'Alert Cleared'][i % 4];
    if (c.includes('resource') || c.includes('setting') || c.includes('key') || c.includes('config')) return ['API Gateway', 'User Profile', 'System Config', 'Database'][i % 4];
    if (c.includes('value')) return ['Enabled', 'Disabled', 'Auto', 'Manual'][i % 4];
    if (c.includes('certification')) return ['CPR & First Aid', 'Advanced Security', 'Elder Care Basic', 'HVAC Maintenance'][i % 4];
    if (c.includes('location')) return ['Living Room', 'Main Gate', 'North Wing', 'Facility B'][i % 4];

    return `Item ${i + 1}`;
};

export function GenericSubPage({ title, description, columns }: GenericSubPageProps) {
    // Generate realistic rows based on the columns
    const dummyData = Array.from({ length: 8 }).map((_, i) => {
        const row: Record<string, string> = { id: `row-${i}` };
        columns.forEach((col) => {
            if (col.toLowerCase() === 'actions') {
                row[col] = '';
            } else {
                row[col] = generateRealisticData(col, i);
            }
        });
        return row;
    });

    return (
        <div className="generic-sub-page">
            <div className="gsp-header">
                <div>
                    <h2>{title}</h2>
                    <p>{description}</p>
                </div>
                <div className="gsp-actions">
                    <button className="gsp-btn-outline"><Filter size={16} /> Filter</button>
                    <button className="gsp-btn-outline"><Download size={16} /> Export</button>
                    <button className="gsp-btn-primary">Add New</button>
                </div>
            </div>

            <div className="gsp-content">
                <div className="gsp-toolbar">
                    <div className="gsp-search">
                        <Search size={18} />
                        <input type="text" placeholder={`Search ${title.toLowerCase()}...`} />
                    </div>
                </div>

                <div className="gsp-table-container">
                    <table className="gsp-table">
                        <thead>
                            <tr>
                                {columns.map(col => <th key={col}>{col}</th>)}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dummyData.map(row => (
                                <tr key={row.id as string}>
                                    {columns.map(col => (
                                        <td key={`${row.id}-${col}`}>
                                            {col.toLowerCase() === 'status' || col.toLowerCase() === 'severity' || col.toLowerCase() === 'result' ? (
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                                                    backgroundColor: ['Low', 'Active', 'Healthy', 'Success', 'Completed'].includes(row[col]) ? 'rgba(16, 185, 129, 0.1)' :
                                                        ['Medium', 'Warning', 'Pending', 'Review'].includes(row[col]) ? 'rgba(245, 158, 11, 0.1)' :
                                                            ['High', 'Critical', 'Inactive'].includes(row[col]) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(128, 128, 128, 0.1)',
                                                    color: ['Low', 'Active', 'Healthy', 'Success', 'Completed'].includes(row[col]) ? '#10b981' :
                                                        ['Medium', 'Warning', 'Pending', 'Review'].includes(row[col]) ? '#f59e0b' :
                                                            ['High', 'Critical', 'Inactive'].includes(row[col]) ? '#ef4444' : 'inherit'
                                                }}>
                                                    {row[col]}
                                                </span>
                                            ) : col.toLowerCase() === 'actions' ? (
                                                <button className="gsp-icon-btn"><MoreHorizontal size={16} /></button>
                                            ) : (
                                                row[col]
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="gsp-pagination">
                    <span>Showing 1 to 8 of 42 entries</span>
                    <div className="gsp-page-controls">
                        <button disabled>Previous</button>
                        <button className="active">1</button>
                        <button>2</button>
                        <button>3</button>
                        <button>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
