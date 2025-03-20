const API_URL = import.meta.env.VITE_API_URL || 'https://ecotrack-api-uw71.onrender.com';

export const energyApi = {
  async predictEnergyConsumption(data: PredictionData): Promise<PredictionResponse> {
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to predict energy consumption');
    }

    return response.json();
  },
}; 