import React, { useMemo, useState, useEffect } from 'react'
import { TAirline, TFlight, TSegment } from './types'

import './App.css'

enum OrderingFilter {
  PRICE_ASC, // по возрастанию цены
  PRICE_DESC, // по убыванию цене
  DURATION_ASC, // по времени в пути
}

function App() {
  const [flights, setFlights] = useState<TFlight[]>([])
  const [airlinesFilter, setAirlinesFilter] = useState<string[]>([])
  const [orderingFilter, setOrderingFilter] = useState(OrderingFilter.PRICE_ASC)
  const [stopsFilter, setStopsFilter] = useState<number[]>([])
  const [minPriceFilter, setMinPriceFilter] = useState(0)
  const [maxPriceFilter, setMaxPriceFilter] = useState(1_000_000)
  const [limit, setLimit] = useState(10)

  const airlines = useMemo(() => {
    const airlines = flights.map(flight => flight.flight.carrier)
    const map = new Map()

    for (const airline of airlines) {
      map.set(airline.caption, airline)
    }

    return Array.from(map.values())
  }, [flights])

  const stops = useMemo(() => {
    const stops = flights.map(flight =>
      flight.flight.legs[0].segments.reduce((total, segment) => total + segment.stops, 0)
    )
    return Array.from(new Set(stops))
  }, [flights])

  const filteredFlights = useMemo(() => {
    const filteredFlights = flights.filter(flight => {
      const price = Number(
        flight.flight.price.passengerPrices[0].singlePassengerTotal.amount
      )
      const flightStops = flight.flight.legs[0].segments.reduce(
        (total, segment) => total + segment.stops,
        0
      )

      const airlineCondition =
        airlinesFilter.length > 0
          ? airlinesFilter.includes(flight.flight.carrier.uid)
          : true
      const stopsCondition =
        stopsFilter.length > 0 ? stopsFilter.includes(flightStops) : true
      const priceCondition = minPriceFilter <= price && price <= maxPriceFilter

      return airlineCondition && stopsCondition && priceCondition
    })

    filteredFlights.sort((a, b) => {
      switch (orderingFilter) {
        case OrderingFilter.PRICE_ASC: {
          const aSingle = Number(
            a.flight.price.passengerPrices[0].singlePassengerTotal.amount
          )
          const bSingle = Number(
            b.flight.price.passengerPrices[0].singlePassengerTotal.amount
          )
          return aSingle - bSingle
        }
        case OrderingFilter.PRICE_DESC: {
          const aSingle = Number(
            a.flight.price.passengerPrices[0].singlePassengerTotal.amount
          )
          const bSingle = Number(
            b.flight.price.passengerPrices[0].singlePassengerTotal.amount
          )
          return bSingle - aSingle
        }
        case OrderingFilter.DURATION_ASC: {
          const aDuration = a.flight.legs[0].segments.reduce(
            (total, segment) => total + segment.travelDuration,
            0
          )
          const bDuration = b.flight.legs[0].segments.reduce(
            (total, segment) => total + segment.travelDuration,
            0
          )
          return aDuration - bDuration
        }
      }
    })

    return filteredFlights
  }, [
    flights,
    airlinesFilter,
    orderingFilter,
    stopsFilter,
    minPriceFilter,
    maxPriceFilter,
  ])

  useEffect(() => {
    fetch('flights.json')
      .then(res => res.json())
      // .then(data => setFlights(data.result.flights.slice(0, 2)))
      .then(data => setFlights(data.result.flights))
  }, [])

  return (
    <div className='text-center max-w-4xl mx-auto flex flex-row'>
      <Filters
        airlines={airlines}
        airlinesFilter={airlinesFilter}
        setAirlinesFilter={setAirlinesFilter}
        orderingFilter={orderingFilter}
        setOrderingFilter={setOrderingFilter}
        stops={stops}
        stopsFilter={stopsFilter}
        setStopsFilter={setStopsFilter}
        minPriceFilter={minPriceFilter}
        setMinPriceFilter={setMinPriceFilter}
        maxPriceFilter={maxPriceFilter}
        setMaxPriceFilter={setMaxPriceFilter}
      />

      <div className='min-w-[640px] max-w-[640px]'>
        {filteredFlights.slice(0, limit).map(flight => (
          <Flight key={flight.flightToken} info={flight} />
        ))}

        {filteredFlights.length > limit && (
          <button
            className='border-2 border-solid border-gray-400 bg-stone-300 px-10 my-4 hover:bg-stone-400 transition-colors duration-500'
            onClick={() => setLimit(prevLimit => prevLimit + 10)}
            // disabled={filteredFlights.length <= limit}
          >
            Показать еще
          </button>
        )}
      </div>
    </div>
  )
}

function Filters({
  airlines,
  airlinesFilter,
  setAirlinesFilter,
  orderingFilter,
  setOrderingFilter,
  stops,
  stopsFilter,
  setStopsFilter,
  minPriceFilter,
  setMinPriceFilter,
  maxPriceFilter,
  setMaxPriceFilter,
}: {
  airlines: TAirline[]
  airlinesFilter: string[]
  setAirlinesFilter: React.Dispatch<React.SetStateAction<string[]>>
  orderingFilter: OrderingFilter
  setOrderingFilter: React.Dispatch<React.SetStateAction<OrderingFilter>>
  stops: number[]
  stopsFilter: number[]
  setStopsFilter: React.Dispatch<React.SetStateAction<number[]>>
  minPriceFilter: number
  setMinPriceFilter: React.Dispatch<React.SetStateAction<number>>
  maxPriceFilter: number
  setMaxPriceFilter: React.Dispatch<React.SetStateAction<number>>
}) {
  return (
    <div className='w-xl mr-6 text-left mt-4'>
      <h4 className='font-bold'>Сортировать</h4>
      <div className='flex flex-col mt-2'>
        <label>
          <input
            type='radio'
            name='price-radio-filter'
            checked={orderingFilter === OrderingFilter.PRICE_ASC}
            onChange={() => setOrderingFilter(OrderingFilter.PRICE_ASC)}
          />{' '}
          - по возрастанию цены
        </label>
        <label>
          <input
            type='radio'
            name='price-radio-filter'
            checked={orderingFilter === OrderingFilter.PRICE_DESC}
            onChange={() => setOrderingFilter(OrderingFilter.PRICE_DESC)}
          />{' '}
          - по убыванию цене{' '}
        </label>
        <label>
          <input
            type='radio'
            name='price-radio-filter'
            checked={orderingFilter === OrderingFilter.DURATION_ASC}
            onChange={() => setOrderingFilter(OrderingFilter.DURATION_ASC)}
          />{' '}
          - по времени в пути
        </label>
      </div>
      <div className='flex flex-col mt-6'>
        <h4 className='font-bold' title='This fitler does not make sense'>
          Фильтровать
        </h4>
        <div className='mt-2'>
          {stops.map(stop => (
            <label className='flex items-center' key={stop}>
              <input
                type='checkbox'
                checked={stopsFilter.includes(stop)}
                onChange={e => {
                  setStopsFilter(prevStops => {
                    if (e.target.checked) {
                      return [...prevStops, stop]
                    } else {
                      return prevStops.filter(s => s !== stop)
                    }
                  })
                }}
              />
              <span className='ml-1'>
                -{' '}
                {stop === 0
                  ? 'без пересадок'
                  : `${stop} ${getText('пересадка', 'пересадок', stop)}`}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div className='mt-6'>
        <h4 className='font-bold'>Цена</h4>
        <div className='mt-2'>
          <div className='flex flex-row'>
            <span className='mr-1'>От</span>
            <input
              className='border-2 border-gray-400 rounded pl-1'
              type='number'
              step={2500}
              // min={0}
              max={1_000_000}
              value={minPriceFilter}
              onChange={e => setMinPriceFilter(Number(e.target.value))}
            />
          </div>
          <div className=' flex flex-row mt-5'>
            <span className='mr-1'>До</span>
            <input
              className='border-2 border-gray-400 rounded  pl-1'
              type='number'
              step={2500}
              // min={0}
              max={1_000_000}
              value={maxPriceFilter}
              onChange={e => setMaxPriceFilter(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
      <div className='mt-6'>
        <h4 className='font-bold'>Авиакомпании</h4>
        {airlines.map(air => (
          <label className='block' key={air.uid}>
            <input
              type='checkbox'
              checked={airlinesFilter.includes(air.uid)}
              onChange={e =>
                setAirlinesFilter(prevFilter => {
                  if (e.target.checked) {
                    return [...prevFilter, air.uid]
                  } else {
                    return prevFilter.filter(uid => uid !== air.uid)
                  }
                })
              }
            />
            <span className='ml-2'>{air.caption}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function formatDuration(duration: number): string {
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60
  return `${hours} ч ${minutes} мин`
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  // const month = new Intl.DateTimeFormat('ru', { month: 'short' }).format(date)
  // const day = date.getDate()
  // const dayOfWeek = new Intl.DateTimeFormat('ru', { weekday: 'short' }).format(date)
  // const datePart = `${day} ${month} ${dayOfWeek}`
  // return reversed ? datePart + ' ' + timePart : timePart + ' ' + datePart
  return `${hours}:${minutes}`
}

function formatDateDay(dateStr: string): string {
  const date = new Date(dateStr)
  const dayOfWeek = new Intl.DateTimeFormat('ru', { weekday: 'short' }).format(date)
  const day = date.getDate()
  const month = new Intl.DateTimeFormat('ru', { month: 'short' }).format(date)
  return `${day} ${month} ${dayOfWeek}`
}

function getText(singular: string, plural: string, count: number): string {
  return count === 1 ? singular : plural
}

function Segment({ segment }: { segment: TSegment }) {
  return (
    <div className='bg-white'>
      <div className='border-b-2 border-b-gray-200 text-left px-2 py-2'>
        {segment.departureCity.caption} {segment.departureAirport.caption + ' '}
        <span className='text-sky-400'>{'(' + segment.departureAirport.uid + ')'}</span>
        &#8594;{' '}
        <span>
          {segment.arrivalCity?.caption ?? 'UNKNOWN'} {segment.arrivalAirport.caption}{' '}
          <span className='text-sky-400'>{'(' + segment.arrivalAirport.uid + ')'}</span>
        </span>
      </div>

      <div className='flex gap-20 justify-center py-2 border-b-2 border-b-gray-200'>
        <div>
          {formatTime(segment.departureDate)}{' '}
          <span className='text-sky-400'>{formatDateDay(segment.departureDate)}</span>
        </div>
        &#9719; {formatDuration(segment.travelDuration)}
        <div>
          <span className='text-sky-400'>{formatDateDay(segment.arrivalDate)}</span>{' '}
          {formatTime(segment.arrivalDate)}
        </div>
      </div>
      <div className='relative'>
        <div className='h-px bg-gray-400'></div>
        <div className='absolute -top-[13px] left-1/2 -translate-x-1/2 bg-white px-2'>
          {segment.stops} {getText('пересадка', 'пересадок', segment.stops)}
        </div>
      </div>

      <div className='text-left px-2 py-2'>Рейс выполняет: {segment.airline.caption}</div>
    </div>
  )
}

function Flight({ info }: { info: TFlight }) {
  const { singlePassengerTotal } = info.flight.price.passengerPrices[0]
  const [first, back] = info.flight.legs

  return (
    <div>
      <div className='bg-sky-500 mt-4'>
        <div className='flex justify-center items-center'>
          <div className='flex flex-grow text-white font-bold px-2'>
            {info.flight.carrier.caption}
          </div>
          <div className='text-right px-2'>
            <div className='text-white'>
              {singlePassengerTotal.amount} {singlePassengerTotal.currencyCode}
              <small className='block'>Стоимость для одного пассажира</small>
            </div>
          </div>
        </div>

        {first.segments.map((segment, i, array) => (
          <React.Fragment key={i}>
            <Segment segment={segment} />
            {i !== array.length - 1 && <div className='h-1 bg-sky-600' />}
          </React.Fragment>
        ))}

        <button className='bg-orange-400 w-full font-bold text-white hover:bg-orange-500 transition-colors duration-500 py-1'>
          ВЫБРАТЬ
        </button>
        {/* {back.segments.map((segment, i, array) => (
          <React.Fragment key={i}>
            <Segment segment={segment} />
            {i !== array.length - 1 && <div className='h-1 bg-sky-600' />}
          </React.Fragment>
        ))} */}
      </div>
    </div>
  )
}

export default App
