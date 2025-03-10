import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import './App.css'

interface City {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state: string;
}

interface Weather {
  list: Array<any>; 
  city: any;
}

function App() {
  const [text, setText] = useState('');
  const [useMetric, setUseMetric] = useState(true);
  const [cities, setCities] = useState<City[] | null>(null);
  const [forecast, setForecast] = useState<Weather | null>(null);
  const [error, setError] = useState<string | null>(null);
  const apiKey = "3fbb0bf0732c3b8252761325091fb79a";
  const [graphData, setGraphData] = useState<any[]>([]);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("event.target.value", event.target.value)
    setText(event.target.value);
    console.log("setText", text)
  };

  const fetchCities = async () => {
    if (!text.trim()) return;

    setForecast(null);
    
    setError(null);
  
    const apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${text}&limit=10&appid=${apiKey}`;
    console.log("API URL:", apiUrl);
  
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Erro ao buscar dados");
      }
      const result: City[] = await response.json();
      console.log(`result from fetchCities ${result}`)
      setCities(result);
      console.log("Resultado da API:", result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
    }
  };
  
  const fetchWeather = async (lat: number, lon: number) => {
  if (!text.trim()) return;
  
  setGraphData([]);

  setError(null);

  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=40&units=${useMetric ? 'metric' : 'imperial'}&appid=${apiKey}`;
  
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Erro ao buscar dados");
    }

    const result: Weather = await response.json();
    setForecast(result);

    const updatedGraphData = result.list
      .filter((_, index) => index % 8 === 0)
      .map(item => ({
        dayOfMonth: new Date(item.dt * 1000).getDate(),
        temp: item.main.temp
      }));

    setGraphData(updatedGraphData);

  } catch (err) {
    setError(err instanceof Error ? err.message : "Erro desconhecido");
  } finally {
  }
};

  const convertUnits = () => {
    setUseMetric((prev) => !prev);
  };

  useEffect(() => {
    if (!forecast) return;
    fetchWeather(forecast.city.coord.lat, forecast?.city.coord.lon);
  }, [useMetric]);

  return (
    <div className="container">

      <div className="title">
        <h1>🌤️ Meteorologia</h1>
      </div>

      <div className="input-bar">
        <input
          placeholder="Insira o nome de uma cidade"
          type="text"
          value={text}
          onChange={handleTextChange}
        />

        <button className="search-btn" onClick={fetchCities}>
          Pesquisar
        </button>

        <button className="metric-btn" onClick={convertUnits}>
          Mudar para º{useMetric ? "F" : "C"}
        </button>
        
        <button className="source-btn" onClick={() => window.open("https://github.com/PpedroO7/WIT-Challange", "_blank")}>
          Código fonte
        </button>

      </div>
  
      {error && <p style={{ color: "red" }}>Erro: {error}</p>}
  
      <div className="result">
        
        {cities && (
          <div className="cities">
            <ul>
              {cities.map((city, index) => (
                <li key={index}>
                  <button onClick={() => fetchWeather(city.lat, city.lon)}>
                    {city.name}, {city.state ? `${city.state},` : ``} {city.country}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="forecast">
          {forecast && (
            <div className="forecast-info">

              <div className="forecast-list">
                <h2>Previsão para os próximos dias</h2>
                <ul>
                  {forecast.list
                    .filter((_, index) => index % 8 === 0)
                    .map((day, index) => (
                      <li key={index}>
                        <span>
                          {new Date(day.dt * 1000).toLocaleDateString("pt-PT")}<br></br>
                          {day.main.temp}º{useMetric ? "C" : "F"}
                        </span>
                        <img
                          src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                          alt="icon"
                          width={50}
                          height={50}
                        />
                      </li>
                    ))}
                </ul>
              </div>

              <div className='forecast-graph'>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dayOfMonth" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="temp" stroke="#ff7300" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className='weather-map'>
                <iframe 
                          src={`https://openweathermap.org/weathermap?basemap=map&cities=true&layer=temperature&lat=${forecast.city.coord.lat}&lon=${forecast.city.coord.lon}&zoom=50&units=imperial`} 
                          width="100%" 
                          height="100%">
                </iframe>
              </div>
            </div>
          )}
        </div>
      </div>  
    </div>
  );
  
}

export default App;

