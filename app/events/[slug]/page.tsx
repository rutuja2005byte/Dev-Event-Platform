import {notFound} from "next/navigation";
import Image from "next/image";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }>}) => {
    const { slug } = await params;
    const request = await fetch(`${BASE_URL}/api/events/${slug}`);
    const { event : { description, image, overview, date, time, location, mode, agenda, audience, tags}} = await request.json();

    if(!description) return notFound();

    return (
        
    )
}

export default EventDetailsPage;