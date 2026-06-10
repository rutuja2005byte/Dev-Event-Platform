import Link from "next/link";
import Image from "next/image";

interface Props {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

const EventCard = ({ title, image, slug, location, date, time }: Props) => {
  return (
    <Link href={`/events/${slug}`} className="event-card flex flex-col gap-2">
      <Image
        src={image}
        alt={title}
        width={410}
        height={300}
        className="poster mb-1 h-[300px] w-full rounded-lg object-cover"
      />

      <div className="flex items-center gap-2">
        <Image
          src="/icons/pin.svg"
          alt="location"
          width={14}
          height={14}
          className="shrink-0"
        />
        <p className="text-light-200 text-sm font-light">{location}</p>
      </div>

      <p className="text-[20px] font-semibold text-white line-clamp-2">
        {title}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Image
            src="/icons/calendar.svg"
            alt="date"
            width={14}
            height={14}
            className="shrink-0"
          />
          <p className="text-light-200 text-sm font-light">{date}</p>
        </div>
        <span
          className="size-1 shrink-0 rounded-full bg-light-200"
          aria-hidden="true"
        />
        <div className="flex items-center gap-2">
          <Image
            src="/icons/clock.svg"
            alt="clock"
            width={14}
            height={14}
            className="shrink-0"
          />
          <p className="text-light-200 text-sm font-light">{time}</p>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
