<script lang="ts">
  const paths = {
    fish: 'M3 12c3-5 9-7 14-3l4-3v12l-4-3c-5 4-11 2-14-3Zm12-1.5h.01',
    bird: 'M16 7h.01M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20M20 7l2 .5-2 .5M10 18v3M14 17.75V21M7 18a6 6 0 0 0 3.84-10.61',
    paw: 'M11 5.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM17 5.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM21 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM12 12c-2.5 0-5 3-5 5.5 0 1.7 1.3 2.5 2.7 2.5 1 0 1.5-.5 2.3-.5s1.3.5 2.3.5c1.4 0 2.7-.8 2.7-2.5 0-2.5-2.5-5.5-5-5.5Z',
    book: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20',
    search: 'M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z',
    filter: 'M3 6h18M7 12h10M10 18h4',
    close: 'M18 6 6 18M6 6l12 12',
    check: 'M20 6 9 17l-5-5',
    pin: 'M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    locate: 'M12 2v3M12 19v3M2 12h3M19 12h3M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
    plus: 'M12 5v14M5 12h14',
    trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    download: 'M12 3v12M7 10l5 5 5-5M5 21h14',
    upload: 'M12 21V9M7 14l5-5 5 5M5 3h14',
    edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z',
    eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    left: 'm15 18-6-6 6-6',
    right: 'm9 18 6-6-6-6',
    expand: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7',
    star: 'm12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z'
  } as const;

  let { name, size = 20 }: { name: keyof typeof paths; size?: number } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <path d={paths[name]} />
</svg>
