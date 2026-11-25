import React from 'react';

export default function BrandWordmark({ compact = false }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap select-none">
      <span
        aria-hidden="true"
        className={`inline-flex shrink-0 items-center justify-center rounded-[7px] bg-[#1D1D1F] text-white ${
          compact ? 'size-6' : 'size-6 sm:size-7'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className={compact ? 'size-3.5' : 'size-3.5 sm:size-4'}
          fill="none"
        >
          <path
            d="M5.5 6.75h13v3h-4.75v7.5h-3.5v-7.5H5.5v-3Z"
            fill="currentColor"
          />
          <circle cx="17.25" cy="15.75" r="1.45" fill="#2997FF" />
        </svg>
      </span>
      <span className="font-display font-bold tracking-[-0.03em] text-[#1D1D1F]">
        The Tech Shop
      </span>
    </span>
  );
}
