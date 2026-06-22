export type CalendarEvent = {
    id: number
    title: string
    performer: string
    start: Date
    end: Date
    seats: {
        sold: number
        comp: number
        capacity: number
    }
    time: string
    status: string
    cancelled: boolean
    location: string
}

export const locations: string[] = ['Standupmedia', 'Venue B', 'Venue C']
export const events: CalendarEvent[] = [
  {
    id: 1,
    title: 'Billy Anderson',
    performer: 'Billy Anderson',
    start: new Date(2026, 6, 2, 19, 0),
    end: new Date(2026, 6, 2, 21, 0),
    seats: { sold: 0, comp: 0, capacity: 70 },
    time: '7:00PM',
    status: 'd',
    cancelled: false,
    location: 'Standupmedia',
  },
  {
    id: 2,
    title: 'Billy Anderson',
    performer: 'Billy Anderson',
    start: new Date(2026, 6, 3, 19, 0),
    end: new Date(2026, 6, 3, 21, 0),
    seats: { sold: 0, comp: 0, capacity: 70 },
    time: '7:00PM',
    status: 'd',
    cancelled: false,
    location: 'Standupmedia',
  },
  {
    id: 3,
    title: 'Billy Anderson',
    performer: 'Billy Anderson',
    start: new Date(2026, 6, 3, 22, 0),
    end: new Date(2026, 6, 3, 23, 30),
    seats: { sold: 0, comp: 0, capacity: 350 },
    time: '10:00PM',
    status: 'd',
    cancelled: false,
    location: 'Standupmedia',
  },
  {
    id: 4,
    title: 'World Series of Comedy',
    performer: 'World Series of Comedy',
    start: new Date(2026, 6, 14, 19, 0),
    end: new Date(2026, 6, 14, 21, 0),
    seats: { sold: 0, comp: 0, capacity: 300 },
    time: '7:00PM',
    status: 'd',
    cancelled: false,
    location: 'Standupmedia',
  },
  {
    id: 5,
    title: 'World Series of Comedy',
    performer: 'World Series of Comedy',
    start: new Date(2026, 6, 15, 19, 0),
    end: new Date(2026, 6, 15, 21, 0),
    seats: { sold: 0, comp: 0, capacity: 300 },
    time: '7:00PM',
    status: 'd',
    cancelled: false,
    location: 'Standupmedia',
  },
  {
    id: 6,
    title: 'World Series of Comedy',
    performer: 'World Series of Comedy',
    start: new Date(2026, 6, 16, 19, 0),
    end: new Date(2026, 6, 16, 21, 0),
    seats: { sold: 0, comp: 0, capacity: 300 },
    time: '7:00PM',
    status: 'd',
    cancelled: false,
    location: 'Standupmedia',
  },
  {
    id: 7,
    title: 'World Series of Comedy',
    performer: 'World Series of Comedy',
    start: new Date(2026, 6, 16, 21, 30),
    end: new Date(2026, 6, 16, 23, 0),
    seats: { sold: 0, comp: 0, capacity: 300 },
    time: '9:30PM',
    status: 'd',
    cancelled: false,
    location: 'Standupmedia',
  },
  {
    id: 8,
    title: 'Kevin McDonald',
    performer: 'Kevin McDonald',
    start: new Date(2026, 6, 30, 19, 0),
    end: new Date(2026, 6, 30, 21, 0),
    seats: { sold: 0, comp: 0, capacity: 300 },
    time: '7:00PM',
    status: 'd',
    cancelled: false,
    location: 'Standupmedia',
  },
  {
    id: 9,
    title: 'Kevin McDonald',
    performer: 'Kevin McDonald',
    start: new Date(2026, 6, 30, 21, 30),
    end: new Date(2026, 6, 30, 23, 0),
    seats: { sold: 0, comp: 0, capacity: 300 },
    time: '9:30PM',
    status: 'd',
    cancelled: false,
    location: 'Standupmedia',
  },
  {
    id: 10,
    title: 'Kevin McDonald',
    performer: 'Kevin McDonald',
    start: new Date(2026, 6, 31, 18, 0),
    end: new Date(2026, 6, 31, 20, 0),
    seats: { sold: 0, comp: 0, capacity: 300 },
    time: '6:00PM',
    status: 'd',
    cancelled: true,
    location: 'Standupmedia',
  },
]