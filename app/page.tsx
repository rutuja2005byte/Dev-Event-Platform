import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import { getFeaturedEvents } from "@/lib/events";
import { connection } from "next/server";

const page = async () => {
  await connection();
  const events = await getFeaturedEvents();

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can&apos;t Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetup, and Conferences , All in One Place
      </p>

      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        <ul className="events list-none p-0 m-0">
          {events.length > 0 && events.map((event) => (
            <li key={event.slug} className="list-none">
              <EventCard
                title={event.title}
                image={event.image}
                slug={event.slug}
                location={event.location}
                date={event.date}
                time={event.time}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default page;
