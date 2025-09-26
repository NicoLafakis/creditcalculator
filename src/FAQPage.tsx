import React, { useEffect, useMemo, useRef, useState } from 'react';
import faqMarkdown from './assets/Credit Calculator Feedback.md?raw';
import faqHtmlRaw from './assets/CreditCalculatorFeedback.html?raw';
import { cn } from './lib/utils';
<<<<<<< HEAD
import { ChevronDown, ChevronRight, ArrowUp } from 'lucide-react';
=======
import { ChevronDown, ChevronRight } from 'lucide-react';
>>>>>>> 2dd7272 (Add comprehensive FAQ for HubSpot Breeze AI and Credits)
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';

interface FAQPageProps {
  onBack: () => void;
}

interface TocItem { id: string; level: number; text: string; }

// Simple slug function
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Very lightweight markdown to JSX parser for just headings + paragraphs + lists + tables + code fences
// This avoids adding a dependency. For future rich markdown, consider a library.
function useParsedMarkdown(markdown: string) {
  return useMemo(() => {
    const lines = markdown.split(/\r?\n/);
    const elements: React.ReactNode[] = [];
    const toc: TocItem[] = [];

    let buffer: string[] = [];
    let inCode = false;
    let codeLang = '';
    let tableMode = false;
    let tableHeader: string[] = [];
    let tableRows: string[][] = [];

    const flushParagraph = () => {
      if (buffer.length) {
        const text = buffer.join(' ').trim();
        if (text) {
          elements.push(<p key={elements.length} className="mb-4 leading-relaxed">{text}</p>);
        }
        buffer = [];
      }
    };

    const flushTable = () => {
      if (tableMode) {
        elements.push(
          <div key={elements.length} className="overflow-auto mb-6">
            <table className="w-full text-sm border border-gray-300 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  {tableHeader.map((h, i) => (
                    <th key={i} className="text-left p-2 font-medium border-b border-gray-300 dark:border-gray-700">{h.trim()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, r) => (
                  <tr key={r} className={r % 2 === 1 ? 'bg-gray-50 dark:bg-gray-900/30' : ''}>
                    {row.map((cell, c) => (
                      <td key={c} className="p-2 align-top border-b border-gray-200 dark:border-gray-800">{cell.trim()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      tableMode = false;
      tableHeader = [];
      tableRows = [];
    };

    // Inline renderer: supports **bold** (simple, non-nested), later extend if needed.
    const renderInline = (text: string): React.ReactNode => {
      if (!text) return text;
      const parts: React.ReactNode[] = [];
      // Handle escaped '\*' first by temporary placeholder
      const ESC = '\u0000ESCSTAR';
      text = text.replace(/\\\*/g, ESC);
      const regex = /\*\*(.+?)\*\*/g;
      let lastIndex = 0; let m: RegExpExecArray | null;
      while ((m = regex.exec(text)) !== null) {
        if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index).replace(new RegExp(ESC,'g'), '*'));
        parts.push(<strong key={parts.length}>{m[1].replace(new RegExp(ESC,'g'), '*')}</strong>);
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < text.length) parts.push(text.slice(lastIndex).replace(new RegExp(ESC,'g'), '*'));
      return parts.length ? parts : text.replace(new RegExp(ESC,'g'), '*');
    };

    const stripOuterBold = (t: string) => t.replace(/^\*\*(.+)\*\*$/,'$1');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code fences
      const codeFenceMatch = line.match(/^```(.*)/);
      if (codeFenceMatch) {
        if (inCode) {
          // flush code block
            elements.push(
              <pre key={elements.length} className="mb-4 rounded bg-gray-900 text-gray-100 p-4 text-xs overflow-auto"><code>{buffer.join('\n')}</code></pre>
            );
            buffer = [];
            inCode = false;
            codeLang = '';
        } else {
          flushParagraph();
          flushTable();
          inCode = true;
          codeLang = codeFenceMatch[1].trim();
        }
        continue;
      }

      if (inCode) {
        buffer.push(line);
        continue;
      }

      // Table detection (pipe syntax)
      if (/^\|.*\|$/.test(line)) {
        // header separator line detection
        if (/^\|?\s*:?-{3,}:?/.test(lines[i + 1] || '')) {
          // header line
          tableMode = true;
          tableHeader = line.split('|').slice(1, -1);
          i++; // skip separator line
          continue;
        }
        if (tableMode) {
          const rowCells = line.split('|').slice(1, -1);
          tableRows.push(rowCells);
          continue;
        }
      } else if (tableMode) {
        // flush table when leaving table mode
        flushTable();
      }

      // Horizontal rule (---, ***, ___) optional leading backslash
      if (/^\\?[-*_]{3,}\s*$/.test(line.trim())) {
        flushParagraph();
        flushTable();
        elements.push(<hr key={elements.length} className="my-6 border-gray-300 dark:border-gray-700" />);
        continue;
      }

      // Headings (support #, ##, ###). We only add to TOC for level 2 & 3 per original design.
      const headingMatch = line.match(/^(#{1,3})\s+(.*)/);
      if (headingMatch) {
        flushParagraph();
        flushTable();
        const level = headingMatch[1].length; // 1,2,3
        const rawText = stripOuterBold(headingMatch[2].trim());
        const id = slugify(rawText);
        if (level === 2 || level === 3) toc.push({ id, level, text: rawText });
        let className = 'scroll-mt-24 font-semibold tracking-tight';
        if (level === 1) className += ' text-2xl mt-8 mb-4 border-b pb-2';
        else if (level === 2) className += ' text-xl mt-10 mb-4 border-b pb-1';
        else className += ' text-lg mt-6 mb-2';
        const Tag: any = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
        elements.push(<Tag id={id} key={elements.length} className={className}>{renderInline(rawText)}</Tag>);
        continue;
      }

      // Lists
      const listMatch = line.match(/^[-*+]\s+(.*)/);
      if (listMatch) {
        // collect a contiguous list block
        const items: string[] = [listMatch[1]];
        while (i + 1 < lines.length && /^[-*+]\s+/.test(lines[i + 1])) {
          items.push(lines[i + 1].replace(/^[-*+]\s+/, ''));
          i++;
        }
        flushParagraph();
        flushTable();
        elements.push(
          <ul key={elements.length} className="list-disc ml-6 mb-4 space-y-1">
            {items.map((it, idx) => (
              <li key={idx}>{renderInline(it)}</li>
            ))}
          </ul>
        );
        continue;
      }

      // Ordered lists (1. 2. ...). We normalize numbering but keep original order.
      const orderedMatch = line.match(/^\d+\.\s+(.*)/);
      if (orderedMatch) {
        const items: string[] = [orderedMatch[1]];
        while (i + 1 < lines.length && /^\d+\.\s+/.test(lines[i + 1])) {
          items.push(lines[i + 1].replace(/^\d+\.\s+/, ''));
          i++;
        }
        flushParagraph(); flushTable();
        elements.push(
          <ol key={elements.length} className="list-decimal ml-6 mb-4 space-y-1">
            {items.map((it, idx) => <li key={idx}>{renderInline(it)}</li>)}
          </ol>
        );
        continue;
      }

      // Blank line flush paragraph
      if (/^\s*$/.test(line)) {
        flushParagraph();
        continue;
      }

      buffer.push(line);
    }

    // Flush remaining buffer as paragraph applying inline formatting
    if (buffer.length) {
      const text = buffer.join(' ').trim();
      if (text) elements.push(<p key={elements.length} className="mb-4 leading-relaxed">{renderInline(text)}</p>);
      buffer = [];
    }
    flushTable();

    return { elements, toc };
  }, [markdown]);
}

export const FAQPage: React.FC<FAQPageProps> = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
<<<<<<< HEAD
  const [activeId, setActiveId] = useState<string | null>(null);
=======
>>>>>>> 2dd7272 (Add comprehensive FAQ for HubSpot Breeze AI and Credits)

  // Decide source: prefer provided HTML if non-empty
  const useHtml = faqHtmlRaw && faqHtmlRaw.trim().length > 0;

  // Parse HTML to extract headings and inject ids
  const { htmlContent, tocTree, textIndex, scopedCss } = useMemo(() => {
    if (!useHtml) {
      const { elements, toc } = useParsedMarkdown(faqMarkdown);
      // Convert React elements to a basic HTML string for search fallback
      const plain = elements.map(el => {
        if (React.isValidElement(el)) {
          const tag = typeof el.type === 'string' ? el.type : 'div';
          const idAttr = (el.props as any).id ? ` id="${(el.props as any).id}"` : '';
          return `<${tag}${idAttr}>${(el.props as any).children ?? ''}</${tag}>`;
        }
        return String(el);
      }).join('\n');
      const textIndex = toc.map(t => ({ id: t.id, text: plain.toLowerCase() }));
      return { htmlContent: plain, toc, textIndex };
    }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(faqHtmlRaw, 'text/html');
      // Extract <style> content for scoping
      const styleEl = doc.querySelector('style');
      let scopedCss = '';
      if (styleEl && styleEl.textContent) {
        const rawCss = styleEl.textContent;
        // Prefix top-level selectors: naive approach splitting by '}' then rejoining
        scopedCss = rawCss
          .split('}')
          .map(block => {
            const parts = block.trim();
            if (!parts) return '';
            const seg = parts + '}';
            const idx = seg.indexOf('{');
            if (idx === -1) return seg; // leave untouched
            const selector = seg.substring(0, idx).trim();
            const body = seg.substring(idx);
            // Split multiple selectors
            const scopedSelectors = selector
              .split(',')
              .map(s => `.faq-html ${s.trim()}`)
              .join(', ');
            return `${scopedSelectors} ${body}`;
          })
          .join('\n');
      }
      // Remove original style to avoid global leakage
      if (styleEl) styleEl.remove();
      // Build a tree of sections (h2) and their question children (.question spans)
      const sectionEls = Array.from(doc.querySelectorAll('h2')) as HTMLElement[];
      const tocTree: Array<{ id: string; text: string; children: TocItem[] }> = [];
      sectionEls.forEach((h2) => {
        const secText = (h2.textContent || '').trim();
        const secId = slugify(secText);
        h2.id = secId;
        // collect following siblings until next h2
        const children: TocItem[] = [];
        let el: Element | null = h2.nextElementSibling;
        while (el && el.tagName !== 'H2') {
          // find question spans within this sibling
          const qs = Array.from(el.querySelectorAll('.question')) as HTMLElement[];
          qs.forEach((qEl) => {
            const qText = (qEl.textContent || '').trim();
            // create a stable id
            const qId = slugify(`${secText} ${qText.slice(0, 80)}`);
            // attach id to the nearest containing element to scroll to; prefer li or span
            const target = qEl.closest('li') || qEl;
            (target as HTMLElement).id = qId;
            children.push({ id: qId, level: 3, text: qText });
          });
          el = el.nextElementSibling;
        }
        tocTree.push({ id: secId, text: secText, children });
      });
      // Do not mutate original styling (allow HTML-authored design) except ensure headings scroll margin
      doc.querySelectorAll('h1,h2,h3').forEach(h => h.classList.add('scroll-mt-24'));
      const body = doc.body.innerHTML;
      const textIndex = tocTree.flatMap(s => [{ id: s.id, text: (doc.body.textContent || '').toLowerCase() }, ...s.children.map(c => ({ id: c.id, text: (doc.body.textContent || '').toLowerCase() }))]);
      return { htmlContent: body, tocTree, textIndex, scopedCss };
    } catch (e) {
      return { htmlContent: faqHtmlRaw, tocTree: [], textIndex: [], scopedCss: '' };
    }
  }, [useHtml]);

  // If using markdown fallback, we still have original elements for filtered display; if using HTML we filter by hiding sections via CSS.
  const markdownParsed = !useHtml ? useParsedMarkdown(faqMarkdown) : null;
  const markdownElements = markdownParsed?.elements;

  // Build a sidebar tree for markdown fallback if needed
  const markdownTocTree = useMemo(() => {
    if (useHtml) return [] as Array<{ id: string; text: string; children: TocItem[] }>;
    const items = markdownParsed?.toc || [];
    const tree: Array<{ id: string; text: string; children: TocItem[] }> = [];
    for (const it of items) {
      if (it.level === 2) {
        tree.push({ id: it.id, text: it.text, children: [] });
      } else if (it.level === 3) {
        if (tree.length === 0) {
          tree.push({ id: it.id + '-parent', text: 'Other', children: [it] });
        } else {
          tree[tree.length - 1].children.push(it);
        }
      }
    }
    return tree;
  }, [useHtml, markdownParsed]);

  const sidebarTree = useMemo(() => (useHtml ? tocTree : markdownTocTree) || [], [useHtml, tocTree, markdownTocTree]);

  // UI state for expanded/collapsed sections
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (sidebarTree.length > 0) setExpandedSections(new Set([sidebarTree[0].id]));
  }, [sidebarTree]);
  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

<<<<<<< HEAD
  

=======
>>>>>>> 2dd7272 (Add comprehensive FAQ for HubSpot Breeze AI and Credits)
  // Build a flat text index for search: id -> text content
  const searchIndex = useMemo(() => textIndex, [textIndex]);

  const filteredIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return new Set<string>(); // empty set means show all
    const matches = new Set<string>();
    for (const entry of searchIndex) {
      if (entry.text.includes(q)) matches.add(entry.id);
    }
    return matches;
  }, [query, searchIndex]);

  // Filter elements by wrapping them and checking heading ids
  const displayedMarkdown = useMemo(() => {
    if (useHtml) return null;
    if (!query.trim() || !markdownElements) return markdownElements || null;
    const result: React.ReactNode[] = [];
    let currentHeadingId: string | null = null;
    let include = true;
    for (const node of markdownElements) {
      if (React.isValidElement(node) && typeof (node.props as any).id === 'string') {
        currentHeadingId = (node.props as any).id;
        include = currentHeadingId != null && filteredIds.has(currentHeadingId);
      }
      if (include) result.push(node);
    }
    return result;
  }, [useHtml, markdownElements, filteredIds, query]);

  const handleTocClick = (id: string) => {
<<<<<<< HEAD
    setActiveId(id);
=======
>>>>>>> 2dd7272 (Add comprehensive FAQ for HubSpot Breeze AI and Credits)
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (!query.trim()) return; // highlight matches
    const q = query.trim().toLowerCase();
    // Could implement highlight later if needed
  }, [query]);

  return (
<<<<<<< HEAD
    <div className="faq-page flex h-full w-full">
  <aside className="faq-sidebar hidden lg:block w-80 shrink-0 border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto sticky top-0 h-screen">
        <h2 className="faq-sidebar-title text-sm font-semibold mb-3 text-gray-600 dark:text-gray-300 uppercase tracking-wide">On this page</h2>
        <nav className="faq-toc space-y-2">
          {sidebarTree.map(section => {
            const expanded = expandedSections.has(section.id);
            return (
              <div key={section.id} className="faq-toc-section rounded-md">
                <div className="faq-toc-row flex items-center justify-between">
                  <button
                    onClick={() => handleTocClick(section.id)}
                    className={cn(
                      'faq-toc-button flex-1 text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none flex items-center gap-2 cursor-pointer transition-colors duration-200 ease-in-out',
                      // Active state: subtle left border indicator instead of full background
                      activeId === section.id
                        ? 'border-l-4 border-[#FF8A00] bg-transparent text-gray-900 dark:text-gray-100'
                        : 'text-gray-800 dark:text-gray-200'
                    )}
                    title={`Jump to ${section.text}`}
                  >
                    <span className="faq-toc-title font-medium">{section.text}</span>
                    <span className={cn('faq-toc-hint text-xs ml-2', activeId === section.id ? 'text-[#FF8A00]' : 'text-gray-500 dark:text-gray-400')}>Jump</span>
                  </button>
                  <button
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={expanded}
                    className="faq-toc-toggle p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none flex items-center justify-center cursor-pointer"
                    title={expanded ? 'Collapse' : 'Expand'}
                  >
                    <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                  </button>
                </div>
                <div className={expanded ? 'faq-toc-children mt-1 pl-3 space-y-1' : 'hidden'}>
                    {section.children && section.children.length > 0 ? (
                    section.children.map(child => (
                      <button key={child.id} onClick={() => handleTocClick(child.id)} className={cn(
                        'faq-toc-child block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer transition-colors duration-200 ease-in-out',
                          activeId === child.id
                            ? 'border-l-4 border-[#0B9444] bg-transparent text-gray-900 dark:text-gray-100'
                            : 'text-gray-700 dark:text-gray-300'
                      )}>
                          <span className={cn('faq-toc-child-bullet text-xs', activeId === child.id ? 'text-[#0B9444]' : 'text-gray-400')}>•</span>
                        <span className="faq-toc-child-text">{child.text}</span>
                      </button>
                    ))
                  ) : (
                    <div className="faq-toc-empty text-sm text-gray-500 px-3 py-2">(no questions)</div>
=======
    <div className="flex h-full w-full">
      <aside className="hidden lg:block w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto sticky top-0 h-screen">
        <h2 className="text-sm font-semibold mb-3 text-gray-600 dark:text-gray-300 uppercase tracking-wide">On this page</h2>
        <nav className="space-y-2">
          {sidebarTree.map(section => {
            const expanded = expandedSections.has(section.id);
            return (
              <div key={section.id} className="rounded-md">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleTocClick(section.id)}
                    className="flex-1 text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200">{section.text}</span>
                  </button>
                  <button
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={expanded ? true : false}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                    title={expanded ? 'Collapse' : 'Expand'}
                  >
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                </div>
                <div className={expanded ? 'mt-1 pl-3 space-y-1' : 'hidden'}>
                  {section.children && section.children.length > 0 ? (
                    section.children.map(child => (
                      <button key={child.id} onClick={() => handleTocClick(child.id)} className="block w-full text-left px-2 py-1 text-sm text-gray-600 dark:text-gray-400 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                        {child.text}
                      </button>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 px-2 py-1">(no questions)</div>
>>>>>>> 2dd7272 (Add comprehensive FAQ for HubSpot Breeze AI and Credits)
                  )}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
<<<<<<< HEAD
      <div className="faq-content flex-1 overflow-y-auto" ref={containerRef}>
        <div className="faq-inner max-w-3xl mx-auto p-4 md:p-8">
          <div className="faq-header flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="faq-header-left flex items-center gap-2">
              <Button variant="outline" onClick={onBack}>← Back</Button>
              <h1 className="faq-title text-2xl font-bold tracking-tight">FAQ & Guidance</h1>
            </div>
            <div className="flex-1" />
            <div className="faq-search-wrap w-full md:w-80">
              <Input
                className="faq-search"
=======
      <div className="flex-1 overflow-y-auto" ref={containerRef}>
        <div className="max-w-3xl mx-auto p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onBack}>← Back</Button>
              <h1 className="text-2xl font-bold tracking-tight">FAQ & Guidance</h1>
            </div>
            <div className="flex-1" />
            <div className="w-full md:w-80">
              <Input
>>>>>>> 2dd7272 (Add comprehensive FAQ for HubSpot Breeze AI and Credits)
                placeholder="Search keywords..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Search FAQ"
              />
            </div>
          </div>
<<<<<<< HEAD
          <Card className="faq-card p-4 md:p-6">
            {useHtml && scopedCss ? <style>{scopedCss}</style> : null}
            <div className={cn('faq-content-inner max-w-none', useHtml ? 'faq-html' : 'prose dark:prose-invert')}>
=======
          <Card className="p-4 md:p-6">
            {useHtml && scopedCss ? <style>{scopedCss}</style> : null}
            <div className={cn('max-w-none', useHtml ? 'faq-html' : 'prose dark:prose-invert')}>
>>>>>>> 2dd7272 (Add comprehensive FAQ for HubSpot Breeze AI and Credits)
              {useHtml ? (
                <div className={cn(query.trim() && 'faq-search-active')} dangerouslySetInnerHTML={{ __html: htmlContent }} />
              ) : (
                <div className="prose dark:prose-invert max-w-none">{displayedMarkdown}</div>
              )}
            </div>
            {query.trim() && (
              (() => {
                if (useHtml) {
                  // For HTML mode we don't currently hide sections individually, so a zero match state isn't derived; skip message.
                  return null;
                }
                if (displayedMarkdown && displayedMarkdown.length === 0) {
                  return <p className="text-sm text-gray-500 mt-4">No matches found for "{query}".</p>;
                }
                return null;
              })()
            )}
          </Card>
        </div>
      </div>
<<<<<<< HEAD
      <FAQScrollToTop containerRef={containerRef} />
=======
>>>>>>> 2dd7272 (Add comprehensive FAQ for HubSpot Breeze AI and Credits)
    </div>
  );
};

<<<<<<< HEAD
function FAQScrollToTop({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const getScrollTop = () => (containerRef.current ? containerRef.current.scrollTop : window.scrollY || 0);
    const onScroll = () => {
      try {
        setVisible(getScrollTop() > 300);
      } catch (e) {
        // ignore
      }
    };
    // Attach listener to the container if present, otherwise to window
    if (containerRef.current) {
      const node = containerRef.current;
      node.addEventListener('scroll', onScroll, { passive: true } as AddEventListenerOptions);
      // initial check
      onScroll();
      return () => node.removeEventListener('scroll', onScroll as EventListener);
    } else {
      window.addEventListener('scroll', onScroll, { passive: true } as AddEventListenerOptions);
      onScroll();
      return () => window.removeEventListener('scroll', onScroll as EventListener);
    }
  }, [containerRef]);

  const scrollToTop = () => {
    try {
      if (containerRef.current) containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      if (containerRef.current) containerRef.current.scrollTop = 0;
      else window.scrollTo(0, 0);
    }
  };

  if (!visible) return null;
  return (
    <div className="faq-scroll-top fixed right-4 bottom-6 z-50 lg:right-24">
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Back to top"
        className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8A00]"
      >
        <ArrowUp className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

=======
>>>>>>> 2dd7272 (Add comprehensive FAQ for HubSpot Breeze AI and Credits)
export default FAQPage;
