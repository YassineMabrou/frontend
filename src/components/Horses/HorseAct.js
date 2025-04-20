import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HorseAct.css';

const ActList = () => {
  const [acts, setActs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [horses, setHorses] = useState({});

  const BASE_URL = process.env.REACT_APP_BACKEND_API;

  useEffect(() => {
    fetchActs();
  }, []);

  const fetchActs = async () => {
    setLoading(true);
    try {
      const responseActs = await axios.get(`${BASE_URL}/acts`);
      setActs(responseActs.data);

      const responseHorses = await axios.get(`${BASE_URL}/horses`);
      const horsesData = responseHorses.data;

      const horsesMap = horsesData.reduce((acc, horse) => {
        acc[horse._id] = horse.name;
        return acc;
      }, {});

      setHorses(horsesMap);
    } catch (error) {
      console.error('Error fetching acts or horses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const confirmation = window.confirm('Are you sure you want to delete this act?');
      if (confirmation) {
        await axios.delete(`${BASE_URL}/acts/${id}`);
        setActs(acts.filter((act) => act._id !== id));
      }
    } catch (error) {
      console.error('Error deleting act:', error);
    }
  };

  return (
    <div>
      <h2>Acts List</h2>
      {loading && <p>Loading...</p>}
      {!loading && acts.length === 0 && <p>No acts found.</p>}

      {!loading && acts.length > 0 && (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>Type</th>
              <th>Date</th>
              <th>Planned Date</th>
              <th>Observations</th>
              <th>Results</th>
              <th>Horses Involved</th>
              <th>Attachments</th>
              <th>Comments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {acts.map((act) => (
              <tr key={act._id}>
                <td>{act.type}</td>
                <td>{new Date(act.date).toLocaleDateString()}</td>
                <td>{new Date(act.plannedDate).toLocaleDateString()}</td>
                <td>{act.observations}</td>
                <td>{act.results}</td>
                <td>
                  {act.horses.length > 0 ? (
                    act.horses.map((horseId) => (
                      <span key={horseId}>
                        {horses[horseId] || horseId}
                        <br />
                      </span>
                    ))
                  ) : (
                    'No horses involved'
                  )}
                </td>
                <td>
                  {act.attachments.length > 0 ? (
                    <ul>
                      {act.attachments.map((attachment, index) => (
                        <li key={index}>
                          {typeof attachment === 'object' ? (
                            <a
                              href={`${BASE_URL.replace('/api', '')}/uploads/${attachment._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {attachment._id}
                            </a>
                          ) : (
                            attachment
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    'No attachments'
                  )}
                </td>
                <td>
                  {act.comments.length > 0 ? (
                    <ul>
                      {act.comments.map((comment, index) => (
                        <li key={index}>{comment.text || comment}</li>
                      ))}
                    </ul>
                  ) : (
                    'No comments'
                  )}
                </td>
                <td>
                  <button onClick={() => handleDelete(act._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ActList;
