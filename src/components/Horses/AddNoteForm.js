import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './Note.css';

const Note = () => {
  const [horses, setHorses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newNote, setNewNote] = useState({ horseId: '', author: '', content: '' });
  const [editNote, setEditNote] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch all horses
  useEffect(() => {
    const fetchHorses = async () => {
      try {
        const response = await axios.get('http://localhost:7002/api/horses');
        setHorses(response.data);
      } catch (err) {
        console.error('Error fetching horses:', err.message);
      }
    };

    fetchHorses();
  }, []);

  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      const response = await axios.get('http://localhost:7002/api/notes');
      setNotes(response.data);
    };

    fetchNotes();
  }, []);

  const handleAddNote = async () => {
    if (!newNote.horseId || !newNote.author || !newNote.content) {
      alert('Horse, Author, and Content are required!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:7002/api/notes', newNote);
      setNotes([...notes, response.data]);
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding note:', err.response?.data?.error || err.message);
      alert('Failed to add note.');
    }
  };

  const handleEditNote = async () => {
    if (!editNote.horseId || !editNote.author || !editNote.content) {
      alert('Horse, Author, and Content are required!');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:7002/api/notes/${editNote._id}`, editNote);
      setNotes(notes.map((note) => (note._id === editNote._id ? response.data : note)));
      setShowEditModal(false);
    } catch (err) {
      console.error('Error editing note:', err.response?.data?.error || err.message);
      alert('Failed to edit note.');
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await axios.delete(`http://localhost:7002/api/notes/${id}`);
      setNotes(notes.filter((note) => note._id !== id));
    } catch (err) {
      console.error('Error deleting note:', err.response?.data?.error || err.message);
      alert('Failed to delete note.');
    }
  };

  const getHorseNameById = (horseId) => {
    const horse = horses.find((h) => h._id === horseId);
    return horse ? horse.name : 'Unknown Horse';
  };

  // ✅ Client-side filtered notes by horse name, author, or content
  const filteredNotes = notes.filter(note => {
    const horse = horses.find(h => h._id === note.horseId);
    const horseName = horse?.name?.toLowerCase() || '';
    const author = note.author?.toLowerCase() || '';
    const content = note.content?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();

    return (
      horseName.includes(query) ||
      author.includes(query) ||
      content.includes(query)
    );
  });

  return (
    <div className="page-wrapper">
      <button className="add-note-button" onClick={() => setShowAddModal(true)}>Add Note</button>

      <input
        type="text"
        placeholder="Search by horse name, author, or content"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th>Horse Name</th>
            <th>Author</th>
            <th>Content</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredNotes.map((note) => (
            <tr key={note._id}>
              <td>{getHorseNameById(note.horseId)}</td>
              <td>{note.author}</td>
              <td>{note.content}</td>
              <td>
                <button
                  style={{
                    backgroundColor: '#a56d43',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    marginRight: '6px',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setEditNote(note);
                    setShowEditModal(true);
                  }}
                >
                  Edit
                </button>
                <button
                  style={{
                    backgroundColor: '#a56d43',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleDeleteNote(note._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Note Modal */}
      <Modal isOpen={showAddModal} onRequestClose={() => setShowAddModal(false)}>
        <h2>Add Note</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleAddNote(); }}>
          <label>Horse</label>
          <select value={newNote.horseId} onChange={(e) => setNewNote({ ...newNote, horseId: e.target.value })}>
            <option value="">Select a Horse</option>
            {horses.map((horse) => (
              <option key={horse._id} value={horse._id}>{horse.name}</option>
            ))}
          </select>

          <label>Author</label>
          <input type="text" value={newNote.author} onChange={(e) => setNewNote({ ...newNote, author: e.target.value })} />

          <label>Content</label>
          <textarea value={newNote.content} onChange={(e) => setNewNote({ ...newNote, content: e.target.value })} />

          <button type="submit" style={{ backgroundColor: '#a56d43', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', marginRight: '10px' }}>
            Add Note
          </button>
          <button type="button" style={{ backgroundColor: '#a56d43', color: 'white', padding: '10px', border: 'none', borderRadius: '6px' }} onClick={() => setShowAddModal(false)}>
            Close
          </button>
        </form>
      </Modal>

      {/* Edit Note Modal */}
      <Modal isOpen={showEditModal} onRequestClose={() => setShowEditModal(false)}>
        <h2>Edit Note</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleEditNote(); }}>
          <label>Horse</label>
          <select value={editNote?.horseId || ''} onChange={(e) => setEditNote({ ...editNote, horseId: e.target.value })}>
            <option value="">Select a Horse</option>
            {horses.map((horse) => (
              <option key={horse._id} value={horse._id}>{horse.name}</option>
            ))}
          </select>

          <label>Author</label>
          <input type="text" value={editNote?.author || ''} onChange={(e) => setEditNote({ ...editNote, author: e.target.value })} />

          <label>Content</label>
          <textarea value={editNote?.content || ''} onChange={(e) => setEditNote({ ...editNote, content: e.target.value })} />

          <button type="submit" style={{ backgroundColor: '#a56d43', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', marginRight: '10px' }}>
            Edit Note
          </button>
          <button type="button" style={{ backgroundColor: '#a56d43', color: 'white', padding: '10px', border: 'none', borderRadius: '6px' }} onClick={() => setShowEditModal(false)}>
            Close
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Note;
