import connectDB from '@/lib/mongodb';
import Event from '@/database/event.model';

export type EventCardData = {
  id: string;
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
};

function toEventCardData(event: {
  _id: unknown;
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}): EventCardData {
  return {
    id: String(event._id),
    title: event.title,
    image: event.image,
    slug: event.slug,
    location: event.location,
    date: event.date,
    time: event.time,
  };
}

export async function getEvents(): Promise<EventCardData[]> {
  await connectDB();

  const events = await Event.find().sort({ createdAt: -1 }).lean();

  return events.map(toEventCardData);
}

export async function getFeaturedEvents(limit = 3): Promise<EventCardData[]> {
  await connectDB();

  const events = await Event.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: { $toLower: '$title' },
        doc: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$doc' } },
    { $sort: { createdAt: -1 } },
    { $limit: limit },
  ]);

  return events.map(toEventCardData);
}
