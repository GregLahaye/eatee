import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { Restaurant } from '../restaurants/restaurant.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent implements OnInit, OnDestroy {
  public restaurant: Restaurant;
  public front = true;

  private restaurantChangedSubscription: Subscription;

  constructor(private restaurantsService: RestaurantsService) {}

  ngOnInit() {
    this.restaurantChangedSubscription = this.restaurantsService.restaurantChanged.subscribe(
      (restaurant: Restaurant) => {
        this.front = true;
        this.restaurant = restaurant;
      }
    );

    this.restaurantsService.fetchRestaurants();
  }

  @HostListener('tap', ['$event'])
  click(event) {
    if (event.target.tagName !== 'A') {
      // only flip card if not clicking a link element
      this.front = !this.front;
    }
  }

  @HostListener('swiperight')
  swipeRight() {
    this.restaurantsService.previousRestaurant();
  }

  @HostListener('swipeleft')
  swipeLeft() {
    this.restaurantsService.nextRestaurant();
  }

  @HostListener('window:keydown', ['$event'])
  keydown(event) {
    switch (event.code) {
      case 'KeyD':
      case 'ArrowRight':
      case 'KeyL':
        this.restaurantsService.nextRestaurant();
        break;
      case 'KeyA':
      case 'KeyJ':
      case 'ArrowLeft':
        this.restaurantsService.previousRestaurant();
        break;
      case 'Space':
      case 'ArrowUp':
      case 'ArrowDown':
      case 'KeyW':
      case 'KeyS':
      case 'KeyI':
      case 'KeyK':
        this.front = !this.front;
        break;
    }
  }

  ngOnDestroy() {
    this.restaurantChangedSubscription.unsubscribe();
  }
}
