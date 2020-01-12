import { Component, Input, OnInit } from '@angular/core';
import { Restaurant } from '../../restaurants/restaurant.model';

@Component({
  selector: 'app-card-back',
  templateUrl: './card-back.component.html',
  styleUrls: ['./card-back.component.css'],
})
export class CardBackComponent implements OnInit {
  @Input() restaurant: Restaurant;

  constructor() {}

  ngOnInit() {}
}
