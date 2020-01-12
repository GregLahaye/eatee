import { Injectable } from '@angular/core';
import { Restaurant } from './restaurant.model';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GeolocationService } from '../geolocation/geolocation.service';

@Injectable({
  providedIn: 'root',
})
export class RestaurantsService {
  public restaurantChanged = new Subject<Restaurant>();

  private restaurants: Restaurant[] = [];
  private index = 0;
  private radius = 5000;

  constructor(
    private geolocationService: GeolocationService,
    private http: HttpClient
  ) {}

  setRadius(radius: number): void {
    this.radius = radius;
    this.fetchRestaurants();
  }

  fetchRestaurants(): void {
    // get location
    this.geolocationService.getPosition(
      (position: Position) => {
        // create rounded coordinates
        const coords = {
          latitude: position.coords.latitude.toFixed(2),
          longitude: position.coords.longitude.toFixed(2),
        };
        // make request to API
        this.http
          .get<Restaurant[]>('/api/restaurants', {
            params: {
              latitude: coords.latitude,
              longitude: coords.longitude,
              radius: this.radius.toString(),
            },
          })
          .subscribe((restaurants: Restaurant[]) => {
            // set index back to zero
            this.index = 0;
            // shuffle restaurants
            this.restaurants = this.shuffle(restaurants);
            // set distance to false and update distance for each restaurant
            this.restaurants.forEach((restaurant: Restaurant) => {
              restaurant.loaded = false;
              this.updateDistance(restaurant);
            });
            // preload restaurant images
            this.preload();
            // feed new restaurant value
            this.nextRestaurant();
          });
      },
      () => {
        alert('Location access is required for this app to function');
      }
    );
  }

  updateDistance(restaurant: Restaurant): void {
    // get location
    this.geolocationService.getPosition(
      (position: Position) => {
        // calculate distance between user and restaurant
        const distance = this.calculateDistance(
          restaurant.coords,
          position.coords
        );
        // round distance to two decimal places
        const rounded = Math.round(distance * 100) / 100;
        // set distance of restaurant
        restaurant.distance = rounded;
      },
      () => {
        // couldn't get distance, set it to zero
        restaurant.distance = 0;
      }
    );
  }

  previousRestaurant(): void {
    // decrement index, wrapping around if below zero
    this.index = this.mod(this.index - 1, this.restaurants.length);
    // preload restaurant images
    this.preload();
    const restaurant = this.restaurants[this.index];
    // get restaurant from array and feed to subject if not null
    if (restaurant) {
      this.restaurantChanged.next(restaurant);
    }
  }

  nextRestaurant(): void {
    // increment index, wrapping around if above length
    this.index = this.mod(this.index + 1, this.restaurants.length);
    // preload restaurant images
    this.preload();
    // get restaurant from array and feed to subject if not null
    const restaurant = this.restaurants[this.index];
    if (restaurant) {
      this.restaurantChanged.next(restaurant);
    }
  }

  preload(): void {
    // for three restaurants before and after current one
    for (let i = this.index - 3; i <= this.index + 3; i++) {
      // get restaurant from array
      const restaurant = this.restaurants[this.mod(i, this.restaurants.length)];
      // if not already loaded
      if (!restaurant.loaded) {
        // create new HTMLImageElement
        restaurant.image = new Image();

        // set onload listener to set load to true
        restaurant.image.onload = () => {
          restaurant.loaded = true;
        };

        // set restaurant image to photo link
        restaurant.image.src = restaurant.photo;
      }
    }
  }

  // https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
  shuffle(a: any[]): any[] {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
  calculateDistance(src, dst): number {
    const R = 6371; // radius of Earth in kilometres
    const dLat = this.degreesToRadians(dst.latitude - src.latitude);
    const dLon = this.degreesToRadians(dst.longitude - src.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(src.latitude)) *
        Math.cos(this.degreesToRadians(dst.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  }

  degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
  mod(n: number, m: number): number {
    return ((n % m) + m) % m;
  }
}
