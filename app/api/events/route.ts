import connectDB from '@/lib/mongodb';
import { getErrorMessage, parseFormArrayField } from '@/lib/parse-form-array';
import { resolveEventImage } from '@/lib/upload-image';
import { NextRequest, NextResponse } from 'next/server';
import Event from '@/database/event.model';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();

    const event: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (key === 'image') continue;
      const cleanKey = key.replace(/\*$/, '').trim();
      event[cleanKey] = value;
    }

    event.image = await resolveEventImage(formData.get('image'));

    if (typeof event.mode === 'string') {
      event.mode = event.mode.toLowerCase().trim();
    }

    if (typeof event.agenda === 'string') {
      event.agenda = parseFormArrayField(event.agenda);
    }

    if (typeof event.tags === 'string') {
      event.tags = parseFormArrayField(event.tags);
    }

    if (typeof event.title === 'string') {
      const existingEvent = await Event.findOne({
        title: { $regex: new RegExp(`^${event.title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      }).select('_id');

      if (existingEvent) {
        return NextResponse.json(
          { message: 'An event with this title already exists' },
          { status: 409 }
        );
      }
    }

    const createdEvent = await Event.create(event);

    return NextResponse.json(
      { message: 'Event created successfully', event: createdEvent },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/events]', error);
    const message = getErrorMessage(error);

    return NextResponse.json(
      { message: 'Event Creation Failed', error: message },
      { status: 400 }
    );
  }
}

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Events fetched successfully', events }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: 'Event fetching failed', error: e }, { status: 500 });
    }
}