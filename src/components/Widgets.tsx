import React, { useEffect } from 'react';
import Calendar from './Calendar';
import WeatherWidget from './Weather';

const Widgets: React.FC = () => {
  useEffect(() => {
    console.log('Widgets component rendered!');
  }, []);

  return (
    <div className="sticky top-4 space-y-6 border-2 border-red-500 p-2">
      <div style={{color: 'yellow', backgroundColor: 'black', padding: '10px', fontWeight: 'bold'}}>
        WIDGETS COMPONENT
      </div>
      <Calendar />
      <WeatherWidget />
    </div>
  );
};

export default React.memo(Widgets); 