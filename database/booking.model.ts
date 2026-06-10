import {
  Schema,
  model,
  models,
  HydratedDocument,
  Model,
  Types,
} from 'mongoose';
import { Event } from './event.model';

export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingDocument = HydratedDocument<IBooking>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validates email format before persisting. */
function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => isValidEmail(value),
        message: 'Invalid email format',
      },
    },
  },
  { timestamps: true }
);

bookingSchema.index({ eventId: 1 });

bookingSchema.pre('save', async function () {
  if (!this.email || !isValidEmail(this.email)) {
    throw new Error('email is required and must be a valid email address');
  }

  // Verify the referenced event exists before saving the booking
  const event = await Event.findById(this.eventId);

  if (!event) {
    throw new Error(`Event with id "${this.eventId}" does not exist`);
  }
});

export const Booking: Model<IBooking> =
  (models.Booking as Model<IBooking>) ||
  model<IBooking>('Booking', bookingSchema);
