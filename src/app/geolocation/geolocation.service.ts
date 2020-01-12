import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  constructor() {}

  getPosition(successCallback, errorCallback) {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  }
}
