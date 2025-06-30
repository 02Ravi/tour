import React, { useState } from 'react';
import './App.css';
import { Spin, Modal, Button } from 'antd';
import { CloudOutlined, SunOutlined, StarFilled, CoffeeOutlined, ShopOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';

function CityResult({ city, data }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);

  if (data.error) {
    return <div className="city-outer-block"><div className="city-card minimal error">{data.error}</div></div>;
  }
  const isSunny = data.weather && data.weather.toLowerCase().includes('sunny');
  return (
    <div className="city-outer-block">
      <div className="city-horizontal-block minimal">
        <div className="city-header minimal" style={{ justifyContent: 'center', marginBottom: 16, gap: 10 }}>
          <EnvironmentOutlined style={{ color: '#6366f1', fontSize: 28, marginRight: 6 }} />
          <span className="city-name minimal" style={{ color: '#22223b', fontWeight: 700, fontSize: 22 }}>{city.charAt(0).toUpperCase() + city.slice(1)}</span>
        </div>
        <div className="weather-center minimal">
          {isSunny ? <SunOutlined style={{ color: '#fbbf24', fontSize: 32, marginRight: 8 }} /> : <CloudOutlined style={{ color: '#60a5fa', fontSize: 32, marginRight: 8 }} />}
          <span className="weather-text minimal" style={{ fontSize: 20, color: '#334155', fontWeight: 500 }}>{data.weather}</span>
        </div>
        <div className="city-block-row">
          <div className="custom-block">
            <div className="block-title" style={{ color: '#64748b' }}><ShopOutlined style={{ color: '#64748b', marginRight: 6 }} />Dishes</div>
            <div className="block-desc">Discover the must-try local dishes. Use the button to view top restaurants for each dish.</div>
            <ul className="dishes-list vertical-dishes-list">
              {data.dishes && data.dishes.map((dish) => (
                <li key={dish} className="dish-item-vertical">
                  <span className="dish-name" style={{ color: '#22223b' }}>{dish}</span>
                  <Button type="primary" size="small" style={{ background: '#6366f1', borderColor: '#6366f1' }} onClick={() => { setSelectedDish(dish); setModalOpen(true); }}>
                    View Top Restaurants
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          <div className="custom-block plan-block">
            <div className="plan-title" style={{ color: '#6366f1' }}><CalendarOutlined style={{ color: '#6366f1', marginRight: 6 }} />Plan of Day</div>
            <div className="block-desc">Your personalized meal itinerary for the day in <span style={{ color: '#6366f1', fontWeight: 600 }}>{city.charAt(0).toUpperCase() + city.slice(1)}</span>.</div>
            {data.itinerary && data.itinerary.summary && (
              <div className="plan-summary">{data.itinerary.summary}</div>
            )}
            <ul className="itinerary-list minimal">
              <li><span className="meal-label minimal"><CoffeeOutlined style={{ color: '#6366f1', marginRight: 8 }} />Breakfast:</span> {data.itinerary.breakfast}</li>
              <li><span className="meal-label minimal"><ShopOutlined style={{ color: '#6366f1', marginRight: 8 }} />Lunch:</span> {data.itinerary.lunch}</li>
              <li><span className="meal-label minimal"><StarFilled style={{ color: '#fbbf24', marginRight: 8 }} />Dinner:</span> {data.itinerary.dinner}</li>
            </ul>
          </div>
        </div>
        <Modal
          open={modalOpen}
          onCancel={() => { setModalOpen(false); setSelectedDish(null); }}
          title={selectedDish ? `Top Restaurants for ${selectedDish}` : ''}
          footer={null}
        >
          {selectedDish && data.restaurants && data.restaurants[selectedDish] && data.restaurants[selectedDish].length ? (
            <ul className="restaurant-list minimal">
              {data.restaurants[selectedDish].map((rest, idx) => (
                <li key={rest.name + idx} className="restaurant-item minimal">
                  <span className="rest-name minimal">{rest.name}</span>
                  <span className="rest-rating minimal"><StarFilled style={{ color: '#fbbf24', marginRight: 2 }} />{rest.rating}</span>
                  <span className="rest-address minimal">{rest.address}</span>
                </li>
              ))}
            </ul>
          ) : <div>No restaurants found for this dish.</div>}
        </Modal>
      </div>
    </div>
  );
}

function App() {
  const [cities, setCities] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cities: cities.split(',').map(c => c.trim()).filter(Boolean) }),
      });
      if (!res.ok) throw new Error('Failed to fetch itinerary');
      const data = await res.json();
      setResult(data);
      setCities('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <h1 className="main-title minimal" style={{ color: '#6366f1', letterSpacing: 1 }}>Itinerary Planner</h1>
        <form onSubmit={handleSubmit} className="city-form minimal">
          <input
            type="text"
            value={cities}
            onChange={e => setCities(e.target.value)}
            placeholder="Enter cities, comma separated"
            className="city-input minimal"
          />
          <button type="submit" className="submit-btn minimal" disabled={loading}>
            Plan
          </button>
        </form>
      </header>
      <div className="app-body">
        {loading && <div style={{ textAlign: 'center', margin: '32px 0' }}><Spin size="large" /></div>}
        {error && <div className="error minimal">{error}</div>}
        <div className="itinerary-list minimal">
          {result && Object.entries(result).map(([city, data]) => (
            <CityResult key={city} city={city} data={data} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
