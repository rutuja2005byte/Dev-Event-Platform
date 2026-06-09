export type EventItem = {
  title: string;
  image: string; // path under /public
  slug: string;
  location: string;
  date: string; // human friendly
  time: string; // human friendly
  url?: string;
  tags?: string[];
};

export const events: EventItem[] = [
  {
    title: 'WWDC 2026',
    image: '/images/event1.png',
    slug: 'wwdc-2026',
    location: 'Apple Park, Cupertino, CA (and online)',
    date: 'June 8–12, 2026',
    time: 'All day',
    url: 'https://developer.apple.com/wwdc/',
    tags: ['apple', 'ios', 'macos']
  },
  {
    title: 'React Conf 2026',
    image: '/images/event2.png',
    slug: 'react-conf-2026',
    location: 'San Francisco, CA (hybrid)',
    date: 'November 2–3, 2026',
    time: '09:00 – 18:00 PST',
    url: 'https://reactjs.org/community/conferences.html',
    tags: ['react', 'frontend', 'javascript']
  },
  {
    title: 'JSConf EU 2026',
    image: '/images/event3.png',
    slug: 'jsconf-eu-2026',
    location: 'Berlin, Germany',
    date: 'September 14–16, 2026',
    time: '09:30 – 17:30 CEST',
    url: 'https://jsconf.eu/',
    tags: ['javascript', 'web']
  },
  {
    title: 'NodeConf EU 2026',
    image: '/images/event4.png',
    slug: 'nodeconf-eu-2026',
    location: 'Lisbon, Portugal',
    date: 'October 6–8, 2026',
    time: '10:00 – 17:00 WET',
    url: 'https://www.nodeconf.eu/',
    tags: ['nodejs', 'backend']
  },
  {
    title: 'HackZurich 2026',
    image: '/images/event5.png',
    slug: 'hackzurich-2026',
    location: 'Zurich, Switzerland',
    date: 'September 18–20, 2026',
    time: '48 hour hackathon',
    url: 'https://www.hackzurich.com/',
    tags: ['hackathon', 'students', 'startup']
  },
  {
    title: 'DevOpsDays 2026 (London)',
    image: '/images/event6.png',
    slug: 'devopsdays-london-2026',
    location: 'London, UK',
    date: 'October 20, 2026',
    time: '09:00 – 17:00 BST',
    url: 'https://devopsdays.org/events/2026-london/',
    tags: ['devops', 'cloud', 'infrastructure']
  },
  {
    title: 'Full-Stack Dev Meetup — Metro City',
    image: '/images/event-full.png',
    slug: 'fullstack-meetup-metrocity-2026',
    location: 'Metro City — Community Hub',
    date: 'July 15, 2026',
    time: '18:30 – 20:30',
    url: '',
    tags: ['meetup', 'networking']
  }
];

export default events;
