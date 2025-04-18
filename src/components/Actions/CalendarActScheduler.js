import React, { useState } from 'react';
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
  const [isCalendarVisible, setIsCalendarVisible] = useState(true); // State for toggling calendar visibility
  const [loading, setLoading] = useState(false);

  // Set calendar view based on selected view
  const calendarView = {
    monthly: 'dayGridMonth',
    weekly: 'timeGridWeek',
    daily: 'timeGridDay',
  }[view] || 'dayGridMonth';

  // Map acts to FullCalendar event format
  const mapActsToEvents = () =>
    (acts || []).map((act) => ({
      id: act._id,
      title: `${act.type || 'Unknown'} (${act.horses?.map(h => h.name).join(', ') || 'Unnamed'})`,
      start: act.date,
      allDay: true,
      extendedProps: {
        plannedDate: act.plannedDate,
        observations: act.observations,
        results: act.results,
        reminders: act.reminders,
        createdBy: act.createdBy?.name || 'Unknown',
      },
    }));

  // Event click handler for editing or deleting events
  const handleEventClick = (info) => {
    const actId = info.event.id;
    const action = window.prompt("Enter 'edit' to modify or 'delete' to remove the act:");

    if (action === 'edit') {
      const newType = window.prompt("Enter new type:");
      if (newType) {
        setLoading(true);
        axios.put(`http://localhost:7002/api/acts/${actId}`, { type: newType })
          .then(() => {
            alert('Act updated successfully.');
            refreshActs();
          })
          .catch(err => alert('Error updating act: ' + err.message))
          .finally(() => setLoading(false));
      }
    } else if (action === 'delete') {
      const confirmDelete = window.confirm("Are you sure you want to delete this act?");
      if (confirmDelete) {
        setLoading(true);
        axios.delete(`http://localhost:7002/api/acts/${actId}`)
          .then(() => {
            alert('Act deleted successfully.');
            refreshActs();
          })
          .catch(err => alert('Error deleting act: ' + err.message))
          .finally(() => setLoading(false));
      }
    }
  };

  return (
    <div className="procedure-calendar">
      {loading && <div className="loading-overlay">Loading...</div>}
      
      {/* Toggle Button to Show/Hide Calendar */}
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

      {/* Conditionally render FullCalendar based on isCalendarVisible */}
      {isCalendarVisible && (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={calendarView}
          headerToolbar={{
            start: 'prev,next today',
            center: 'title',
            end: 'dayGridMonth,timeGridWeek,timeGridDay', // Added view change options to the header
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
