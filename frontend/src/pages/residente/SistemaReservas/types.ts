export interface ReservationView {
  id: string;
  type: string;
  timeRange: string;
  price: number;
  rawDate: Date;
}

export interface DateGroup {
  date: string;
  items: ReservationView[];
}
