const API_URL = import.meta.env.VITE_API_URL || 'https://ecotrack-api-uw71.onrender.com';

export const energyApi = {
  async predictEnergyConsumption(data: PredictionData): Promise<PredictionResponse> {
    console.log('Sending prediction request with data:', data);
    
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(`Failed to predict energy consumption: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },
}; 