import connectDB from '@/lib/mongodb';
import { resolveUniqueEventSlug } from '@/lib/event-slug';
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
      event.slug = await resolveUniqueEventSlug(event.title);
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

