// Transport.js (React component)
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransportHistory = () => {
    const [transports, setTransports] = useState([]);
    const API = process.env.REACT_APP_BACKEND_API;

    useEffect(() => {
        // Fetch transport history from the backend
        const fetchTransportHistory = async () => {
            try {
                // Use environment variable for base API URL
                const response = await axios.get(`${API}/transports/history`);
                setTransports(response.data);
            } catch (error) {
                console.error('Error fetching transport history:', error);
            }
        };

        fetchTransportHistory();
    }, [API]);

    return (
        <div className="history-container">
            <h2>Transport History</h2>
            <table>
                <thead>
                    <tr>
                        <th>Horse</th>
                        <th>Transporter</th>
                        <th>Departure Time</th>
                        <th>Arrival Time</th>
                        <th>Departure Location</th>
                        <th>Arrival Location</th>
                        <th>Conditions</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    {transports.map((transport) => (
                        <tr key={transport._id}>
                            <td>{transport.horse ? transport.horse.name : 'Unknown'}</td>
                            <td>{transport.transporter}</td>
                            <td>{new Date(transport.departureTime).toLocaleString()}</td>
                            <td>{new Date(transport.arrivalTime).toLocaleString()}</td>
                            <td>{transport.departureLocation}</td>
                            <td>{transport.arrivalLocation}</td>
                            <td>{transport.conditions}</td>
                            <td>{transport.notes}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransportHistory;
