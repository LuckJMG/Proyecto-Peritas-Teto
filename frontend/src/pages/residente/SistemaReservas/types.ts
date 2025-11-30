export interface ReservationView {
  id: string;
  type: string;
  timeRange: string;
  price: number;
  rawDate: Date;
  status: string;
}

export interface DateGroup {
  date: string;
  items: ReservationView[];
}
