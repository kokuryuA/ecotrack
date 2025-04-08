import React from 'react';

const WeatherWidget: React.FC = () => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      color: 'black',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h3 style={{color: '#8B5CF6', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold'}}>
        Weather
      </h3>
      
      <div style={{textAlign: 'center', marginBottom: '20px'}}>
        <div style={{fontSize: '48px', fontWeight: 'bold', marginBottom: '5px'}}>14°C</div>
        <div style={{color: '#666'}}>Clear</div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        backgroundColor: '#f8f8f8',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <div>
          <div style={{color: '#666'}}>Humidity: 35%</div>
        </div>
        <div>
          <div style={{color: '#666'}}>Wind: 3 m/s</div>
        </div>
        <div>
          <div style={{color: '#666'}}>Cloud Cover: 0%</div>
        </div>
        <div>
          <div style={{color: '#666'}}>Rain Chance: 0%</div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget; 