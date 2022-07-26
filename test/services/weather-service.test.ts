import { ServerLogService, WeatherService } from '../../src';

describe('WeatherService', () => {
  jest.setTimeout(10000);
  ServerLogService.settings.logLevel = -1;
  it('Should calculate the Sun Direction for current time', async () => {
    WeatherService.initialize({
      lattitude: '51.5078011',
      longitude: '7.3301801',
    });
    await new Promise((r) => setTimeout(r, 5000));
    expect(WeatherService.sunDirection).toBeDefined();
    // console.log('Weather Direction for manual test: ', WeatherService.sunDirection);
  });
});
