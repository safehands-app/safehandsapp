import { Search, Filter, Download } from 'lucide-react';
import './GenericSubPage.css';

interface GenericSubPageProps {
    title: string;
    description: string;
    columns: string[];
}

export function GenericSubPage({ title, description, columns }: GenericSubPageProps) {
    const data: any[] = []; // Empty for now until backend is connected

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
                            {data.length > 0 ? (
                                data.map(row => (
                                    <tr key={row.id as string}>
                                        {columns.map(col => (
                                            <td key={`${row.id}-${col}`}>
                                                {row[col]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                                        No data available.
                                    </td>
                                </tr>
                            )}
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
