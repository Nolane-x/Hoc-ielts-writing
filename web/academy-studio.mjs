function escapeXml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}

const TASK_ACADEMY_CATALOG = {
  'task2-opinion': {
    topic: 'Giáo dục Phổ thông · Kỹ năng Thực hành vs. Môn Học thuật',
    instruction: 'Discuss both views and give your own opinion (Thảo luận hai quan điểm và nêu lập trường cá nhân)',
    traps: [
      'Bẫy phân cực: Tuyệt đối hóa việc bỏ hẳn môn học thuật hoặc bỏ hẳn kỹ năng thực hành.',
      'Thiếu lập trường: Thảo luận cả hai vế nhưng không khẳng định rõ quan điểm của bản thân ở Mở bài và Kết bài.'
    ],
    collocations: [
      { phrase: 'cultivate foundational literacy', meaning: 'Bồi dưỡng năng lực tư duy và học thuật nền tảng' },
      { phrase: 'vocational and practical competencies', meaning: 'Năng lực nghề nghiệp và kỹ năng thực tiễn' },
      { phrase: 'navigate real-world complexities', meaning: 'Xử lý các tình huống phức tạp ngoài đời thực' },
      { phrase: 'theoretical underpinnings', meaning: 'Nền tảng lý thuyết cốt lõi' },
      { phrase: 'holistic curriculum design', meaning: 'Thiết kế chương trình học toàn diện' },
      { phrase: 'financial literacy and civic responsibility', meaning: 'Hiểu biết tài chính và trách nhiệm công dân' }
    ],
    modelEssay: {
      band: 8.5,
      paragraphs: [
        { role: 'Introduction', text: 'Debates surrounding curriculum priorities often contrast traditional academic disciplines with hands-on life skills. While core theoretical subjects remain indispensable for intellectual development, I contend that secondary education should integrate practical training so graduates can navigate adulthood effectively.' },
        { role: 'Body Paragraph 1', text: 'On the one hand, academic subjects provide the theoretical underpinnings required for higher education and analytical professions. Mathematics, literature and the natural sciences train students to evaluate evidence, construct rigorous arguments and understand abstract systems. Without this intellectual foundation, learners may struggle to adapt when technological shifts render specific vocational routines obsolete.' },
        { role: 'Body Paragraph 2', text: 'On the other hand, equipping adolescents with practical competencies addresses immediate challenges they face upon leaving school. Financial literacy, meal preparation and digital communication foster self-reliance and reduce the transition shock experienced by young adults. Rather than treating these domains as mutually exclusive, schools can embed applied projects within academic coursework.' },
        { role: 'Conclusion', text: 'In conclusion, although rigorous academic study is vital for long-term cognitive growth, a balanced curriculum that incorporates practical life skills best prepares young people for both professional and personal responsibilities.' }
      ]
    },
    collocationDrill: {
      sentence: 'Secondary schools should design a ______ curriculum that balances theoretical knowledge with practical life skills.',
      options: ['holistic', 'big', 'full', 'heavy'],
      answerIndex: 0,
      explanation: '“Holistic curriculum” là cụm collocation học thuật chuẩn C1/C2 diễn tả chương trình giáo dục toàn diện, tự nhiên hơn nhiều so với “big/full curriculum”.'
    },
    cohesionPuzzle: {
      prompt: 'Sắp xếp 4 câu sau thành đoạn Thân bài mạch lạc theo chuẩn Topic Sentence → Explanation → Evidence → Impact:',
      items: [
        { id: 'A', role: 'Evidence', text: 'For example, students who learn budgeting and contract reading at school are far less likely to fall into high-interest debt as young adults.' },
        { id: 'B', role: 'Topic Sentence', text: 'Integrating practical competencies into secondary schooling prepares adolescents for the immediate demands of independent living.' },
        { id: 'C', role: 'Impact', text: 'Consequently, practical training complements academic study by fostering resilient, self-sufficient citizens.' },
        { id: 'D', role: 'Explanation', text: 'This is because everyday responsibilities require applied decision-making that purely theoretical textbooks rarely address.' }
      ],
      correctOrder: ['B', 'D', 'A', 'C'],
      explanation: 'Mạch chuẩn IELTS: B (Topic Sentence mở đoạn) → D (Giải thích nguyên lý bằng "This is because") → A (Ví dụ cụ thể "For example") → C (Kết luận tác động "Consequently").'
    }
  },
  'task2-traffic': {
    topic: 'Đô thị hóa & Giao thông · Nguyên nhân và Giải pháp Ùn tắc',
    instruction: 'Cause & Solution Essay (Xác định nguyên nhân chính và đề xuất giải pháp khả thi)',
    traps: [
      'Liệt kê giải pháp chung chung ("the government should build more roads") mà không giải thích cơ chế tác động.',
      'Giải pháp không khớp với nguyên nhân đã nêu ở đoạn trước.'
    ],
    collocations: [
      { phrase: 'alleviate chronic traffic congestion', meaning: 'Giảm thiểu tình trạng ùn tắc giao thông kinh niên' },
      { phrase: 'rapid urban sprawl', meaning: 'Sự mở rộng đô thị tự phát nhanh chóng' },
      { phrase: 'subsidise mass transit networks', meaning: 'Trợ giá mạng lưới giao thông công cộng' },
      { phrase: 'implement peak-hour congestion pricing', meaning: 'Áp dụng phí vào nội đô giờ cao điểm' },
      { phrase: 'over-reliance on private automobiles', meaning: 'Sự phụ thuộc quá mức vào phương tiện cá nhân' },
      { phrase: 'commuter bottleneck', meaning: 'Điểm nghẽn giao thông giờ đi làm' }
    ],
    modelEssay: {
      band: 8.5,
      paragraphs: [
        { role: 'Introduction', text: 'Severe traffic congestion has become a defining challenge for modern metropolises. This predicament stems primarily from over-reliance on private vehicles and underfunded transit infrastructure, yet it can be mitigated through targeted transit investment and peak-hour road pricing.' },
        { role: 'Body Paragraph 1 (Causes)', text: 'The primary driver of urban gridlock is the disproportionate growth of private car ownership relative to road capacity. As cities expand outward, commuters living in peripheral suburbs often lack reliable rail or bus connections, forcing millions of solo drivers onto arterial highways during identical peak windows.' },
        { role: 'Body Paragraph 2 (Solutions)', text: 'To alleviate this bottleneck, municipal authorities must prioritise high-capacity public transport while discouraging unnecessary car journeys. Expanding dedicated bus lanes and metro lines provides a punctual alternative, whereas congestion charges in central business districts incentivise off-peak travel and carpooling.' },
        { role: 'Conclusion', text: 'In conclusion, although commuter habits and inadequate transit options fuel urban traffic jams, coordinated investment in mass transit alongside smart road pricing offers a sustainable remedy.' }
      ]
    },
    collocationDrill: {
      sentence: 'Expanding metro networks and dedicated bus lanes can effectively ______ chronic traffic congestion in major cities.',
      options: ['alleviate', 'make', 'cancel', 'short'],
      answerIndex: 0,
      explanation: '“Alleviate/mitigate traffic congestion” là cụm động từ + danh từ chuẩn Band 8.0+ khi bàn về giải pháp hạ tầng đô thị.'
    },
    cohesionPuzzle: {
      prompt: 'Sắp xếp 4 câu sau thành đoạn Giải pháp (Solutions) có chuỗi nhân quả chặt chẽ:',
      items: [
        { id: 'A', role: 'Mechanism', text: 'By ring-fencing the revenue from these tolls to fund frequent metro services, cities can offer commuters a faster, affordable alternative.' },
        { id: 'B', role: 'Topic Sentence', text: 'An effective strategy to curb urban gridlock combines congestion pricing with rapid transit expansion.' },
        { id: 'C', role: 'Outcome', text: 'As a result, daily car volume drops significantly during rush hours without restricting mobility.' },
        { id: 'D', role: 'Elaboration', text: 'Charging private vehicles entering central districts during peak hours directly discourages non-essential solo trips.' }
      ],
      correctOrder: ['B', 'D', 'A', 'C'],
      explanation: 'B (Topic Sentence giới thiệu giải pháp kép) → D (Giải thích cơ chế thu phí) → A (Liên kết nguồn thu với đầu tư metro) → C (Kết quả đạt được).'
    }
  }
};

function buildFallbackAcademyData(task) {
  const isTask1Academic = task.type === 'task1-academic';
  const isTask1General = task.type === 'task1-general';
  if (isTask1Academic) {
    return {
      topic: `Academic Task 1 · ${task.title}`,
      instruction: 'Summarise main features and make supported comparisons (Tóm tắt xu hướng tổng quan và so sánh các số liệu nổi bật)',
      traps: [
        'Thiếu đoạn Overview (Tổng quan): Bài viết không có Overview rõ ràng rất khó vượt qua Band 6.0 ở tiêu chí Task Achievement.',
        'Đưa ý kiến cá nhân hoặc suy đoán nguyên nhân ngoài dữ liệu đề bài cung cấp.'
      ],
      collocations: [
        { phrase: 'exhibit a pronounced upward trajectory', meaning: 'Thể hiện xu hướng tăng trưởng rõ rệt' },
        { phrase: 'account for the largest proportion', meaning: 'Chiếm tỷ trọng lớn nhất' },
        { phrase: 'witness a marginal decline', meaning: 'Chứng kiến sự sụt giảm nhẹ' },
        { phrase: 'outpace the remaining categories', meaning: 'Vượt tốc độ tăng của các nhóm còn lại' },
        { phrase: 'hover around a stable plateau', meaning: 'Duy trì ổn định quanh một mức' },
        { phrase: 'over the surveyed period', meaning: 'Trong suốt giai đoạn được khảo sát' }
      ],
      modelEssay: {
        band: 8.5,
        paragraphs: [
          { role: 'Introduction', text: `The supplied diagram illustrates key quantitative patterns for ${task.title.toLowerCase()}, enabling direct comparison across the reported categories and time frames.` },
          { role: 'Overview', text: 'Overall, the most striking feature is the substantial divergence between the leading and trailing categories, alongside a clear structural shift over the surveyed period.' },
          { role: 'Details Paragraph 1', text: 'Looking first at the dominant categories, figures started at a comparatively modest baseline before experiencing steady, sustained growth. By contrast, mid-tier groups showed far more moderate fluctuations.' },
          { role: 'Details Paragraph 2', text: 'Turning to the remaining segments, their relative share either contracted slightly or increased at a slower pace, reinforcing the gap observed at the end of the timeframe.' }
        ]
      },
      collocationDrill: {
        sentence: 'Overall, renewable generation ______ a pronounced upward trajectory across all three regions between 2005 and 2025.',
        options: ['exhibited', 'made', 'did', 'happened'],
        answerIndex: 0,
        explanation: '“Exhibit/demonstrate an upward trajectory” là cách diễn đạt học thuật chuẩn xác thay cho những từ đơn giản như “made/did”.'
      },
      cohesionPuzzle: {
        prompt: 'Sắp xếp 4 câu sau theo cấu trúc chuẩn của bài Academic Task 1 (Intro → Overview → Detail 1 → Detail 2):',
        items: [
          { id: 'A', role: 'Overview', text: 'Overall, all three regions increased their renewable share markedly, with the South recording the fastest relative growth.' },
          { id: 'B', role: 'Intro', text: 'The table compares the proportion of electricity generated from renewable sources in three regions between 2005 and 2025.' },
          { id: 'C', role: 'Detail 2', text: 'Meanwhile, the South began at just 9% in 2005 but more than quadrupled to 39% by 2025, narrowing the gap with the other regions.' },
          { id: 'D', role: 'Detail 1', text: 'In 2005, Central led at 22%, closely followed by North at 18%; however, North overtook Central by 2025, reaching 47% compared with 42%.' }
        ],
        correctOrder: ['B', 'A', 'D', 'C'],
        explanation: 'Cấu trúc chuẩn Academic Task 1: B (Paraphrase đề bài) → A (Overview khái quát xu hướng chính) → D (Số liệu nhóm dẫn đầu) → C (Số liệu nhóm đối sánh).'
      }
    };
  }

  if (isTask1General) {
    return {
      topic: `General Training Task 1 · ${task.title}`,
      instruction: 'Cover all three bullet points with consistent register (Trả lời đầy đủ 3 yêu cầu của thư với văn phong nhất quán)',
      traps: [
        'Bỏ sót 1 trong 3 bullet points của đề bài hoặc chỉ nhắc thoáng qua một câu.',
        'Lệch văn phong (Register mismatch): Dùng từ lóng trong thư trang trọng hoặc viết quá cứng nhắc trong thư gửi bạn thân.'
      ],
      collocations: [
        { phrase: 'I am writing to bring to your attention', meaning: 'Tôi viết thư này để thông báo với quý vị về...' },
        { phrase: 'prompt resolution of this matter', meaning: 'Sự giải quyết nhanh chóng cho vấn đề này' },
        { phrase: 'substantially disrupted my concentration', meaning: 'Làm ảnh hưởng đáng kể đến sự tập trung của tôi' },
        { phrase: 'express my sincere gratitude', meaning: 'Bày tỏ lòng biết ơn chân thành' },
        { phrase: 'propose a workable arrangement', meaning: 'Đề xuất một phương án sắp xếp hợp lý' },
        { phrase: 'at your earliest convenience', meaning: 'Vào thời điểm thuận tiện sớm nhất của quý vị' }
      ],
      modelEssay: {
        band: 8.5,
        paragraphs: [
          { role: 'Opening & Purpose', text: 'Dear Sir or Madam, I am writing to formally report an issue regarding my recent experience and to request a practical resolution at your earliest convenience.' },
          { role: 'Bullet 1 & 2 (Context & Impact)', text: 'Specifically, the situation differed markedly from what was confirmed at the time of registration. Because this issue directly affected my schedule and daily work, I would appreciate your reviewing the details carefully.' },
          { role: 'Bullet 3 & Closing (Action Requested)', text: 'To resolve this matter fairly, I kindly request either a full replacement or a transfer to an alternative arrangement. Thank you in advance for your prompt attention. Yours faithfully, Alex Nguyen.' }
        ]
      },
      collocationDrill: {
        sentence: 'I would appreciate your ______ resolution of this issue so that I can complete the course as planned.',
        options: ['prompt', 'fastly', 'hurry', 'sudden'],
        answerIndex: 0,
        explanation: '“Prompt resolution” hoặc “prompt attention” là cụm collocation chuẩn mực nhất trong thư trang trọng / bán trang trọng.'
      },
      cohesionPuzzle: {
        prompt: 'Sắp xếp 4 phần của bức thư theo trình tự chuẩn General Training Task 1:',
        items: [
          { id: 'A', role: 'Purpose', text: 'I am writing to explain the noise problem affecting our Tuesday evening class and to suggest a simple solution.' },
          { id: 'B', role: 'Impact', text: 'Because the adjacent hall hosts music rehearsals at the same hour, several students struggle to hear the lecturer clearly.' },
          { id: 'C', role: 'Solution & Sign-off', text: 'Could our group be relocated to a quieter classroom on the second floor from next week? Kind regards, Minh Tran.' },
          { id: 'D', role: 'Salutation', text: 'Dear Course Manager,' }
        ],
        correctOrder: ['D', 'A', 'B', 'C'],
        explanation: 'D (Lời chào đúng đối tượng) → A (Nêu mục đích viết thư ngay câu đầu) → B (Mô tả vấn đề & hệ quả) → C (Đề xuất hướng giải quyết lịch sự và kết thư).'
      }
    };
  }

  return {
    topic: `Academic Task 2 · ${task.title}`,
    instruction: `${task.skillFocus} (Trả lời trực diện câu hỏi, phát triển luận điểm bằng giải thích và ví dụ cụ thể)`,
    traps: [
      'Đưa ra luận điểm (Claim) nhưng nhảy sang ý mới mà không giải thích nguyên lý (Why/How).',
      'Dùng từ nối cơ học ("Firstly, Secondly, Moreover, Furthermore") ở đầu mọi câu văn thay vì liên kết bằng mạch ý.'
    ],
    collocations: [
      { phrase: 'exert a profound influence on', meaning: 'Tạo ra ảnh hưởng sâu sắc tới...' },
      { phrase: 'weigh the long-term implications', meaning: 'Cân nhắc các hệ quả dài hạn' },
      { phrase: 'implement targeted policy interventions', meaning: 'Thực thi các biện pháp can thiệp chính sách có trọng tâm' },
      { phrase: 'foster sustainable socio-economic growth', meaning: 'Thúc đẩy tăng trưởng kinh tế - xã hội bền vững' },
      { phrase: 'mitigate unintended consequences', meaning: 'Giảm thiểu các hệ lụy ngoài ý muốn' },
      { phrase: 'strike a pragmatic balance between', meaning: 'Đạt được sự cân bằng thực tế giữa...' }
    ],
    modelEssay: {
      band: 8.5,
      paragraphs: [
        { role: 'Introduction', text: `Contemporary policy discussions increasingly centre on ${task.title.toLowerCase()}. While competing priorities exist on both sides of the issue, I maintain that a balanced, evidence-led approach yields the most durable public benefit.` },
        { role: 'Body Paragraph 1', text: 'From an immediate practical standpoint, targeted investment addresses pressing community needs. When authorities allocate resources transparently and align incentives with citizen behaviour, measurable improvements emerge within a short timeframe.' },
        { role: 'Body Paragraph 2', text: 'At the same time, long-term resilience depends on safeguarding broader social and environmental foundations. Neglecting these structural factors often generates higher remediation costs in the future, which is why complementary regulations remain essential.' },
        { role: 'Conclusion', text: 'In conclusion, rather than viewing these priorities as mutually exclusive, policymakers and individuals should combine immediate practical measures with long-term stewardship.' }
      ]
    },
    collocationDrill: {
      sentence: 'Policymakers must ______ a pragmatic balance between immediate economic demands and long-term sustainability.',
      options: ['strike', 'hit', 'do', 'take'],
      answerIndex: 0,
      explanation: '“Strike a balance between A and B” là cụm idiomatic collocation chuẩn mực trong văn viết học thuật Band 8.0+.'
    },
    cohesionPuzzle: {
      prompt: 'Sắp xếp 4 câu sau thành đoạn lập luận chặt chẽ theo khung PEEL (Point → Explanation → Example → Link):',
      items: [
        { id: 'A', role: 'Example', text: 'For instance, municipalities that pair green spaces with medium-density transit housing have improved both air quality and housing affordability.' },
        { id: 'B', role: 'Point', text: 'Urban planning performs best when environmental preservation and housing supply are designed as complementary goals.' },
        { id: 'C', role: 'Link', text: 'Therefore, cities need not sacrifice public parks in order to accommodate growing populations.' },
        { id: 'D', role: 'Explanation', text: 'Compact vertical development frees up ground-level land for recreational corridors while keeping residents close to public transport.' }
      ],
      correctOrder: ['B', 'D', 'A', 'C'],
      explanation: 'B (Point/Topic Sentence) → D (Explanation giải thích cơ chế quy hoạch) → A (Example dẫn chứng thực tế) → C (Link khẳng định lại luận điểm).'
    }
  };
}

export function getTaskAcademyData(task = {}) {
  const custom = TASK_ACADEMY_CATALOG[task.id];
  if (custom) return custom;
  return buildFallbackAcademyData(task);
}

export function formatOutlineForEditor(outline = {}, existingDraft = '') {
  const intro = String(outline.intro || '').trim() || 'Paraphrase câu hỏi + Nêu Thesis Statement rõ ràng.';
  const body1 = String(outline.body1 || '').trim() || 'Topic Sentence 1 + Giải thích cơ chế (Why/How) + Ví dụ cụ thể.';
  const body2 = String(outline.body2 || '').trim() || 'Topic Sentence 2 + Lập luận bổ trợ / Phản biện + Hệ quả.';
  const conclusion = String(outline.conclusion || '').trim() || 'Tóm lược 2 luận điểm chính + Khẳng định lại lập trường.';

  const block = [
    '[DÀN Ý HỌC THUẬT · WMR IDEA LAB]',
    `1. Mở bài (Introduction): ${intro}`,
    `2. Thân bài 1 (Body 1): ${body1}`,
    `3. Thân bài 2 (Body 2): ${body2}`,
    `4. Kết bài (Conclusion): ${conclusion}`,
    '---'
  ].join('\n');

  const trimmedExisting = String(existingDraft || '').trim();
  if (!trimmedExisting) return block + '\n\n';
  const cleaned = trimmedExisting.replace(/^\[DÀN Ý HỌC THUẬT · WMR IDEA LAB\][\s\S]*?---\s*/m, '').trim();
  return cleaned ? `${block}\n\n${cleaned}` : `${block}\n\n`;
}

export function buildSentenceSurgery(issue = {}, taskType = 'task2') {
  const rawCategory = String(issue.category || 'other');
  const quote = String(issue.quote || '').trim();
  const suggestedFix = String(issue.suggestedFix || '').trim();
  const explanation = String(issue.explanation || '').trim();

  const diagnosis = explanation || (
    rawCategory === 'lexical'
      ? 'Từ vựng còn mang tính khẩu ngữ hoặc chung chung (Band 5.5–6.0), thiếu cụm collocation học thuật tự nhiên.'
      : rawCategory === 'grammar'
        ? 'Cấu trúc câu còn đơn điệu hoặc có lỗi chia động từ / mệnh đề phụ thuộc làm giảm độ chính xác ngữ pháp.'
        : rawCategory === 'coherence'
          ? 'Chuyển ý giữa hai mệnh đề còn đột ngột, thiếu từ nối chỉ quan hệ nguyên nhân - hệ quả rõ ràng.'
          : 'Luận điểm chưa đi thẳng vào trọng tâm câu hỏi hoặc còn thiếu bằng chứng cụ thể.'
  );

  const band75 = suggestedFix || (
    quote
      ? `Moreover, ${quote.charAt(0).toLowerCase() + quote.slice(1).replace(/\.$/, '')}, which directly shapes long-term outcomes.`
      : 'Furthermore, targeted policy measures can address the root causes of this issue effectively.'
  );

  const band85 = rawCategory === 'lexical'
    ? (suggestedFix
        ? `${suggestedFix.replace(/\.$/, '')}, thereby fostering sustainable long-term outcomes.`
        : 'Consequently, implementing evidence-based interventions proves instrumental in mitigating this challenge.')
    : rawCategory === 'grammar'
      ? (suggestedFix
          ? `Not only does this approach address immediate constraints, but it also strengthens long-term resilience (${suggestedFix.replace(/\.$/, '')}).`
          : 'Had authorities prioritised structural reforms earlier, the long-term pressures observed today would have been substantially curtailed.')
      : taskType === 'task1-academic'
        ? 'Notably, the upward trajectory in the primary category outpaced all other segments throughout the surveyed period.'
        : (suggestedFix
            ? `${suggestedFix.replace(/\.$/, '')}, underscoring the necessity of a balanced, forward-looking framework.`
            : 'Ultimately, reconciling these competing priorities requires both institutional commitment and informed civic participation.');

  return {
    diagnosis,
    band75,
    band85
  };
}

export function renderMasteryRadarSvg(criterionScores = []) {
  const byId = new Map((Array.isArray(criterionScores) ? criterionScores : []).map(item => [item.id, item]));
  const trMean = byId.get('taskResponse')?.mean ?? byId.get('taskAchievement')?.mean ?? null;
  const ccMean = byId.get('coherence')?.mean ?? null;
  const lrMean = byId.get('lexical')?.mean ?? null;
  const graMean = byId.get('grammar')?.mean ?? null;

  const axes = [
    { label: 'TR / TA', score: Number.isFinite(trMean) ? trMean : 6.0, angle: -Math.PI / 2 },
    { label: 'Coherence (CC)', score: Number.isFinite(ccMean) ? ccMean : 6.0, angle: 0 },
    { label: 'Lexical (LR)', score: Number.isFinite(lrMean) ? lrMean : 6.0, angle: Math.PI / 2 },
    { label: 'Grammar (GRA)', score: Number.isFinite(graMean) ? graMean : 6.0, angle: Math.PI }
  ];

  const cx = 140;
  const cy = 125;
  const maxR = 82;
  const pointAt = (angle, band) => {
    const clamped = Math.max(0, Math.min(9, Number(band) || 0));
    const r = (clamped / 9) * maxR;
    const x = (cx + r * Math.cos(angle)).toFixed(1);
    const y = (cy + r * Math.sin(angle)).toFixed(1);
    return `${x},${y}`;
  };

  const rings = [5, 6, 7, 8, 9].map(band => {
    const pts = axes.map(axis => pointAt(axis.angle, band)).join(' ');
    return `<polygon class="radar-grid-ring" points="${pts}" fill="none" stroke="currentColor" stroke-opacity="0.16" stroke-width="1" />`;
  }).join('');

  const spokes = axes.map(axis => {
    const end = pointAt(axis.angle, 9);
    const [ex, ey] = end.split(',');
    return `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="currentColor" stroke-opacity="0.22" stroke-width="1" stroke-dasharray="3 3" />`;
  }).join('');

  const dataPoints = axes.map(axis => pointAt(axis.angle, axis.score)).join(' ');
  const dots = axes.map(axis => {
    const [px, py] = pointAt(axis.angle, axis.score).split(',');
    return `<circle cx="${px}" cy="${py}" r="4.5" class="radar-vertex-dot" />`;
  }).join('');

  const labels = [
    `<text x="${cx}" y="24" text-anchor="middle" class="radar-axis-label">${escapeXml(axes[0].label)} (${axes[0].score.toFixed(1)})</text>`,
    `<text x="${cx + maxR + 12}" y="${cy + 4}" text-anchor="start" class="radar-axis-label">${escapeXml(axes[1].label)} (${axes[1].score.toFixed(1)})</text>`,
    `<text x="${cx}" y="${cy + maxR + 24}" text-anchor="middle" class="radar-axis-label">${escapeXml(axes[2].label)} (${axes[2].score.toFixed(1)})</text>`,
    `<text x="${cx - maxR - 12}" y="${cy + 4}" text-anchor="end" class="radar-axis-label">${escapeXml(axes[3].label)} (${axes[3].score.toFixed(1)})</text>`
  ].join('');

  return `<svg class="mastery-radar-svg" viewBox="0 0 280 250" role="img" aria-label="Biểu đồ Radar cân bằng 4 tiêu chí IELTS Writing">${rings}${spokes}<polygon class="radar-data-polygon" points="${dataPoints}" />${dots}${labels}</svg>`;
}

export function evaluateCollocationChoice(drill = {}, choiceIndex = -1) {
  const idx = Number(choiceIndex);
  const correct = Number.isInteger(idx) && idx === drill.answerIndex;
  const chosen = Array.isArray(drill.options) ? (drill.options[idx] || '') : '';
  return {
    correct,
    phrase: chosen,
    explanation: drill.explanation || ''
  };
}

export function evaluateCohesionOrder(puzzle = {}, orderedIds = []) {
  const expected = Array.isArray(puzzle.correctOrder) ? puzzle.correctOrder : [];
  const actual = Array.isArray(orderedIds) ? orderedIds : [];
  let score = 0;
  for (let i = 0; i < expected.length; i += 1) {
    if (actual[i] === expected[i]) score += 1;
  }
  return {
    correct: expected.length > 0 && score === expected.length && actual.length === expected.length,
    score,
    total: expected.length,
    explanation: puzzle.explanation || ''
  };
}
