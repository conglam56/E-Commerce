import React from 'react';

export default function BrandWordmark({ compact = false }) {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap text-[#1D1D1F] select-none">
      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        className={`shrink-0 ${compact ? 'size-6' : 'size-7 sm:size-8'}`}
        fill="currentColor"
      >
        <path d="M24 3 44 14.5 24 26 4 14.5 24 3ZM4 21l17 9.8V46L4 36.2V21Zm23 9.8L44 21v15.2L27 46V30.8Z" />
      </svg>
      <span className="brand-name font-display font-semibold tracking-[-0.035em]">
        The Tech Shop
      </span>
    </span>
  );
}
