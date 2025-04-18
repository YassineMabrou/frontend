// src/api.js

export const fetchFilteredActs = async (filters) => {
    try {
      const query = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/acts/filter?${query}`);
      if (!response.ok) {
        throw new Error('Failed to fetch filtered acts');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching filtered acts:', error);
      throw error;
    }
  };
  