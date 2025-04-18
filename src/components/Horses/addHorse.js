import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './addHorse.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const AddHorseForm = () => {
  const [horse, setHorse] = useState({
    name: '',
    coatColor: '',
    sireNumber: '',
    sireKey: '',
    birthDate: '',
    sex: '',
    breedCode: '',
    responsibleContacts: '',
    currentLocation: {
      lieu: ''
    }
  });

  const [locations, setLocations] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch locations on mount
  useEffect(() => {
    axios.get('http://localhost:7002/api/lieux')
      .then(res => setLocations(res.data))
      .catch(err => console.error('Error fetching locations:', err));
  }, []);

  const validateForm = () => {
    if (
      !horse.name || !horse.coatColor || !horse.sireNumber ||
      !horse.birthDate || !horse.sex || !horse.breedCode || !horse.currentLocation.lieu
    ) {
      setError('Tous les champs sont requis.');
      return false;
    }
    if (!/^\d{9}$/.test(horse.sireNumber)) {
      setError('Le numéro SIRE doit être composé de 9 chiffres.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post('http://localhost:7002/api/horses/add', horse);
      alert('Le cheval a été ajouté avec succès');

      setHorse({
        name: '',
        coatColor: '',
        sireNumber: '',
        sireKey: '',
        birthDate: '',
        sex: '',
        breedCode: '',
        responsibleContacts: '',
        currentLocation: {
          lieu: ''
        }
      });
    } catch (err) {
      console.error(err);
      setError('Une erreur est survenue lors de l’ajout du cheval.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'lieu') {
      setHorse(prev => ({
        ...prev,
        currentLocation: { lieu: value }
      }));
    } else {
      setHorse(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h2>Ajouter un cheval</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <label>Nom:
          <input type="text" name="name" value={horse.name} onChange={handleChange} placeholder="Nom du cheval" />
        </label>

        <label>Robe:
          <select name="coatColor" value={horse.coatColor} onChange={handleChange}>
            <option value="">Sélectionner la robe</option>
            <option value="bai">Bai</option>
            <option value="alezan">Alezan</option>
            <option value="gris">Gris</option>
            <option value="noir">Noir</option>
            <option value="autre">Autre</option>
          </select>
        </label>

        <label>Numéro SIRE:
          <input type="text" name="sireNumber" value={horse.sireNumber} onChange={handleChange} placeholder="Numéro SIRE (9 chiffres)" />
        </label>

        <label>Date de naissance:
          <input type="date" name="birthDate" value={horse.birthDate} onChange={handleChange} />
        </label>

        <label>Sexe:
          <select name="sex" value={horse.sex} onChange={handleChange}>
            <option value="">Sélectionner le sexe</option>
            <option value="mâle">Mâle</option>
            <option value="femelle">Femelle</option>
            <option value="hongre">Hongre</option>
          </select>
        </label>

        <label>Code race:
          <input type="text" name="breedCode" value={horse.breedCode} onChange={handleChange} placeholder="Code race" />
        </label>

        <label>Contacts responsables:
          <input type="text" name="responsibleContacts" value={horse.responsibleContacts} onChange={handleChange} placeholder="Contacts responsables" />
        </label>

        <label>Lieu actuel:
          <select name="lieu" value={horse.currentLocation.lieu} onChange={handleChange} required>
            <option value="">Sélectionner un lieu</option>
            {locations.map(loc => (
              <option key={loc._id} value={loc._id}>{loc.name}</option>
            ))}
          </select>
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement en cours...' : 'Ajouter le cheval'}
        </button>
      </form>
    </div>
  );
};

export default AddHorseForm;
