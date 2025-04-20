import React, { useEffect, useState } from "react";
import axios from "axios";

const QUALIFICATIONS_API = `${process.env.REACT_APP_BACKEND_API}/qualifications`;
const HORSES_API = `${process.env.REACT_APP_BACKEND_API}/horses`;

const QualificationsManager = () => {
  const [qualifications, setQualifications] = useState([]);
  const [horses, setHorses] = useState([]);
  const [form, setForm] = useState({
    horseId: "",
    competitionName: "",
    date: "",
    location: "",
    result: "",
    score: "",
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  const fetchQualifications = async () => {
    try {
      const res = await axios.get(QUALIFICATIONS_API);
      setQualifications(res.data);
    } catch (err) {
      setError("Failed to load qualifications.");
    }
  };

  const fetchHorses = async () => {
    try {
      const res = await axios.get(HORSES_API);
      setHorses(res.data);
    } catch (err) {
      setError("Failed to load horses.");
    }
  };

  useEffect(() => {
    fetchQualifications();
    fetchHorses();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${QUALIFICATIONS_API}/${editId}`, form);
      } else {
        await axios.post(QUALIFICATIONS_API, form);
      }
      setForm({
        horseId: "",
        competitionName: "",
        date: "",
        location: "",
        result: "",
        score: "",
      });
      setEditId(null);
      fetchQualifications();
    } catch (err) {
      setError("Failed to save qualification.");
    }
  };

  const handleEdit = (qualification) => {
    setForm({
      horseId: qualification.horseId?._id || qualification.horseId,
      competitionName: qualification.competitionName,
      date: qualification.date.slice(0, 10),
      location: qualification.location,
      result: qualification.result,
      score: qualification.score || "",
    });
    setEditId(qualification._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${QUALIFICATIONS_API}/${id}`);
      fetchQualifications();
    } catch (err) {
      setError("Failed to delete qualification.");
    }
  };

  const getHorseName = (horseId) => {
    const horse = horses.find((h) => h._id === horseId || h._id === horseId?._id);
    return horse ? horse.name : horseId;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Qualifications Manager</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-8">
        <select
          name="horseId"
          value={form.horseId}
          onChange={handleChange}
          className="border p-2"
          required
        >
          <option value="">Select Horse</option>
          {horses.map((horse) => (
            <option key={horse._id} value={horse._id}>
              {horse.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="competitionName"
          placeholder="Competition Name"
          value={form.competitionName}
          onChange={handleChange}
          className="border p-2"
          required
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="border p-2"
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="border p-2"
          required
        />
        <input
          type="text"
          name="result"
          placeholder="Result"
          value={form.result}
          onChange={handleChange}
          className="border p-2"
          required
        />
        <input
          type="number"
          name="score"
          placeholder="Score (optional)"
          value={form.score}
          onChange={handleChange}
          className="border p-2"
        />
        <button
          type="submit"
          className="col-span-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          {editId ? "Update Qualification" : "Add Qualification"}
        </button>
      </form>

      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">Horse</th>
            <th className="border px-3 py-2">Competition</th>
            <th className="border px-3 py-2">Date</th>
            <th className="border px-3 py-2">Location</th>
            <th className="border px-3 py-2">Result</th>
            <th className="border px-3 py-2">Score</th>
            <th className="border px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {qualifications.map((q) => (
            <tr key={q._id}>
              <td className="border px-3 py-2">
                {getHorseName(q.horseId?._id || q.horseId)}
              </td>
              <td className="border px-3 py-2">{q.competitionName}</td>
              <td className="border px-3 py-2">
                {new Date(q.date).toLocaleDateString()}
              </td>
              <td className="border px-3 py-2">{q.location}</td>
              <td className="border px-3 py-2">{q.result}</td>
              <td className="border px-3 py-2">{q.score ?? "—"}</td>
              <td className="border px-3 py-2 space-x-2">
                <button
                  onClick={() => handleEdit(q)}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(q._id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QualificationsManager;
