export class Restaurant {
  public name: string;
  public address: string;
  public photo: string;
  public coords: Coordinates;
  public distance: number;
  public price: number;
  public rating: number;
  public link: string;
  public loaded: boolean;
  public image: HTMLImageElement;

  constructor(
    name: string,
    address: string,
    photo: string,
    coords: Coordinates,
    price: number,
    rating: number,
    link: string
  ) {
    this.name = name;
    this.address = address;
    this.photo = photo;
    this.coords = coords;
    this.distance = null;
    this.price = price;
    this.rating = rating;
    this.link = link;
    this.loaded = false;
    this.image = null;
  }
}
