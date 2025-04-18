import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HorseAct.css';  
const ActList = () => {
  const [acts, setActs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [horses, setHorses] = useState({}); // Store horse names by their ID

  useEffect(() => {
    fetchActs();
  }, []);

  const fetchActs = async () => {
    setLoading(true);
    try {
      // Fetch the acts first
      const responseActs = await axios.get('http://localhost:7002/api/acts');
      setActs(responseActs.data);

      // Fetch all horses' data
      const responseHorses = await axios.get('http://localhost:7002/api/horses');
      const horsesData = responseHorses.data;

      // Map horse IDs to their names
      const horsesMap = horsesData.reduce((acc, horse) => {
        acc[horse._id] = horse.name; // Assuming horse has _id and name properties
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
        await axios.delete(`http://localhost:7002/api/acts/${id}`);
        // Remove the deleted act from the state without refetching the entire list
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
        <table border="1" cellpadding="10" cellspacing="0">
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
                        {horseId} {/* Display horse ID */}
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
                            <a href={`http://localhost:7002/uploads/${attachment._id}`} target="_blank" rel="noopener noreferrer">
                              {attachment._id} {/* Replace _id with whatever property is useful */}
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
                  {/* Only the Delete button remains */}
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
