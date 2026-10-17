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
      label: 'Bài mẫu tham khảo', calibration: 'not-calibrated-against-independent-human-rated-corpus',
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
      explanation: '“Holistic curriculum” là cụm collocation theo chủ đề diễn tả chương trình giáo dục toàn diện, tự nhiên hơn so với “big/full curriculum”.'
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
      label: 'Bài mẫu tham khảo', calibration: 'not-calibrated-against-independent-human-rated-corpus',
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

const TASK_ACADEMY_DETAILS = JSON.parse(String.raw`{
  "task2-discussion": {
    "topic":"Remote work · hiệu suất và sự kết nối",
    "instruction":"Discuss both views and give your own opinion",
    "traps":["Đừng đồng nhất sự linh hoạt với năng suất cao trong mọi công việc.","Đánh giá cả lợi ích của thời gian đi lại tiết kiệm lẫn rủi ro cô lập và phối hợp kém."],
    "collocations":[["reduce commuting time","giảm thời gian đi lại"],["maintain team cohesion","duy trì sự gắn kết của nhóm"],["coordinate distributed teams","điều phối nhóm làm việc phân tán"],["measure employee output","đánh giá kết quả công việc"],["blur work-life boundaries","làm mờ ranh giới công việc và đời sống"],["provide flexible arrangements","cung cấp hình thức làm việc linh hoạt"]],
    "paragraphs":[["Introduction","Remote work has changed how many organisations manage people and measure performance. Although it offers substantial flexibility, I believe it works best when employers combine autonomy with deliberate communication."],["Benefits","Working from home removes commuting time and can give employees longer periods of uninterrupted concentration. This arrangement is particularly valuable for tasks that require individual analysis rather than constant face-to-face coordination."],["Drawbacks","However, new employees may struggle to learn informally, while complex projects can slow down when colleagues rarely share the same working hours. Regular check-ins and clear ownership are therefore necessary to maintain team cohesion."],["Conclusion","Remote work is neither automatically productive nor inherently isolating. A hybrid policy based on job requirements, transparent goals and accessible collaboration is more persuasive than a universal rule." ]],
    "drill":{"sentence":"Clear written goals help managers ______ employee output in a distributed team.","options":["measure","make","do","take"],"answerIndex":0,"explanation":"Measure output kết hợp tự nhiên với việc đánh giá kết quả công việc; chọn động từ đúng ngữ cảnh thay vì dịch từng chữ."}
  },
  "task2-online-learning": {
    "topic":"Online learning · tính linh hoạt và khả năng tự học",
    "instruction":"Explain the advantages and disadvantages of studying online",
    "traps":["Đừng chỉ liệt kê tính linh hoạt và tiết kiệm chi phí; hãy giải thích lợi ích đến với ai và bằng cách nào.","Không khẳng định mọi học viên đều có kết nối, thiết bị hoặc khả năng tự quản lý như nhau."],
    "collocations":[["learn at one's own pace","học theo nhịp độ cá nhân"],["overcome geographical barriers","vượt rào cản địa lý"],["sustain learner engagement","duy trì sự tham gia của người học"],["receive timely feedback","nhận phản hồi kịp thời"],["exercise self-discipline","rèn tính tự giác"],["widen access to education","mở rộng khả năng tiếp cận giáo dục"]],
    "paragraphs":[["Introduction","Online courses have become a practical alternative to attending classes in person. Their main strength is flexibility, but their success depends heavily on the learner's circumstances and self-discipline."],["Advantages","Recorded lessons allow students to revisit difficult explanations and learn at their own pace. Online study can also widen access for people who live far from specialist schools or must balance education with work."],["Disadvantages","The same flexibility can become a weakness when students postpone tasks or receive little timely feedback. Practical subjects and discussion-based lessons may also be less effective if learners lack suitable equipment or a stable connection."],["Conclusion","Online learning expands educational choice, but it is not a universal replacement for face-to-face teaching. A blended approach can preserve flexible access while providing guidance, interaction and practical support." ]],
    "drill":{"sentence":"Short feedback cycles can help teachers ______ learner engagement in an online course.","options":["sustain","make","do","perform"],"answerIndex":0,"explanation":"Sustain engagement nghĩa là duy trì sự tham gia theo thời gian; đây là kết hợp từ tự nhiên trong bối cảnh giáo dục."}
  },
  "task2-packaging": {
    "topic":"Excessive packaging · động cơ thương mại và trách nhiệm môi trường",
    "instruction":"Explain why excessive packaging occurs and what governments and consumers can do",
    "traps":["Tách nguyên nhân từ doanh nghiệp khỏi thói quen và kỳ vọng của người mua.","Giải pháp phải xử lý động cơ tạo ra bao bì dư thừa, không chỉ kêu gọi tái chế."],
    "collocations":[["protect goods in transit","bảo vệ hàng hóa khi vận chuyển"],["influence purchasing decisions","ảnh hưởng quyết định mua hàng"],["introduce producer-responsibility rules","đưa ra quy định trách nhiệm nhà sản xuất"],["incentivise reusable packaging","khuyến khích bao bì tái sử dụng"],["reduce material consumption","giảm tiêu thụ vật liệu"],["separate recyclable waste","phân loại rác có thể tái chế"]],
    "paragraphs":[["Introduction","Excessive packaging is driven by commercial incentives as well as concerns about product safety. Governments can change the incentives businesses face, while consumers can reward companies that use less material."],["Reasons","Packaging protects fragile goods during transport and gives brands space for marketing. In competitive markets, oversized boxes can also make a product appear more substantial, even when the additional material provides little practical benefit."],["Government action","Governments can require clear reporting, set limits on unnecessary materials and make producers responsible for the cost of collection and recycling. Such policies encourage redesign rather than relying entirely on consumers to sort waste."],["Consumer action","Consumers can choose refillable products, avoid unnecessary single-use items and support brands that disclose packaging practices. These choices are most influential when convenient alternatives are widely available and information is easy to compare."]],
    "drill":{"sentence":"Producer-responsibility rules can ______ companies to redesign wasteful packaging.","options":["incentivise","do","make","perform"],"answerIndex":0,"explanation":"Incentivise companies to do something diễn tả chính xác việc tạo động lực kinh tế để doanh nghiệp thay đổi."}
  },
  "task2-public-transport": {
    "topic":"Public transport vs. road building · ưu tiên ngân sách đô thị",
    "instruction":"Discuss both views and give your own opinion",
    "traps":["Không mô tả cả hai lựa chọn như giải pháp hoàn hảo cho mọi thành phố.","Phân biệt nhu cầu duy tu đường hiện tại với việc mở rộng năng lực đường bộ liên tục."],
    "collocations":[["expand transit capacity","mở rộng năng lực vận tải công cộng"],["ease peak-hour congestion","giảm ùn tắc giờ cao điểm"],["maintain existing road networks","bảo trì mạng lưới đường hiện có"],["connect underserved neighbourhoods","kết nối khu vực chưa được phục vụ tốt"],["reduce car dependency","giảm sự phụ thuộc vào ô tô"],["allocate public funds strategically","phân bổ ngân sách công có chiến lược"]],
    "paragraphs":[["Introduction","Roads and public transport both support urban mobility, but they solve different problems. I would prioritise reliable public transport while preserving enough funding to maintain essential road connections."],["Public transport","Frequent buses and rail services can move many people in limited space and connect residents who cannot drive. When routes are reliable and affordable, they can reduce car dependency and ease peak-hour congestion."],["Road investment","Roads remain essential for deliveries, emergency vehicles and communities poorly served by transit. Nevertheless, building additional lanes alone may provide only temporary relief if more people respond by driving."],["Conclusion","The strongest policy is not to abandon roads, but to direct new capacity funding toward public transport and accessible street design. Existing roads should be maintained, while major expansions should be justified by local evidence." ]],
    "drill":{"sentence":"A frequent bus network can help ______ car dependency in outer neighbourhoods.","options":["reduce","make","do","perform"],"answerIndex":0,"explanation":"Reduce car dependency là collocation trực tiếp, chính xác khi nói về việc hạn chế sự lệ thuộc vào ô tô."}
  },
  "task2-arts": {
    "topic":"Public spending · nghệ thuật và lợi ích kinh tế trực tiếp",
    "instruction":"To what extent do you agree or disagree?",
    "traps":["Định nghĩa tiêu chí so sánh: lợi ích văn hóa, khả năng tiếp cận và chi phí cơ hội.","Không cho rằng nghệ thuật luôn quan trọng hơn các dịch vụ thiết yếu hoặc ngược lại."],
    "collocations":[["preserve cultural heritage","bảo tồn di sản văn hóa"],["strengthen community identity","củng cố bản sắc cộng đồng"],["generate indirect economic benefits","tạo lợi ích kinh tế gián tiếp"],["justify public expenditure","biện minh cho chi tiêu công"],["ensure broad public access","đảm bảo người dân dễ tiếp cận"],["weigh competing priorities","cân nhắc các ưu tiên cạnh tranh"]],
    "paragraphs":[["Introduction","Public budgets must support immediate needs while also sustaining cultural life. I disagree with treating art as a luxury, although cultural funding should be transparent and balanced against essential services."],["Cultural value","Museums, libraries and local performances preserve cultural heritage and give residents shared spaces for learning. These benefits are difficult to measure in short-term revenue, yet they can strengthen community identity and participation."],["Economic trade-off","Arts programmes can create employment and attract visitors, but those gains do not justify every project. In areas lacking healthcare or safe infrastructure, basic services may reasonably take priority until urgent needs are addressed."],["Conclusion","Public money should support accessible, well-managed cultural activity without displacing essential provision. The sensible question is how to distribute funding according to demonstrated community value, rather than choosing art or economic development as absolute opposites." ]],
    "drill":{"sentence":"Public authorities must ______ competing priorities before approving a major cultural project.","options":["weigh","do","make","perform"],"answerIndex":0,"explanation":"Weigh competing priorities nghĩa là cân nhắc các ưu tiên có thể xung đột trước khi ra quyết định."}
  },
  "task2-screen-time": {
    "topic":"Children's screen time · nguyên nhân và hệ quả",
    "instruction":"Explain the reasons for the trend and its possible effects on children",
    "traps":["Phân biệt nguyên nhân do thiết kế ứng dụng, nhu cầu gia đình và việc học.","Dùng cách diễn đạt có điều kiện; không mặc định thời gian sử dụng màn hình luôn gây hại."],
    "collocations":[["design for prolonged engagement","thiết kế để giữ người dùng lâu"],["replace physical activity","thay thế hoạt động thể chất"],["disrupt sleep routines","làm gián đoạn thói quen ngủ"],["support digital learning","hỗ trợ học tập số"],["set age-appropriate limits","đặt giới hạn phù hợp độ tuổi"],["supervise online activity","giám sát hoạt động trực tuyến"]],
    "paragraphs":[["Introduction","Children spend more time on digital devices because screens combine entertainment, communication and learning. The effects depend on what children do, how long they use devices and whether adults provide reasonable boundaries."],["Reasons","Streaming platforms and games are designed to sustain attention, while parents may use devices to manage busy routines. Schools also rely on digital resources, making it difficult to distinguish productive screen use from passive consumption."],["Possible effects","Excessive evening use can disrupt sleep and displace outdoor play, especially when it becomes habitual. Conversely, carefully selected applications can support digital learning and social contact when access is supervised and balanced with other activities."],["Conclusion","The goal should be healthy use rather than a blanket ban. Families and schools can set age-appropriate limits, protect sleep and physical activity, and choose content that serves a clear developmental purpose." ]],
    "drill":{"sentence":"Heavy device use late at night may ______ children's sleep routines.","options":["disrupt","make","do","perform"],"answerIndex":0,"explanation":"Disrupt sleep routines là cách kết hợp đúng để mô tả việc phá vỡ nếp ngủ."}
  },
  "task2-university": {
    "topic":"University tuition · công bằng tiếp cận và ngân sách công",
    "instruction":"Discuss both views and give your own opinion",
    "traps":["Phân biệt miễn học phí hoàn toàn với hỗ trợ có mục tiêu cho người khó khăn.","Đánh giá cả lợi ích tiếp cận và nguồn ngân sách bền vững."],
    "collocations":[["widen access to higher education","mở rộng cơ hội vào đại học"],["ease the financial burden","giảm gánh nặng tài chính"],["target means-tested support","nhắm hỗ trợ theo điều kiện thu nhập"],["fund essential public services","tài trợ dịch vụ công thiết yếu"],["improve social mobility","cải thiện dịch chuyển xã hội"],["share the cost fairly","chia sẻ chi phí công bằng"]],
    "paragraphs":[["Introduction","Whether university should be free is a question of access and public responsibility. I favour strong financial support for students who need it, combined with a funding model that remains sustainable."],["Free tuition","Removing fees can widen access and prevent capable students from rejecting university because of family income. Graduates may later contribute through taxes and skilled work, so the benefit can extend beyond the individual."],["Costs and alternatives","However, universal free tuition directs substantial public funds to students from wealthy households as well as poorer ones. Means-tested grants and affordable repayment arrangements may protect access while leaving more money for schools, healthcare and other services."],["Conclusion","Fairness does not require every student to receive identical support. A well-designed system should remove financial barriers for disadvantaged learners, publish its costs clearly and ensure that quality does not decline because funding is insufficient." ]],
    "drill":{"sentence":"Means-tested grants can ______ the financial burden on low-income students.","options":["ease","do","make","perform"],"answerIndex":0,"explanation":"Ease the financial burden là collocation phổ biến khi nói về việc giảm áp lực tài chính."}
  },
  "task2-green-space": {
    "topic":"Urban planning · không gian xanh và nhu cầu nhà ở",
    "instruction":"To what extent do you agree or disagree?",
    "traps":["Tránh đặt nhà ở và công viên thành hai lựa chọn tuyệt đối loại trừ nhau.","Nêu cơ chế quy hoạch cụ thể: mật độ, đất bỏ trống, công viên nhỏ và kết nối đi bộ."],
    "collocations":[["protect urban green space","bảo vệ không gian xanh đô thị"],["increase housing density","tăng mật độ nhà ở"],["improve public well-being","cải thiện sức khỏe cộng đồng"],["reuse underdeveloped land","tái sử dụng đất phát triển kém"],["provide equitable access","cung cấp khả năng tiếp cận công bằng"],["integrate green corridors","kết nối hành lang xanh"]],
    "paragraphs":[["Introduction","Cities need both affordable homes and accessible green space. I support protecting parks, but believe careful use of underdeveloped land and higher-quality urban design can reduce the apparent conflict."],["Case for parks","Parks provide space for exercise, shade and informal contact, benefits that are particularly important for children and older residents. Their value is reduced when green areas are isolated or accessible only to wealthier neighbourhoods."],["Case for housing","Growing cities also need homes close to jobs and public transport. Building upward on suitable sites, reusing vacant land and requiring greenery in new developments can add housing without sacrificing every open area."],["Conclusion","Planning should protect a connected network of public green space while allowing well-designed density. Decisions should consider access, affordability and environmental quality rather than simply assigning all available land to one use." ]],
    "drill":{"sentence":"A connected network of parks can improve public ______ in densely populated areas.","options":["well-being","well-doing","well-making","well-performing"],"answerIndex":0,"explanation":"Public well-being là cụm tự nhiên nói về sức khỏe và chất lượng sống cộng đồng."}
  },
  "task1-line": {
    "topic":"Line graph · tỷ lệ hộ gia đình sở hữu ô tô",
    "instruction":"Summarise overall trends and compare the supplied values",
    "traps":["Nêu xu hướng tổng quát trước rồi mới chọn các mốc tiêu biểu.","Các số liệu là dữ liệu luyện tập tổng hợp; không suy diễn nguyên nhân."],
    "collocations":[["rise steadily","tăng đều đặn"],["record the highest proportion","ghi nhận tỷ lệ cao nhất"],["experience the largest overall increase","trải qua mức tăng tổng thể lớn nhất"],["narrow the gap","thu hẹp khoảng cách"],["reach a peak","đạt đỉnh"],["remain below the leading figure","vẫn thấp hơn con số dẫn đầu"]],
    "paragraphs":[["Introduction","The line graph compares the percentage of households owning a car in Countries A, B and C in 2000, 2012 and 2024. The figures are synthetic practice data."],["Overview","Car ownership increased in all three countries. Country A ended with the highest proportion, while Country C recorded the largest overall rise; Country B changed more gradually."],["Details: A and B","Country A climbed from 32% in 2000 to 48% in 2012 and 67% in 2024. Country B started higher at 45%, rose to 52%, and finished at 59%."],["Details: C","Country C increased from 18% to 36% and then 55%, a total gain of 37 percentage points. Despite this substantial rise, its final figure remained below those for A and B."]],
    "drill":{"sentence":"Country C experienced the largest overall ______ in car ownership.","options":["increase","increasing","increased","increases"],"answerIndex":0,"explanation":"Sau overall cần danh từ increase; số liệu cho thấy Country C tăng 37 điểm phần trăm."}
  },
  "task1-bar": {
    "topic":"Bar chart · phương tiện đi làm theo nhóm tuổi",
    "instruction":"Compare the main differences between age groups and transport modes",
    "traps":["So sánh tỷ lệ theo từng nhóm tuổi; không gán nhầm tỷ lệ cho phương tiện.","Nêu khác biệt nổi bật thay vì đọc lại toàn bộ các cột theo thứ tự."],
    "collocations":[["account for the largest share","chiếm tỷ trọng lớn nhất"],["be more prevalent among","phổ biến hơn ở nhóm"],["decline with age","giảm theo độ tuổi"],["show a contrasting pattern","cho thấy mô hình tương phản"],["remain broadly unchanged","nhìn chung không thay đổi"],["make up a small proportion","chiếm một tỷ lệ nhỏ"]],
    "paragraphs":[["Introduction","The bar chart compares four ways of travelling to work among three age groups in 2024. All figures are synthetic practice data and are expressed as percentages."],["Overview","Public transport was most common among 18–29-year-olds, whereas car use dominated the two older groups. Cycling declined with age, while walking stayed close to one tenth in all groups."],["Younger and middle groups","Among people aged 18–29, public transport accounted for 46%, well above car use at 28%. For those aged 30–49, the pattern reversed: cars represented 49% and public transport 31%."],["Older group and minor modes","In the 50-plus group, car use reached 61%, while public transport fell to 22%. Cycling declined from 16% among the youngest group to 7% among the oldest; walking remained at 9–10%."]],
    "drill":{"sentence":"Car use accounted for the largest ______ among people aged 50 and over.","options":["share","partion","sharing","shared"],"answerIndex":0,"explanation":"Account for the largest share là cấu trúc chuẩn khi mô tả tỷ trọng trong biểu đồ."}
  },
  "task1-table": {
    "topic":"Table · tỷ trọng điện năng tái tạo theo khu vực",
    "instruction":"Summarise changes over time and compare starting values, growth and final values",
    "traps":["Phân biệt giá trị cuối kỳ lớn nhất với mức tăng lớn nhất.","Khi mô tả mức thay đổi tuyệt đối giữa hai tỷ lệ, dùng percentage points."],
    "collocations":[["increase by percentage points","tăng theo điểm phần trăm"],["start from a lower base","bắt đầu từ mức nền thấp hơn"],["overtake a rival region","vượt khu vực khác"],["finish at the highest level","kết thúc ở mức cao nhất"],["show sustained growth","cho thấy tăng trưởng liên tục"],["compare the initial and final figures","so sánh số liệu đầu và cuối"]],
    "paragraphs":[["Introduction","The table presents the share of electricity generated from renewable sources in the North, Central and South regions in 2005, 2015 and 2025. The figures are synthetic practice data."],["Overview","Renewable electricity increased in every region. Central had the highest starting share, but North recorded the highest final share; South made the largest total gain by a narrow margin."],["North and Central","North rose from 18% in 2005 to 31% in 2015 and 47% in 2025, an increase of 29 percentage points. Central grew from 22% to 34% and then 42%, a 20-point rise."],["South","South began at just 9%, climbed to 20% and reached 39% by 2025. Its 30-percentage-point increase was the largest, although its final share remained below those of North and Central."]],
    "drill":{"sentence":"The South's renewable share increased by 30 percentage ______ between 2005 and 2025.","options":["points","marks","units of percent","percentages"],"answerIndex":0,"explanation":"Percentage points mô tả hiệu số tuyệt đối giữa hai tỷ lệ phần trăm; không nhầm với phần trăm tăng tương đối."}
  },
  "task1-pie": {
    "topic":"Pie charts · cơ cấu chi tiêu hộ gia đình năm 2010 và 2025",
    "instruction":"Compare the proportions and highlight the most notable increases and decreases",
    "traps":["Tập trung vào các hạng mục lớn và thay đổi rõ nhất; không liệt kê máy móc mọi tỷ lệ.","Dùng share/proportion và phân biệt tỷ lệ tăng với tỷ lệ giảm."],
    "collocations":[["account for roughly one third","chiếm khoảng một phần ba"],["experience a modest increase","tăng nhẹ"],["fall by five percentage points","giảm năm điểm phần trăm"],["remain a minor category","vẫn là hạng mục nhỏ"],["represent the largest expense","đại diện khoản chi lớn nhất"],["shift in household spending","sự thay đổi cơ cấu chi tiêu"]],
    "paragraphs":[["Introduction","The pie charts compare household spending across six categories in 2010 and 2025. The percentages are synthetic practice data supplied in the task."],["Overview","Housing remained the largest expense and increased its share. Food and utilities took smaller proportions in 2025, while transport and leisure rose modestly."],["Largest categories","Housing grew from 30% in 2010 to 34% in 2025. Food moved in the opposite direction, falling from 25% to 20%, while transport increased from 15% to 18%."],["Smaller categories","Leisure rose from 12% to 14%, whereas utilities declined from 10% to 8%. The other category also fell, from 8% to 6%, remaining the smallest share in both years."]],
    "drill":{"sentence":"Housing continued to ______ for the largest share of household spending.","options":["account","make","do","hold on"],"answerIndex":0,"explanation":"Account for a share là cách diễn đạt tự nhiên để nói một hạng mục chiếm tỷ lệ trong tổng thể."}
  },
  "task1-map": {
    "topic":"Maps · chuyển đổi một khu đất ven sông",
    "instruction":"Summarise the main spatial and functional changes without inventing features",
    "traps":["Nhóm thay đổi theo vị trí hoặc chức năng và so sánh rõ mốc năm.","Không tự thêm cơ sở vật chất, quy mô hay hướng thay đổi ngoài mô tả đề bài."],
    "collocations":[["be converted into a library","được chuyển thành thư viện"],["be relocated underground","được chuyển xuống dưới mặt đất"],["replace open grassland","thay thế bãi cỏ trống"],["introduce pedestrian access","bổ sung lối đi bộ"],["remain along the eastern edge","vẫn nằm dọc rìa phía đông"],["undergo substantial redevelopment","trải qua tái phát triển đáng kể"]],
    "paragraphs":[["Introduction","The maps describe how a riverside site changed between 2000 and 2025. The comparison focuses on the location and function of the features named in the task."],["Overview","The site shifted from a utilitarian layout towards public and cultural uses. The warehouse became a library, open grassland became a garden, and pedestrian access improved through a bridge."],["Northern and central areas","In 2000, a small car park occupied the north and a warehouse stood in the centre. By 2025, the car park had been moved underground and the warehouse had been converted into a library."],["Southern and western areas","The southern grassland was replaced by a public garden with a footpath, while a pedestrian bridge was added across the river to the west. The road along the eastern edge was not described as changing."]],
    "drill":{"sentence":"The central warehouse was ______ into a library by 2025.","options":["converted","converted it","transform","conversion"],"answerIndex":0,"explanation":"Was converted into phù hợp với cấu trúc bị động khi mô tả một công trình được chuyển đổi chức năng."}
  },
  "task1-process": {
    "topic":"Process diagram · tái chế giấy đã qua sử dụng",
    "instruction":"Describe the supplied stages in sequence without adding unsupported steps",
    "traps":["Nêu điểm bắt đầu, các bước xử lý và sản phẩm cuối cùng.","Dùng bị động hợp lý; không tự thêm nhiệt độ, máy móc hay nguyên liệu chưa được cung cấp."],
    "collocations":[["be collected and sorted","được thu gom và phân loại"],["remove unsuitable materials","loại bỏ vật liệu không phù hợp"],["be converted into pulp","được chuyển thành bột giấy"],["undergo screening and cleaning","trải qua sàng lọc và làm sạch"],["be pressed and dried","được ép và làm khô"],["be cut into sheets","được cắt thành tờ"]],
    "paragraphs":[["Introduction","The diagram outlines the recycling of used paper, from collection to the preparation of finished sheets. Only the stages provided in the practice prompt are described."],["Overview","Overall, the process moves from collecting and sorting waste paper to making pulp, cleaning it, and forming and packaging the final product."],["Preparation and pulp","First, used paper is collected and sorted so unsuitable materials can be removed. Water and chemicals are then added to create pulp, which is screened and cleaned."],["Finishing","Next, the cleaned pulp is pressed and dried into sheets. Finally, the recycled paper is cut and packaged, completing the process." ]],
    "drill":{"sentence":"The cleaned pulp is then ______ and dried to form paper sheets.","options":["pressed","pressing","press","pressure"],"answerIndex":0,"explanation":"Is pressed and dried là chuỗi bị động song song mô tả các bước trong quy trình."}
  },
  "task1-formal-letter": {
    "topic":"Formal letter · khiếu nại sản phẩm mua trực tuyến bị hỏng",
    "instruction":"Describe the problem, explain what you expected and request a specific remedy",
    "traps":["Nêu mục đích viết thư ngay đầu thư; duy trì cách xưng hô trang trọng.","Yêu cầu giải pháp cụ thể thay vì chỉ thể hiện sự không hài lòng."],
    "collocations":[["arrive in a damaged condition","đến nơi trong tình trạng hư hỏng"],["place an online order","đặt hàng trực tuyến"],["request a replacement","yêu cầu đổi sản phẩm"],["provide a full refund","hoàn tiền đầy đủ"],["resolve the matter promptly","giải quyết vấn đề nhanh chóng"],["retain the order confirmation","giữ lại xác nhận đơn hàng"]],
    "paragraphs":[["Opening and purpose","Dear Customer Service Team, I am writing about an item from my recent online order that arrived in a damaged condition. I would appreciate your help in resolving the matter."],["Problem and expectation","The outer package was crushed and the item inside was cracked, so it cannot be used safely. I expected the product to arrive intact, as described on your website."],["Requested action","I would prefer a replacement at no additional cost, although a full refund would also be acceptable if replacement stock is unavailable. I can provide photographs and the order confirmation if required."],["Closing","Please let me know how the return should be arranged. Thank you for your attention, and I look forward to a prompt response. Yours faithfully, Minh Tran."]],
    "drill":{"sentence":"I would appreciate your help in resolving this matter ______.","options":["promptly","prompt","promptness","prompted"],"answerIndex":0,"explanation":"Promptly là trạng từ bổ nghĩa cho resolving; prompt là tính từ và không phù hợp ở vị trí này."}
  },
  "task1-friend": {
    "topic":"Informal letter · cảm ơn lời mời ở lại trong kỳ nghỉ",
    "instruction":"Thank your friend, explain when you will arrive and ask what to bring",
    "traps":["Đề cập đủ ba ý yêu cầu nhưng giữ giọng thân thiện, tự nhiên.","Nêu thời điểm đến rõ ràng và hỏi một vật dụng cụ thể cần mang theo."],
    "collocations":[["thanks so much for inviting me","cảm ơn rất nhiều vì đã mời mình"],["look forward to catching up","mong được gặp và trò chuyện"],["arrive on Friday afternoon","đến vào chiều thứ Sáu"],["bring anything useful","mang thứ gì hữu ích"],["make myself at home","cảm thấy thoải mái như ở nhà"],["pack a few essentials","đóng gói vài đồ dùng cần thiết"]],
    "paragraphs":[["Greeting and thanks","Hi Alex, thanks so much for inviting me to stay with you during the holiday. It will be great to spend some time together and catch up properly."],["Arrival","I am planning to arrive on Friday afternoon, so we should have plenty of time to settle in before the weekend. I will message you when I am on my way."],["Question","Is there anything useful you would like me to bring? I can pack snacks for the journey or bring a board game if we plan to have a quiet evening."],["Closing","Thanks again for offering me a place to stay. I am really looking forward to seeing you soon. Take care, Minh."]],
    "drill":{"sentence":"I am really looking forward to ______ up with you during the holiday.","options":["catching","catch","caught","catch up"],"answerIndex":0,"explanation":"Look forward to đi với danh từ hoặc V-ing; vì vậy catching up là dạng đúng."}
  },
  "task1-request": {
    "topic":"Semi-formal letter · yêu cầu xử lý lớp học ồn",
    "instruction":"Explain the problem, its effect on learning and a realistic proposed solution",
    "traps":["Giữ giọng lịch sự nhưng không quá xa cách; nêu rõ ảnh hưởng tới việc học.","Giải pháp cần khả thi và liên quan trực tiếp tới nguyên nhân gây ồn."],
    "collocations":[["raise a concern about","nêu mối lo ngại về"],["disrupt concentration","làm gián đoạn sự tập trung"],["affect the quality of learning","ảnh hưởng chất lượng học tập"],["move to a quieter room","chuyển sang phòng yên tĩnh hơn"],["take practical steps","thực hiện biện pháp thực tế"],["at a convenient time","vào thời điểm thuận tiện"]],
    "paragraphs":[["Opening and purpose","Dear Course Manager, I am writing to raise a concern about the noise in our evening classroom. I hope a practical arrangement can be made for the remaining lessons."],["Problem and impact","Music rehearsals in the neighbouring hall can often be heard during class. As a result, students miss parts of explanations and find it difficult to concentrate on unfamiliar material."],["Suggested solution","Would it be possible to move our group to a quieter room on the second floor, or to schedule the rehearsal at a different time? Either option would help us follow the lessons more effectively."],["Closing","Thank you for considering this request. I would be happy to discuss the issue at a convenient time and appreciate your help. Kind regards, Minh Tran."]],
    "drill":{"sentence":"The repeated noise severely ______ students' concentration during lessons.","options":["disrupts","does","makes","performs"],"answerIndex":0,"explanation":"Disrupt concentration diễn đạt chính xác việc làm gián đoạn khả năng tập trung."}
  },
  "task1-apology": {
    "topic":"Apology letter · nhận trách nhiệm vì làm hỏng sách mượn",
    "instruction":"Apologise, explain what happened and offer a concrete remedy",
    "traps":["Xin lỗi rõ ràng ở phần đầu và nhận trách nhiệm trực tiếp.","Giải thích ngắn gọn, không đổ lỗi, rồi đề nghị cách sửa chữa cụ thể."],
    "collocations":[["offer a sincere apology","đưa ra lời xin lỗi chân thành"],["take full responsibility","hoàn toàn chịu trách nhiệm"],["accidentally damage a book","vô tình làm hỏng sách"],["replace the damaged copy","thay bản sách bị hỏng"],["make amends","khắc phục lỗi lầm"],["handle something carelessly","xử lý một vật bất cẩn"]],
    "paragraphs":[["Apology","Hi Daniel, I owe you a sincere apology for damaging the book I borrowed from you. I know you wanted to keep it in good condition, and I am sorry that I did not take enough care."],["Explanation","I accidentally spilled water on the pages while studying, and several of them became warped. It was my responsibility to keep the book safe, so I do not want to make excuses."],["Remedy","I can buy a new copy of the same edition or pay for a professional repair if you would prefer to keep the original. Please let me know which option suits you."],["Closing","I am sorry again for the inconvenience and will be more careful with anything I borrow in future. Best wishes, Minh."]],
    "drill":{"sentence":"I would like to ______ amends by buying a replacement copy.","options":["make","do","perform","take"],"answerIndex":0,"explanation":"Make amends là collocation cố định mang nghĩa khắc phục lỗi lầm hoặc bù đắp thiệt hại."}
  },
  "task1-advice": {
    "topic":"Advice letter · chuyển tới thị trấn mới để tìm việc",
    "instruction":"Describe local advantages and disadvantages, then give practical advice",
    "traps":["Cân bằng lợi thế và hạn chế của nơi ở mới.","Lời khuyên phải có hành động cụ thể như lập ngân sách, tìm việc và kiểm tra phương tiện đi lại."],
    "collocations":[["job opportunities","cơ hội việc làm"],["cost of living","chi phí sinh hoạt"],["public transport links","kết nối giao thông công cộng"],["secure temporary accommodation","thu xếp chỗ ở tạm thời"],["build a professional network","xây dựng mạng lưới nghề nghiệp"],["set aside emergency savings","để dành tiền dự phòng"]],
    "paragraphs":[["Greeting and context","Hi Linh, moving here could be a good step if you have researched the jobs available in your field. The town has a lively service sector and several employers within commuting distance."],["Advantages and drawbacks","One advantage is that buses connect the centre with most major workplaces, and there are useful libraries and training facilities. On the other hand, rents near the centre can be high and competition for entry-level jobs is noticeable."],["Advice","I would apply for jobs before moving, prepare a realistic monthly budget and arrange temporary accommodation for the first few weeks. It is also worth setting aside emergency savings and contacting local professional groups."],["Closing","If you decide to come, let me know and I can help you explore the area. I hope the move works out well for you. Best, Minh."]],
    "drill":{"sentence":"Before moving, you should set aside emergency ______ for unexpected costs.","options":["savings","save","saved","savingly"],"answerIndex":0,"explanation":"Emergency savings là cụm danh từ chỉ khoản tiền dự phòng cho tình huống bất ngờ."}
  }
}`);

function normaliseModelEssay(data) {
  if (!data?.modelEssay) return data;
  const { band: _unverifiedBand, ...modelEssay } = data.modelEssay;
  return {
    ...data,
    modelEssay: {
      ...modelEssay,
      label: 'Bài mẫu tham khảo',
      calibration: 'not-calibrated-against-independent-human-rated-corpus'
    }
  };
}

function buildTaskSpecificAcademyData(task, profile) {
  const paragraphs = profile.paragraphs.map(([role, text]) => ({ role, text }));
  const shuffledIndices = [2, 0, 3, 1];
  const sequenceIds = ['C', 'A', 'D', 'B'];
  const puzzleItems = shuffledIndices.map(index => ({
    id: sequenceIds[index],
    role: paragraphs[index].role,
    text: paragraphs[index].text
  }));
  return {
    topic: profile.topic,
    instruction: profile.instruction,
    traps: profile.traps,
    collocations: profile.collocations.map(([phrase, meaning]) => ({ phrase, meaning })),
    modelEssay: {
      label: 'Bài mẫu tham khảo',
      calibration: 'not-calibrated-against-independent-human-rated-corpus',
      paragraphs
    },
    collocationDrill: profile.drill,
    cohesionPuzzle: {
      prompt: 'Sắp xếp các đoạn mẫu của chính đề này theo thứ tự lập luận hợp lý.',
      items: puzzleItems,
      correctOrder: sequenceIds,
      explanation: 'Hãy xác định chức năng của từng đoạn trong bài này, rồi sắp xếp theo trình tự logic. Không có một chuỗi từ nối cố định nào thay thế được mạch lập luận.'
    },
    sourceNote: task.type === 'task1-academic'
      ? 'Các con số và mô tả trong đề luyện là dữ liệu tổng hợp; chỉ sử dụng thông tin được cung cấp.'
      : ''
  };
}

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
        label: 'Bài mẫu tham khảo', calibration: 'not-calibrated-against-independent-human-rated-corpus',
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
        label: 'Bài mẫu tham khảo', calibration: 'not-calibrated-against-independent-human-rated-corpus',
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
      label: 'Bài mẫu tham khảo', calibration: 'not-calibrated-against-independent-human-rated-corpus',
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
  if (custom) return normaliseModelEssay(custom);
  const profile = TASK_ACADEMY_DETAILS[task.id];
  if (profile) return buildTaskSpecificAcademyData(task, profile);
  return normaliseModelEssay(buildFallbackAcademyData(task));
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
