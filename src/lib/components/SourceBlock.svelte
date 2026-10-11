<script lang="ts">
  import type { BookSection } from '../types';

  let {
    title,
    cite,
    sections,
    preview = 2
  }: {
    title: string;
    /** Citation line under the title. */
    cite?: string;
    sections: BookSection[];
    /** Sections shown before "Read more". */
    preview?: number;
  } = $props();

  let expanded = $state(false);
  const visible = $derived(expanded ? sections : sections.slice(0, preview));
</script>

<article>
  <header>
    <h4>{title}</h4>
    {#if cite}<p class="cite">{cite}</p>{/if}
  </header>
  {#each visible as s, i (i)}
    {#if s.heading && (sections.length > 1 || s.facts)}<h5>{s.heading}</h5>{/if}
    {#if s.facts}
      <dl>
        {#each s.facts as [k, v] (k + v)}<dt>{k}</dt><dd>{v}</dd>{/each}
      </dl>
    {/if}
    {#if s.text}
      {#each s.text.split('\n\n') as para, j (j)}<p>{para}</p>{/each}
    {/if}
  {/each}
  {#if sections.length > preview}
    <button class="more" onclick={() => (expanded = !expanded)} aria-expanded={expanded}>
      {expanded ? 'Show less' : `Read more (${sections.length - preview} more)`}
    </button>
  {/if}
</article>

<style>
  article {
    display: grid;
    gap: 6px;
    padding: 14px;
    border-radius: var(--radius);
    background: var(--surface);
    border: 1px solid var(--border);
  }
  header {
    margin-bottom: 4px;
  }
  h4 {
    font-size: 15px;
  }
  .cite {
    margin: 2px 0 0;
    font-size: 12px;
    color: var(--text-muted);
  }
  h5 {
    margin: 6px 0 0;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted);
  }
  p {
    margin: 0;
    line-height: 1.55;
  }
  dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 4px 14px;
    margin: 0;
    font-size: 14px;
  }
  dt {
    color: var(--text-muted);
    font-weight: 600;
  }
  dd {
    margin: 0;
  }
  .more {
    justify-self: start;
    margin-top: 4px;
    padding: 4px 0;
    border: 0;
    background: none;
    color: var(--brand);
    font-weight: 600;
    font-size: 14px;
  }
</style>
