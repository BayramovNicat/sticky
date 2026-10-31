interface IconProps {
  class?: string;
}

export const RealisticPin = ({
  class: className = 'size-5',
  pinned = false,
}: IconProps & { pinned?: boolean }) => (
  <svg
    class={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="12" cy="7" rx="5" ry="3" fill={pinned ? '#f59e0b' : '#71717a'} />
    <path
      d="M8.5 7.5 C8.5 11, 10 13, 10 14 L14 14 C14 13, 15.5 11, 15.5 7.5 Z"
      fill={pinned ? '#d97706' : '#52525b'}
    />
    <circle cx="12" cy="7" r="2" fill={pinned ? '#fbbf24' : '#a1a1aa'} />
    <path
      d="M11 14 L12 21 L13 14 Z"
      fill={pinned ? '#92400e' : '#3f3f46'}
    />
  </svg>
);

export const QuillIcon = ({ class: className = 'size-3.5' }: IconProps) => (
  <svg
    class={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L3 11.5V21h9.5z" />
    <line x1="16" y1="8" x2="2" y2="22" />
    <line x1="17.5" y1="15" x2="9" y2="15" />
  </svg>
);

export const SoundGlyph = ({
  class: className = 'size-4',
  muted = false,
}: IconProps & { muted?: boolean }) => (
  <svg
    class={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    {muted ? (
      <>
        <line x1="22" y1="9" x2="16" y2="15" />
        <line x1="16" y1="9" x2="22" y2="15" />
      </>
    ) : (
      <>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </>
    )}
  </svg>
);

export const FlameIcon = ({ class: className = 'size-3.5' }: IconProps) => (
  <svg
    class={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);
