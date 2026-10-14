const SEVERITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 };

export function buildEssayAnnotations(essayValue, issueValue) {
  const essay = typeof essayValue === 'string' ? essayValue : '';
  const issues = Array.isArray(issueValue) ? issueValue : [];
  const candidates = issues.map((issue, index) => ({
    issue,
    issueIndex: index,
    quote: typeof issue?.quote === 'string' ? issue.quote : '',
    severity: Object.hasOwn(SEVERITY_RANK, issue?.severity) ? issue.severity : 'medium'
  }));
  const allocated = [];
  const unavailable = [];
  const ordered = candidates.sort((left, right) =>
    SEVERITY_RANK[left.severity] - SEVERITY_RANK[right.severity] ||
    right.quote.length - left.quote.length ||
    left.issueIndex - right.issueIndex
  );

  for (const item of ordered) {
    if (item.quote.length < 5) {
      unavailable.push({ issueIndex: item.issueIndex, quote: item.quote, reason: 'missing' });
      continue;
    }

    const first = essay.indexOf(item.quote);
    if (first < 0) {
      unavailable.push({ issueIndex: item.issueIndex, quote: item.quote, reason: 'not-found' });
      continue;
    }

    const last = essay.indexOf(item.quote, first + 1);
    if (last >= 0) {
      unavailable.push({ issueIndex: item.issueIndex, quote: item.quote, reason: 'ambiguous' });
      continue;
    }

    const end = first + item.quote.length;
    const overlaps = allocated.some(span => first < span.end && end > span.start);
    if (overlaps) {
      unavailable.push({ issueIndex: item.issueIndex, quote: item.quote, reason: 'overlap' });
      continue;
    }

    allocated.push({
      issueIndex: item.issueIndex,
      start: first,
      end,
      quote: item.quote,
      severity: item.severity,
      category: typeof item.issue?.category === 'string' ? item.issue.category : 'other'
    });
  }

  allocated.sort((left, right) => left.start - right.start || left.end - right.end);
  unavailable.sort((left, right) => left.issueIndex - right.issueIndex);
  return { spans: allocated, unavailable, issueCount: issues.length };
}

export function renderAnnotatedEssayText(essayValue, annotationResult, escapeText) {
  const essay = typeof essayValue === 'string' ? essayValue : '';
  const spans = Array.isArray(annotationResult?.spans) ? annotationResult.spans : [];
  const escape = typeof escapeText === 'function' ? escapeText : value => String(value);
  const ordered = spans
    .filter(span => Number.isInteger(span.start) && Number.isInteger(span.end) &&
      span.start >= 0 && span.end > span.start && span.end <= essay.length)
    .slice()
    .sort((left, right) => left.start - right.start);
  let cursor = 0;
  let html = '';
  for (const span of ordered) {
    if (span.start < cursor) continue;
    html += escape(essay.slice(cursor, span.start));
    html += '<button type="button" class="essay-annotation essay-annotation-' +
      escape(span.severity) + '" data-annotation-issue="' + span.issueIndex +
      '" aria-label="Đi tới lỗi số ' + (span.issueIndex + 1) + '">' +
      escape(essay.slice(span.start, span.end)) + '</button>';
    cursor = span.end;
  }
  html += escape(essay.slice(cursor));
  return html;
}
