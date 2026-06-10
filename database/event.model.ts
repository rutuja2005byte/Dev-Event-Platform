import {
  Schema,
  model,
  models,
  HydratedDocument,
  Model,
} from 'mongoose';

export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = HydratedDocument<IEvent>;

const REQUIRED_STRING_FIELDS = [
  'title',
  'description',
  'overview',
  'image',
  'venue',
  'location',
  'date',
  'time',
  'mode',
  'audience',
  'organizer',
] as const satisfies readonly (keyof IEvent)[];

/** Converts a title into a URL-friendly slug. */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Parses a date string and returns the ISO 8601 date portion (YYYY-MM-DD). */
function normalizeDate(dateStr: string): string {
  const parsed = new Date(dateStr.trim());

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date format: "${dateStr}"`);
  }

  return parsed.toISOString().split('T')[0];
}

/** Normalizes time strings to a consistent HH:MM format (24-hour). */
function normalizeTime(timeStr: string): string {
  const trimmed = timeStr.trim();

  const rangeMatch = trimmed.match(
    /^(\d{1,2}):(\d{2})\s*(?:–|-|to)\s*(\d{1,2}):(\d{2})(?:\s*[A-Z]{2,4})?$/i
  );

  if (rangeMatch) {
    const [, startH, startM, endH, endM] = rangeMatch;
    const pad = (h: string) => h.padStart(2, '0');
    return `${pad(startH)}:${startM} – ${pad(endH)}:${endM}`;
  }

  const singleMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?:\s*[A-Z]{2,4})?$/i);

  if (singleMatch) {
    return `${singleMatch[1].padStart(2, '0')}:${singleMatch[2]}`;
  }

  // Preserve descriptive times (e.g. "All day") with trimmed whitespace
  return trimmed.replace(/\s+/g, ' ');
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: { type: [String], required: true },
    organizer: { type: String, required: true, trim: true },
    tags: { type: [String], required: true },
  },
  { timestamps: true }
);

eventSchema.index({ slug: 1 }, { unique: true });

eventSchema.pre('save', function () {
  // Ensure required string fields are present and non-empty
  for (const field of REQUIRED_STRING_FIELDS) {
    const value = this[field];
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`${field} is required and cannot be empty`);
    }
  }

  if (!Array.isArray(this.agenda) || this.agenda.length === 0) {
    throw new Error('agenda must contain at least one item');
  }

  if (this.agenda.some((item) => typeof item !== 'string' || !item.trim())) {
    throw new Error('agenda items cannot be empty');
  }

  if (!Array.isArray(this.tags) || this.tags.length === 0) {
    throw new Error('tags must contain at least one item');
  }

  if (this.tags.some((tag) => typeof tag !== 'string' || !tag.trim())) {
    throw new Error('tags cannot be empty');
  }

  // Regenerate slug only when the title changes (includes new documents)
  if (this.isModified('title')) {
    this.slug = generateSlug(this.title);
  }

  if (!this.slug) {
    throw new Error('slug could not be generated from title');
  }

  // Normalize date to ISO format and time to a consistent representation
  this.date = normalizeDate(this.date);
  this.time = normalizeTime(this.time);
});

export const Event: Model<IEvent> =
  (models.Event as Model<IEvent>) || model<IEvent>('Event', eventSchema);
