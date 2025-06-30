import React from 'react';
import './ItineraryCard.css';

const ItineraryCard = ({ city, data }) => {
  if (data.error) {
    return <div className="city-card minimal error">{data.error}</div>;
  }
  return (
    <div className="city-card minimal">
      <div className="city-header minimal">
        <span className="city-name minimal">{city.charAt(0).toUpperCase() + city.slice(1)}</span>
        <span className={`dining-style minimal ${data.diningStyle}`}>{data.diningStyle === 'outdoor' ? '🌳 Outdoor' : '🏠 Indoor'}</span>
      </div>
      <div className="weather-section minimal">
        <span className="weather-icon minimal" role="img" aria-label="weather">🌤️</span>
        <span className="weather-text minimal">{data.weather}</span>
      </div>
      <div className="dishes-section minimal">
        <ul className="dishes-list minimal">
          {data.dishes && data.dishes.map((dish) => (
            <li key={dish} className="dish-item minimal">{dish}</li>
          ))}
        </ul>
      </div>
      <div className="restaurants-section minimal">
        {data.restaurants && Object.entries(data.restaurants).map(([dish, rests]) => (
          <div key={dish} className="restaurant-group minimal">
            <div className="restaurant-dish minimal">{dish}</div>
            <ul className="restaurant-list minimal">
              {rests && rests.length ? rests.map((rest, idx) => (
                <li key={rest.name + idx} className="restaurant-item minimal">
                  <span className="rest-name minimal">{rest.name}</span>
                  <span className="rest-rating minimal">{rest.rating}</span>
                  <span className="rest-address minimal">{rest.address}</span>
                </li>
              )) : <li className="restaurant-item minimal">No data</li>}
            </ul>
          </div>
        ))}
      </div>
      <div className="itinerary-section minimal">
        <ul className="itinerary-list minimal">
          <li><span className="meal-label minimal">Breakfast:</span> {data.itinerary.breakfast}</li>
          <li><span className="meal-label minimal">Lunch:</span> {data.itinerary.lunch}</li>
          <li><span className="meal-label minimal">Dinner:</span> {data.itinerary.dinner}</li>
        </ul>
      </div>
    </div>
  );
};

export default ItineraryCard; 