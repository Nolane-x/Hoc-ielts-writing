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
      qualityStatus: 'illustrative-unvalidated',
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
      qualityStatus: 'illustrative-unvalidated',
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
  const type = String(task.type || 'task2');
  const title = String(task.title || 'IELTS Writing task');
  const id = String(task.id || '');
  const academic1 = type === 'task1-academic';
  const general1 = type === 'task1-general';
  const process = /process/i.test(title);
  const map = /map/i.test(title);
  const informal = /friend|informal/i.test(id + ' ' + title);
  const letterPurpose = /apology/i.test(id + ' ' + title) ? 'apologise for [the situation]'
    : /advice/i.test(id + ' ' + title) ? 'offer my thoughts about [the problem]'
    : /request/i.test(id + ' ' + title) ? 'ask whether [the requested action] would be possible'
    : /complaint|formal/i.test(id + ' ' + title) ? 'raise a concern about [the issue]'
    : 'explain [the purpose of this letter]';
  const qualityStatus = 'illustrative-unvalidated';
  const commonCollocations = [
    { phrase: 'play a significant role in', meaning: 'Đóng vai trò đáng kể trong' },
    { phrase: 'address the underlying causes of', meaning: 'Giải quyết các nguyên nhân gốc rễ của' },
    { phrase: 'have a measurable effect on', meaning: 'Có tác động có thể đo lường lên' },
    { phrase: 'in the long term', meaning: 'Về dài hạn' },
    { phrase: 'a practical alternative to', meaning: 'Một lựa chọn thay thế khả thi cho' },
    { phrase: 'outweigh the potential drawbacks of', meaning: 'Vượt trội hơn những bất lợi tiềm tàng của' }
  ];
  let topic, instruction, traps, collocations, modelEssay, collocationDrill, cohesionPuzzle;

  if (academic1) {
    topic = title + ' · mô tả dữ liệu / hình ảnh';
    instruction = 'Summarise the most important features using only information visible in the actual prompt.';
    traps = [
      'Không tự bịa số liệu, mốc thời gian, địa danh hoặc giai đoạn không xuất hiện trong đề.',
      'Overview phải nêu đặc điểm lớn nhất; không liệt kê chi tiết mà thiếu so sánh hoặc cấu trúc.'
    ];
    collocations = [
      { phrase: 'remain broadly stable', meaning: 'Duy trì tương đối ổn định' },
      { phrase: 'show a gradual increase', meaning: 'Cho thấy mức tăng dần' },
      { phrase: 'reach a peak of', meaning: 'Đạt đỉnh ở mức' },
      { phrase: 'account for the largest share', meaning: 'Chiếm tỷ trọng lớn nhất' },
      { phrase: 'undergo a substantial transformation', meaning: 'Trải qua sự thay đổi đáng kể' },
      { phrase: 'pass through successive stages', meaning: 'Đi qua các giai đoạn liên tiếp' }
    ];
    modelEssay = { qualityStatus, paragraphs: process ? [
      { role: 'Introduction', text: 'The diagram illustrates how [product or material] is produced through [number] main stages.' },
      { role: 'Overview', text: 'Overall, the process begins with [initial input] and ends with [final output], passing through [number] stages.' },
      { role: 'Details · early stages', text: 'At the outset, [describe the first labelled stage]. The material is then [describe the next visible step].' },
      { role: 'Details · later stages', text: 'Following this, [describe the remaining steps in order], before the process concludes with [final stage].' }
    ] : map ? [
      { role: 'Introduction', text: 'The maps compare [place] at [year 1] and [year 2].' },
      { role: 'Overview', text: 'Overall, the area became [more/less developed], with the main changes involving [features actually shown].' },
      { role: 'Details · earlier layout', text: 'In the earlier map, [describe the original layout]. By [year 2], [describe confirmed changes].' },
      { role: 'Details · changed features', text: 'A further change was [feature], which was [added/removed/relocated]. Mention unchanged features only when visible.' }
    ] : [
      { role: 'Introduction', text: 'The [chart/graph/table] illustrates [what is measured] across [categories or locations] over [the period shown].' },
      { role: 'Overview', text: 'Overall, the clearest features are [main pattern] and [important contrast]. Support these observations with the actual visual.' },
      { role: 'Details · first comparison', text: 'At [starting point], [category] stood at [value]. It then [rose/fell/remained stable] to [value], according to the figures shown.' },
      { role: 'Details · second comparison', text: 'By contrast, [another category] [describe the observed pattern]. Compare relevant values without inventing missing data.' }
    ] };
    collocationDrill = process
      ? { sentence: 'The diagram illustrates how [a product] is ______ through several stages.', options: ['processed', 'did', 'happened', 'made'], answerIndex: 0, explanation: '“Is processed through several stages” is suitable process-description wording; replace the placeholder with the actual process.' }
      : map
        ? { sentence: 'The area underwent a substantial ______ over the period shown.', options: ['transformation', 'transform', 'transformed', 'transforming'], answerIndex: 0, explanation: '“Underwent a substantial transformation” is a natural phrase for mapped change.' }
        : { sentence: 'The figure for [category] ______ noticeably over the period shown.', options: ['changed', 'did', 'made', 'happened'], answerIndex: 0, explanation: 'Choose wording that fits the actual trend after checking the visual.' };
    cohesionPuzzle = {
      prompt: 'Order the functional parts of an Academic Task 1 response: introduction → overview → detail group 1 → detail group 2.',
      items: [
        { id: 'A', role: 'Detail 1', text: 'Describe a relevant group of values or features supported by the visual.' },
        { id: 'B', role: 'Introduction', text: 'Paraphrase what the visual shows, including supplied categories and period.' },
        { id: 'C', role: 'Detail 2', text: 'Describe a second group or remaining features without repeating detail 1.' },
        { id: 'D', role: 'Overview', text: 'Summarise the main trends, differences or stages without listing every value.' }
      ],
      correctOrder: ['B', 'D', 'A', 'C'],
      explanation: 'Identify the visual, summarise its main features, then add selected supporting detail. Adapt to the actual visual type.'
    };
  } else if (general1) {
    topic = 'General Training Task 1 · ' + title;
    instruction = 'Address all three bullet points and keep register consistent with recipient and purpose.';
    traps = [
      'Bỏ sót bullet point hoặc chỉ nhắc đến mà không giải thích đủ.',
      'Văn phong phải phù hợp với người nhận; thư bạn bè không nên dùng giọng hành chính cứng nhắc.'
    ];
    collocations = informal ? [
      { phrase: 'catch up with you', meaning: 'Trò chuyện / cập nhật tình hình với bạn' },
      { phrase: 'give you a hand with', meaning: 'Giúp bạn xử lý việc gì' },
      { phrase: 'I was delighted to hear', meaning: 'Mình rất vui khi biết tin' },
      { phrase: 'it would be great if', meaning: 'Sẽ thật tuyệt nếu' },
      { phrase: 'thanks for letting me know', meaning: 'Cảm ơn bạn đã báo cho mình biết' },
      { phrase: 'take care and write soon', meaning: 'Giữ gìn sức khỏe và sớm viết thư nhé' }
    ] : [
      { phrase: 'I am writing to enquire about', meaning: 'Tôi viết thư để hỏi về' },
      { phrase: 'bring this matter to your attention', meaning: 'Đưa vấn đề này đến sự chú ý của quý vị' },
      { phrase: 'provide further information about', meaning: 'Cung cấp thêm thông tin về' },
      { phrase: 'I would be grateful if', meaning: 'Tôi sẽ rất cảm kích nếu' },
      { phrase: 'a suitable arrangement', meaning: 'Một phương án sắp xếp phù hợp' },
      { phrase: 'thank you for your consideration', meaning: 'Cảm ơn quý vị đã xem xét' }
    ];
    modelEssay = { qualityStatus, paragraphs: informal ? [
      { role: 'Greeting & purpose', text: 'Hi [name], I hope you are doing well. I am writing because [clear purpose].' },
      { role: 'Bullet point 1', text: 'First, [give the information requested in bullet 1, with a relevant detail].' },
      { role: 'Bullet points 2 & 3', text: 'Also, [address bullet 2]. As for [bullet 3], [give a relevant detail or request].' },
      { role: 'Friendly close', text: 'Let me know what you think. Take care and write soon, [your name].' }
    ] : [
      { role: 'Greeting & purpose', text: 'Dear [recipient], I am writing to ' + letterPurpose + '.' },
      { role: 'Bullet point 1', text: 'With regard to [bullet 1], [provide relevant facts and a specific detail].' },
      { role: 'Bullet points 2 & 3', text: 'In addition, [address bullet 2]. I would also like to [address bullet 3 with a reasonable request or explanation].' },
      { role: 'Formal close', text: 'Thank you for your time and consideration. Yours sincerely, [your name].' }
    ] };
    collocationDrill = informal
      ? { sentence: 'I would be happy to ______ with the event if you need extra help.', options: ['give you a hand', 'do a hand', 'make a help', 'take a support'], answerIndex: 0, explanation: '“Give you a hand” is a natural informal expression. Match register to the recipient.' }
      : { sentence: 'I would be grateful if you could ______ this matter at your earliest convenience.', options: ['review', 'make', 'do', 'put'], answerIndex: 0, explanation: '“Review this matter” is a natural formal request; ensure it fits the letter purpose.' };
    cohesionPuzzle = {
      prompt: 'Order a General Training letter: greeting → purpose → required details → suitable close.',
      items: [
        { id: 'A', role: 'Details', text: 'Address the remaining bullet points with specific, relevant information.' },
        { id: 'B', role: 'Greeting', text: informal ? 'Hi [name],' : 'Dear [recipient],' },
        { id: 'C', role: 'Purpose', text: 'State the reason for writing near the beginning.' },
        { id: 'D', role: 'Close', text: informal ? 'Take care and write soon, [name].' : 'Thank you for your consideration. Yours sincerely, [name].' }
      ],
      correctOrder: ['B', 'C', 'A', 'D'],
      explanation: 'Illustrative order: greeting, purpose, required information and an appropriate close.'
    };
  } else {
    topic = 'Academic Task 2 · ' + title;
    instruction = String(task.skillFocus || 'Answer every part of the prompt') + ' (Trả lời trực diện đề, phát triển luận điểm bằng giải thích và ví dụ liên quan).';
    traps = [
      'Đưa ra luận điểm nhưng không giải thích vì sao hoặc bằng cách nào luận điểm đó đúng.',
      'Dùng ví dụ chung chung hoặc khẳng định tuyệt đối mà không có căn cứ; chọn ví dụ trực tiếp hỗ trợ luận điểm.'
    ];
    collocations = commonCollocations;
    modelEssay = { qualityStatus, paragraphs: [
      { role: 'Introduction', text: '[Paraphrase the exact question]. My position is that [clear answer], mainly because [reason 1] and [reason 2].' },
      { role: 'Body paragraph 1', text: 'One important reason is [claim linked to the prompt]. This matters because [explain the mechanism], which can lead to [relevant consequence]. For example, [specific and credible example].' },
      { role: 'Body paragraph 2', text: 'A further consideration is [second claim or counterargument]. Although [reasonable qualification], [explain why this affects your position].' },
      { role: 'Conclusion', text: 'In conclusion, [answer the exact question again in different words]. The strongest reasons are [summarise the developed points].' }
    ] };
    collocationDrill = {
      sentence: 'A well-designed response can play a significant role in ______ the underlying causes of a problem.',
      options: ['addressing', 'address', 'addressed', 'addresses'],
      answerIndex: 0,
      explanation: 'After “role in”, use a noun or gerund; “addressing the underlying causes” is grammatically correct.'
    };
    cohesionPuzzle = {
      prompt: 'Order a Task 2 body paragraph using PEEL: Point → Explanation → Example → Link.',
      items: [
        { id: 'A', role: 'Example', text: 'For example, [a specific case] demonstrates the mechanism described above.' },
        { id: 'B', role: 'Point', text: 'One key reason is [a clear claim that answers the prompt].' },
        { id: 'C', role: 'Link', text: 'Therefore, this evidence supports the paragraph’s main point about [the question].' },
        { id: 'D', role: 'Explanation', text: 'This is because [explain why or how the claim leads to an outcome].' }
      ],
      correctOrder: ['B', 'D', 'A', 'C'],
      explanation: 'PEEL is a planning scaffold; the actual argument must fit the prompt and use relevant evidence.'
    };
  }
  return { topic, instruction, traps, collocations, modelEssay, collocationDrill, cohesionPuzzle };
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
  const teachingHint = String(issue.teachingHint || '').trim();
  const categoryDiagnosis = rawCategory === 'lexical'
    ? 'Kiểm tra độ chính xác, sắc thái và collocation; từ khó hơn không tự động tốt hơn.'
    : rawCategory === 'grammar'
      ? 'Kiểm tra cấu trúc câu, sự hòa hợp chủ-vị, mạo từ, thì và dấu câu trong ngữ cảnh.'
      : rawCategory === 'coherence'
        ? 'Kiểm tra quan hệ logic giữa các câu và liệu mỗi câu có phát triển đúng luận điểm của đoạn.'
        : 'Kiểm tra mức độ trực tiếp trả lời yêu cầu của đề và bằng chứng hỗ trợ luận điểm.';
  return {
    diagnosis: explanation || (quote ? 'Đoạn được trích: “' + quote + '”. ' + categoryDiagnosis : categoryDiagnosis),
    suggestedRevision: suggestedFix,
    learningNote: teachingHint || (taskType === 'task1-academic'
      ? 'Chỉ mô tả đặc điểm có thể xác minh trên biểu đồ, bản đồ hoặc sơ đồ của đề.'
      : 'Tự kiểm tra xem bản sửa có giữ nguyên ý định của bạn và trả lời đúng câu hỏi không.')
  };
}

export function renderMasteryRadarSvg(criterionScores = []) {
  const byId = new Map((Array.isArray(criterionScores) ? criterionScores : []).map(item => [item.id, item]));
  const scoreFor = ids => {
    for (const id of ids) {
      const item = byId.get(id);
      if (item && Number.isFinite(item.mean) && Number(item.count) > 0) return item.mean;
    }
    return null;
  };
  const axes = [
    { label: 'TR / TA', score: scoreFor(['taskResponse', 'taskAchievement']), angle: -Math.PI / 2 },
    { label: 'Coherence (CC)', score: scoreFor(['coherence']), angle: 0 },
    { label: 'Lexical (LR)', score: scoreFor(['lexical']), angle: Math.PI / 2 },
    { label: 'Grammar (GRA)', score: scoreFor(['grammar']), angle: Math.PI }
  ];
  const cx = 140, cy = 125, maxR = 82;
  const pointAt = (angle, band) => {
    const clamped = Math.max(0, Math.min(9, Number(band) || 0));
    const radius = (clamped / 9) * maxR;
    return (cx + radius * Math.cos(angle)).toFixed(1) + ',' + (cy + radius * Math.sin(angle)).toFixed(1);
  };
  const rings = [5, 6, 7, 8, 9].map(band => '<polygon class="radar-grid-ring" points="' +
    axes.map(axis => pointAt(axis.angle, band)).join(' ') +
    '" fill="none" stroke="currentColor" stroke-opacity="0.16" stroke-width="1" />').join('');
  const spokes = axes.map(axis => {
    const [x, y] = pointAt(axis.angle, 9).split(',');
    return '<line x1="' + cx + '" y1="' + cy + '" x2="' + x + '" y2="' + y + '" stroke="currentColor" stroke-opacity="0.22" stroke-width="1" stroke-dasharray="3 3" />';
  }).join('');
  const scoredAxes = axes.filter(axis => axis.score !== null);
  const dots = scoredAxes.map(axis => {
    const [x, y] = pointAt(axis.angle, axis.score).split(',');
    return '<circle cx="' + x + '" cy="' + y + '" r="4.5" class="radar-vertex-dot" />';
  }).join('');
  const polygon = scoredAxes.length === axes.length
    ? '<polygon class="radar-data-polygon" points="' + axes.map(axis => pointAt(axis.angle, axis.score)).join(' ') + '" />'
    : '';
  const labels = [
    '<text x="' + cx + '" y="24" text-anchor="middle" class="radar-axis-label">TR / TA (' + (axes[0].score === null ? '—' : axes[0].score.toFixed(1)) + ')</text>',
    '<text x="' + (cx + maxR + 12) + '" y="' + (cy + 4) + '" text-anchor="start" class="radar-axis-label">CC (' + (axes[1].score === null ? '—' : axes[1].score.toFixed(1)) + ')</text>',
    '<text x="' + cx + '" y="' + (cy + maxR + 24) + '" text-anchor="middle" class="radar-axis-label">LR (' + (axes[2].score === null ? '—' : axes[2].score.toFixed(1)) + ')</text>',
    '<text x="' + (cx - maxR - 12) + '" y="' + (cy + 4) + '" text-anchor="end" class="radar-axis-label">GRA (' + (axes[3].score === null ? '—' : axes[3].score.toFixed(1)) + ')</text>'
  ].join('');
  return '<svg class="mastery-radar-svg" viewBox="0 0 280 250" role="img" aria-label="Biểu đồ Radar cân bằng 4 tiêu chí IELTS Writing">' +
    rings + spokes + polygon + dots + labels + '</svg>';
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
