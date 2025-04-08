import React from 'react';

const Calendar: React.FC = () => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      color: 'black',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h3 style={{color: '#8B5CF6', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold'}}>
        Calendar
      </h3>
      
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
        <button style={{fontSize: '18px'}}>«</button>
        <div>avril 2025</div>
        <button style={{fontSize: '18px'}}>»</button>
      </div>
      
      <div style={{
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '10px',
        textAlign: 'center',
        fontSize: '14px'
      }}>
        <div>LUN</div>
        <div>MAR</div>
        <div>MER</div>
        <div>JEU</div>
        <div>VEN</div>
        <div style={{color: 'red'}}>SAM</div>
        <div style={{color: 'red'}}>DIM</div>
        
        <div>31</div>
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div style={{color: 'red'}}>5</div>
        <div style={{color: 'red'}}>6</div>
        
        <div>7</div>
        <div>8</div>
        <div>9</div>
        <div>10</div>
        <div>11</div>
        <div style={{color: 'red'}}>12</div>
        <div style={{color: 'red'}}>13</div>
        
        <div>14</div>
        <div>15</div>
        <div>16</div>
        <div>17</div>
        <div>18</div>
        <div style={{color: 'red'}}>19</div>
        <div style={{color: 'red'}}>20</div>
        
        <div>21</div>
        <div>22</div>
        <div>23</div>
        <div>24</div>
        <div>25</div>
        <div style={{color: 'red'}}>26</div>
        <div style={{color: 'red'}}>27</div>
        
        <div>28</div>
        <div>29</div>
        <div>30</div>
        <div>1</div>
        <div>2</div>
        <div style={{color: 'red'}}>3</div>
        <div style={{color: 'red'}}>4</div>
      </div>
    </div>
  );
};

export default Calendar; 