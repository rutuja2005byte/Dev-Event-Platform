import mongoose from 'mongoose';

export function generateEventSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function resolveUniqueEventSlug(
  title: string,
  excludeId?: string
): Promise<string> {
  const Event = mongoose.models.Event;
  if (!Event) {
    throw new Error('Event model is not initialized');
  }

  const baseSlug = generateEventSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (
    await Event.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).select('_id')
  ) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}
