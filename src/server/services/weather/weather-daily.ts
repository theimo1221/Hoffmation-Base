import { WeatherFeelsLike } from 'index';
import { WeatherItem } from 'index';
import { WeatherTemp } from 'index';

export interface WeatherDaily {
  dt: number;
  sunrise: number;
  sunset: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_deg: number;
  clouds: number;
  pop: number;
  rain?: number;
  snow?: number;
  uvi: number;
  temp: WeatherTemp;
  feels_like: WeatherFeelsLike;
  weather: WeatherItem[];
}
