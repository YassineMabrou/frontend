import React, { useEffect, useState } from "react";
import axios from "axios";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    availability: "",
  });

  // Fetch all contacts
  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API}/contacts`);
      setContacts(res.data);
    } catch (err) {
      console.error("Failed to fetch contacts", err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Delete a contact
  const deleteContact = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_API}/contacts/${id}`);
      fetchContacts();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // Update a contact
  const updateContact = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_API}/contacts/${editingContact._id}`, formData);
      setEditingContact(null);
      setFormData({ name: "", role: "", email: "", phone: "", availability: "" });
      fetchContacts();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const startEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      role: contact.role,
      email: contact.email,
      phone: contact.phone,
      availability: contact.availability,
    });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📋 Contact List</h2>

      {contacts.map((contact) => (
        <div key={contact._id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
          <p><strong>Name:</strong> {contact.name}</p>
          <p><strong>Role:</strong> {contact.role}</p>
          <p><strong>Email:</strong> {contact.email}</p>
          <p><strong>Phone:</strong> {contact.phone}</p>
          <p><strong>Availability:</strong> {contact.availability}</p>
          <button onClick={() => startEdit(contact)} style={{ marginRight: "1rem" }}>✏️ Edit</button>
          <button onClick={() => deleteContact(contact._id)} style={{ color: "red" }}>🗑️ Delete</button>
        </div>
      ))}

      {editingContact && (
        <div style={{ marginTop: "2rem" }}>
          <h3>✏️ Editing: {editingContact.name}</h3>
          <form onSubmit={updateContact}>
            <input type="text" placeholder="Name" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /><br />
            <input type="text" placeholder="Role" value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })} required /><br />
            <input type="email" placeholder="Email" value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /><br />
            <input type="text" placeholder="Phone" value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required /><br />
            <input type="text" placeholder="Availability" value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })} required /><br />
            <button type="submit">✅ Update</button>
            <button type="button" onClick={() => setEditingContact(null)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Contacts;
