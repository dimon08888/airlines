type Passenger = {
  caption: string
  uid: string
}

type PassengerTotal = {
  amount: string
  currency: string
  currencyCode: string
}

type PassengerPrice = {
  passengerCount: number
  passengerType: Passenger
  singlePassengerTotal: PassengerTotal
}

type Airport = {
  uid: string
  caption: string
}

type City = {
  uid: string
  caption: string
}

type Aircraft = {
  uid: string
  caption: string
}

export type TAirline = {
  uid: string
  caption: string
  airlineCode: string
}

export type TSegment = {
  aircraft: Aircraft
  airline: TAirline
  arrivalAirport: Airport
  arrivalCity?: City
  arrivalDate: string
  departureAirport: Airport
  departureCity: City
  departureDate: string
  travelDuration: number
  stops: number
}

type Leg = {
  duration: number
  segments: TSegment[]
}

export type TFlight = {
  flight: {
    carrier: TAirline
    legs: Leg[]
    price: {
      passengerPrices: PassengerPrice[]
    }
  }
  flightToken: string
}
