'use server';

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectDB();
        const event = await Event.findOne({ slug });

    } catch {
        return [];
    }
}