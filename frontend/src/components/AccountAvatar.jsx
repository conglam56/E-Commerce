import React from 'react';

export default function AccountAvatar({ user, large = false }) {
  const nameParts = user.fullName.trim().split(/\s+/).filter(Boolean);
  const initials = nameParts.length > 0
    ? [nameParts[0], ...(nameParts.length > 1 ? [nameParts.at(-1)] : [])]
        .map((part) => Array.from(part)[0]).join('')
    : Array.from(user.email)[0] || '?';

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[#E8E8ED] font-semibold text-[#1D1D1F] ${large ? 'size-16 text-2xl' : 'size-8 text-xs'}`}
    >
      {initials.toLocaleUpperCase('vi')}
    </span>
  );
}
