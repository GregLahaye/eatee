import { Component, OnInit } from '@angular/core';
import { RestaurantsService } from '../restaurants/restaurants.service';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css'],
})
export class OptionsComponent implements OnInit {
  constructor(private restaurantsService: RestaurantsService) {}

  ngOnInit() {}

  setRadius(value) {
    this.restaurantsService.setRadius(value);
  }
}
