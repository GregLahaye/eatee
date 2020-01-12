import { Component, Input, OnInit } from '@angular/core';
import { Restaurant } from '../../restaurants/restaurant.model';

@Component({
  selector: 'app-card-front',
  templateUrl: './card-front.component.html',
  styleUrls: ['./card-front.component.css'],
})
export class CardFrontComponent implements OnInit {
  @Input() restaurant: Restaurant;

  constructor() {}

  ngOnInit() {}
}
