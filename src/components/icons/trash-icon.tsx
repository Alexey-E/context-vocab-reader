type TrashIconProps = Readonly<{
  className?: string;
}>;

export function TrashIcon({ className = "size-4" }: TrashIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path
        d="M4 7h16m-10 4v6m4-6v6m-7-10 1 13h8l1-13M9 7V4h6v3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
