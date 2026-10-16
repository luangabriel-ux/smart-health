const paths = {
  home: 'M3 10.5 12 3l9 7.5M5 9v12h5v-7h4v7h5V9',
  user: 'M20 21v-2a7 7 0 0 0-14 0v2M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  back: 'm14 6-6 6 6 6',
  next: 'm9 6 6 6-6 6',
  plus: 'M12 5v14M5 12h14',
  close: 'm6 6 12 12M6 18 18 6',
  calendar:
    'M7 3v4M17 3v4M4 10h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1ZM8 14h2M14 14h2M8 17h2',
  chart: 'M5 20v-6M12 20V8M19 20V3',
  dumbbell: 'M6 4v16M3 7v10M18 4v16M21 7v10M6 12h12',
  play: 'm9 5 11 7-11 7Z',
  pause: 'M8 5v14M16 5v14',
  water: 'M12 3C9 8 5 11 5 15a7 7 0 0 0 14 0c0-4-4-7-7-12ZM8 15a4 4 0 0 0 4 4',
  fire: 'M12 3c2 5-2 6 1 9 1-2 3-3 4-3 1 3 3 4 3 7a8 8 0 0 1-16 0c0-4 3-7 6-9-1 4 0 5 2 5',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2',
  steps:
    'M7 4c-2 0-3 3-3 5s1 3 3 3 3-1 3-3-1-5-3-5ZM5 15h5v4a2 2 0 0 1-5 0ZM17 2c-2 0-3 3-3 5s1 3 3 3 3-1 3-3-1-5-3-5ZM15 13h5v4a2 2 0 0 1-5 0Z',
  heart:
    'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM10 2h4l1 3 3-1 3 4-2 3 2 3-3 4-3-1-1 4h-4l-1-4-3 1-3-4 2-3-2-3 3-4 3 1Z',
  shield: 'm12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6ZM8 12l3 3 5-6',
  logout: 'M9 3H4v18h5M10 12h11m-4-4 4 4-4 4',
  mail: 'M3 5h18v14H3ZM3 6l9 7 9-7',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5ZM12 14v3',
  check: 'm5 12 4 4L19 6',
  health: 'M2 12h5l3-8 4 16 3-8h5',
  bookmark: 'M6 3h12v19l-6-4-6 4Z',
  search: 'm16 16 5 5M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z',
  crown: 'M3 6l4 5 5-8 5 8 4-5-2 14H5ZM6 17h12',
  food: 'M4 3v7a3 3 0 0 0 6 0V3M7 3v19M19 3v19M19 3c-4 3-5 9 0 10',
  coffee:
    'M3 7h13v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4ZM16 8h2a3 3 0 0 1 0 6h-2M7 2v2M12 2v2',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 11v6M12 7h.01',
  battery: 'M2 7h18v10H2ZM22 10v4M5 10h10v4H5',
  wifi: 'M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8 16a6 6 0 0 1 8 0M12 20h.01',
  camera: 'M3 7h4l2-4h6l2 4h4v14H3ZM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  help: 'M9 8a3 3 0 1 1 5 2c-1 1-2 1-2 4M12 18h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
  edit: 'm16 3 5 5L8 21H3v-5ZM13 6l5 5',
  volume: 'M11 3 5 8H2v8h3l6 5ZM15 7a7 7 0 0 1 0 10M18 4a11 11 0 0 1 0 16',
  share:
    'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM9 11l6-4M9 13l6 4',
} as const;
export type IconName = keyof typeof paths;
export function Icon({
  name,
  size = 20,
  className = '',
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={paths[name]} />
    </svg>
  );
}
