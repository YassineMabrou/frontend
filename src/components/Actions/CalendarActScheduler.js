import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import './CalendarActScheduler.css';

const CalendarActScheduler = ({
  acts = [],
  view = 'monthly',
  refreshActs = () => {},
}) => {
  const [isCalendarVisible, setIsCalendarVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [horseMap, setHorseMap] = useState({});

  // Fetch horses from the backend and map _id to name
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_API}/horses`)
      .then((res) => {
        const map = {};
        res.data.forEach((horse) => {
          map[horse._id] = horse.name;
        });
        setHorseMap(map);
      })
      .catch((err) => console.error('Failed to fetch horses:', err));
  }, []);

  const calendarView = {
    monthly: 'dayGridMonth',
    weekly: 'timeGridWeek',
    daily: 'timeGridDay',
  }[view] || 'dayGridMonth';

  const mapActsToEvents = () =>
    (acts || []).map((act) => {
      const horseNames = Array.isArray(act.horses)
        ? act.horses.map((id) => horseMap[id] || 'Unknown Horse').join(', ')
        : 'Unnamed';

      return {
        id: act._id,
        title: `${act.type || 'Unknown'} (${horseNames})`,
        start: act.date,
        allDay: true,
        extendedProps: {
          plannedDate: act.plannedDate,
          observations: act.observations,
          results: act.results,
          reminders: act.reminders,
          createdBy: act.createdBy?.name || 'Unknown',
        },
      };
    });

  const handleEventClick = (info) => {
    const actId = info.event.id;
    const action = window.prompt("Enter 'edit' to modify or 'delete' to remove the act:");

    if (action === 'edit') {
      const newType = window.prompt("Enter new type:");
      if (newType) {
        setLoading(true);
        axios
          .put(`${process.env.REACT_APP_BACKEND_API}/acts/${actId}`, { type: newType })
          .then(() => {
            alert('Act updated successfully.');
            refreshActs();
          })
          .catch((err) => alert('Error updating act: ' + err.message))
          .finally(() => setLoading(false));
      }
    } else if (action === 'delete') {
      const confirmDelete = window.confirm("Are you sure you want to delete this act?");
      if (confirmDelete) {
        setLoading(true);
        axios
          .delete(`${process.env.REACT_APP_BACKEND_API}/acts/${actId}`)
          .then(() => {
            alert('Act deleted successfully.');
            refreshActs();
          })
          .catch((err) => alert('Error deleting act: ' + err.message))
          .finally(() => setLoading(false));
      }
    }
  };

  return (
    <div className="procedure-calendar">
      {loading && <div className="loading-overlay">Loading...</div>}

      <button
        className="toggle-calendar-btn"
        onClick={() => setIsCalendarVisible(!isCalendarVisible)}
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          backgroundColor: '#a56d43',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        {isCalendarVisible ? 'Hide Calendar' : 'Show Calendar'}
      </button>

      {isCalendarVisible && (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={calendarView}
          headerToolbar={{
            start: 'prev,next today',
            center: 'title',
            end: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={mapActsToEvents()}
          eventClick={handleEventClick}
          height="auto"
        />
      )}
    </div>
  );
};

export default CalendarActScheduler;
