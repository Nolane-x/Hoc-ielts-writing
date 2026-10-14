export const TASKS = [
  {
    id: 'task2-opinion', type: 'task2', title: 'Task 2 · Opinion essay', group: 'Academic Writing',
    difficulty: 'Intermediate', estimatedMinutes: 40, skillFocus: 'Clear position and developed reasons',
    prompt: 'Some people believe that students should learn practical skills at school, while others think academic subjects are more important. Discuss both views and give your own opinion.',
    goal: 'Present a clear position and develop each main idea with reasons and relevant examples.',
    tips: ['Answer every part of the question.', 'Keep each body paragraph focused on one main idea.', 'Explain how your example supports the argument.']
  },
  {
    id: 'task2-discussion', type: 'task2', title: 'Task 2 · Discussion essay', group: 'Academic Writing',
    difficulty: 'Intermediate', estimatedMinutes: 40, skillFocus: 'Balanced discussion and evaluation',
    prompt: 'Some people think that working from home is beneficial for employees and employers. Others believe that it creates more problems than it solves. Discuss both views and give your own opinion.',
    goal: 'Explain both positions fairly before making your own position clear.',
    tips: ['Represent both views accurately.', 'Use topic sentences that tell the reader the paragraph purpose.', 'Avoid repeating the prompt without developing it.']
  },
  {
    id: 'task2-online-learning', type: 'task2', title: 'Task 2 · Advantages and disadvantages', group: 'Academic Writing',
    difficulty: 'Intermediate', estimatedMinutes: 40, skillFocus: 'Comparing benefits and drawbacks',
    prompt: 'More people are choosing to study online rather than attend classes in person. What are the advantages and disadvantages of this development?',
    goal: 'Explain meaningful advantages and disadvantages with specific reasoning instead of producing a list.',
    tips: ['Decide whether to cover both sides equally.', 'Explain who benefits and under what conditions.', 'Use examples that demonstrate a consequence.']
  },
  {
    id: 'task2-traffic', type: 'task2', title: 'Task 2 · Problem and solution', group: 'Academic Writing',
    difficulty: 'Intermediate', estimatedMinutes: 40, skillFocus: 'Cause, consequence and workable solutions',
    prompt: 'Traffic congestion is becoming a serious problem in many cities. What are the main causes of this problem, and what measures could be taken to solve it?',
    goal: 'Connect each proposed measure to a cause and explain how it could reduce congestion.',
    tips: ['Distinguish causes from effects.', 'Avoid unrealistic solutions without implementation details.', 'Explain why a proposed measure would work.']
  },
  {
    id: 'task2-packaging', type: 'task2', title: 'Task 2 · Two-part question', group: 'Academic Writing',
    difficulty: 'Intermediate', estimatedMinutes: 40, skillFocus: 'Answering two questions directly',
    prompt: 'Many products are sold in excessive packaging. Why do companies use so much packaging, and what can governments and consumers do to reduce it?',
    goal: 'Answer both the reasons question and the action question explicitly.',
    tips: ['Make sure both questions receive a developed answer.', 'Separate commercial incentives from consumer habits.', 'Suggest specific and realistic actions.']
  },
  {
    id: 'task2-public-transport', type: 'task2', title: 'Task 2 · Public policy discussion', group: 'Academic Writing',
    difficulty: 'Advanced', estimatedMinutes: 40, skillFocus: 'Comparing policy trade-offs',
    prompt: 'Some people think governments should spend more money on public transport, while others believe that building new roads is more important. Discuss both views and give your own opinion.',
    goal: 'Compare long-term impact, accessibility and practical trade-offs before reaching a position.',
    tips: ['Avoid treating either option as universally beneficial.', 'Explain short-term and long-term consequences.', 'State your position clearly in the introduction and conclusion.']
  },
  {
    id: 'task2-arts', type: 'task2', title: 'Task 2 · Opinion and counterargument', group: 'Academic Writing',
    difficulty: 'Advanced', estimatedMinutes: 40, skillFocus: 'Claim, counterclaim and rebuttal',
    prompt: 'Governments should spend public money on art and cultural activities rather than on projects that have more direct economic benefits. To what extent do you agree or disagree?',
    goal: 'Define your position and evaluate cultural and economic benefits without relying on vague claims.',
    tips: ['Decide the extent of agreement before outlining.', 'Acknowledge a reasonable counterargument.', 'Compare benefits using clear criteria.']
  },
  {
    id: 'task2-screen-time', type: 'task2', title: 'Task 2 · Causes and effects', group: 'Academic Writing',
    difficulty: 'Intermediate', estimatedMinutes: 40, skillFocus: 'Explaining cause-and-effect chains',
    prompt: 'Children are spending increasing amounts of time using digital devices. What are the reasons for this, and what effects can it have on children?',
    goal: 'Explain why the trend occurs and distinguish possible effects from assumptions.',
    tips: ['Develop a clear causal chain.', 'Avoid claiming that every child is affected in the same way.', 'Use qualified language when an outcome is not universal.']
  },
  {
    id: 'task2-university', type: 'task2', title: 'Task 2 · Education priorities', group: 'Academic Writing',
    difficulty: 'Advanced', estimatedMinutes: 40, skillFocus: 'Defining criteria and weighing priorities',
    prompt: 'Some people believe that university education should be free for everyone. Others think students should pay at least part of the cost. Discuss both views and give your own opinion.',
    goal: 'Evaluate fairness, public cost and access, then defend a coherent policy position.',
    tips: ['Define what “free” means in your argument.', 'Consider both access and funding trade-offs.', 'Avoid assuming that one policy has no disadvantages.']
  },
  {
    id: 'task2-green-space', type: 'task2', title: 'Task 2 · Cities and quality of life', group: 'Academic Writing',
    difficulty: 'Intermediate', estimatedMinutes: 40, skillFocus: 'Developing specific examples',
    prompt: 'Some people think cities should use more land for parks and green spaces instead of building more housing. To what extent do you agree or disagree?',
    goal: 'Support your position with concrete consequences for housing, health and urban planning.',
    tips: ['Avoid oversimplifying the housing-versus-parks trade-off.', 'Use examples that directly support a claim.', 'Make sure your conclusion follows from the reasons given.']
  },
  {
    id: 'task1-line', type: 'task1-academic', title: 'Task 1 · Line graph', group: 'Academic Writing',
    difficulty: 'Intermediate', estimatedMinutes: 20, skillFocus: 'Trends and comparisons',
    prompt: 'Synthetic practice data (percent of households owning a car): Country A — 2000: 32%, 2012: 48%, 2024: 67%; Country B — 2000: 45%, 2012: 52%, 2024: 59%; Country C — 2000: 18%, 2012: 36%, 2024: 55%. The line graph shows changes between 2000 and 2024. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    goal: 'Identify overall trends and supported comparisons. The figures are synthetic practice data and can be used as supplied.',
    tips: ['Write an overview of the main trends.', 'Use figures only as supplied; avoid extrapolating.', 'Group countries by trend instead of listing every point.']
  },
  {
    id: 'task1-bar', type: 'task1-academic', title: 'Task 1 · Bar chart', group: 'Academic Writing',
    difficulty: 'Intermediate', estimatedMinutes: 20, skillFocus: 'Ranking categories and quantifying differences',
    prompt: 'Synthetic practice data show how three age groups travelled to work in 2024. Public transport: ages 18–29, 46%; ages 30–49, 31%; ages 50+, 22%. Car: 28%, 49%, 61% respectively. Cycling: 16%, 11%, 7%. Walking: 10%, 9%, 10%. Summarise the main features and make relevant comparisons.',
    goal: 'Group categories by meaningful patterns and compare the largest differences.',
    tips: ['Describe the largest and smallest values first.', 'Compare age groups rather than narrating every bar.', 'Check that percentages are attributed to the correct group.']
  },
  {
    id: 'task1-table', type: 'task1-academic', title: 'Task 1 · Table', group: 'Academic Writing',
    difficulty: 'Intermediate', estimatedMinutes: 20, skillFocus: 'Selecting significant figures',
    prompt: 'Synthetic practice data show the share of electricity generated from renewable sources. Region North: 2005, 18%; 2015, 31%; 2025, 47%. Region Central: 22%, 34%, 42%. Region South: 9%, 20%, 39%. Summarise the information and compare the main features.',
    goal: 'Summarise changes over time while comparing starting points, growth and final values.',
    tips: ['Do not simply copy the table row by row.', 'Identify the highest and fastest-growing series.', 'Use “percentage points” correctly when describing absolute percentage changes.']
  },
  {
    id: 'task1-pie', type: 'task1-academic', title: 'Task 1 · Pie charts', group: 'Academic Writing',
    difficulty: 'Intermediate', estimatedMinutes: 20, skillFocus: 'Comparing proportions',
    prompt: 'Synthetic practice data show household spending in two years. In 2010: housing 30%, food 25%, transport 15%, utilities 10%, leisure 12%, other 8%. In 2025: housing 34%, food 20%, transport 18%, utilities 8%, leisure 14%, other 6%. Summarise the main changes and compare the categories.',
    goal: 'Compare proportions and highlight the most notable increases and decreases.',
    tips: ['Choose a few important contrasts for the overview.', 'Avoid listing every percentage in the introduction.', 'Make it clear which figure belongs to which year.']
  },
  {
    id: 'task1-map', type: 'task1-academic', title: 'Task 1 · Maps', group: 'Academic Writing',
    difficulty: 'Advanced', estimatedMinutes: 20, skillFocus: 'Describing spatial change',
    prompt: 'Synthetic map description: In 2000, a riverside site contained a small car park in the north, a warehouse in the centre, open grassland in the south and a single road along the east edge. By 2025, the warehouse had become a library, the car park had moved underground, the grassland had been turned into a public garden with a footpath, and a pedestrian bridge crossed the river to the west. Summarise the main changes.',
    goal: 'Describe changes by location and function without inventing features not mentioned.',
    tips: ['Organise by area or by type of change.', 'Use precise location language.', 'Distinguish what was replaced, added or relocated.']
  },
  {
    id: 'task1-process', type: 'task1-academic', title: 'Task 1 · Process diagram', group: 'Academic Writing',
    difficulty: 'Intermediate', estimatedMinutes: 20, skillFocus: 'Sequencing and passive voice',
    prompt: 'Synthetic process stages for practice: used paper is collected; it is sorted to remove unsuitable materials; water and chemicals are added to create pulp; the pulp is screened and cleaned; it is pressed and dried into sheets; the finished recycled paper is cut and packaged. Summarise the process by selecting and reporting the main features.',
    goal: 'Describe the supplied stages in a logical sequence without adding unsupported steps.',
    tips: ['Identify where the process begins and ends.', 'Use accurate sequencing and passive forms where natural.', 'Do not add facts that are not supplied.']
  },
  {
    id: 'task1-formal-letter', type: 'task1-general', title: 'Task 1 · Formal complaint', group: 'General Training',
    difficulty: 'Intermediate', estimatedMinutes: 20, skillFocus: 'Formal purpose and specific requests',
    prompt: 'You recently bought an item online, but it arrived damaged. Write a letter to the company. In your letter, describe the problem, explain what you expected, and say what you would like the company to do.',
    goal: 'Address all three bullet points using a consistent formal tone and enough detail.',
    tips: ['State the purpose early.', 'Use a consistent level of formality.', 'Make the requested action specific.']
  },
  {
    id: 'task1-friend', type: 'task1-general', title: 'Task 1 · Informal letter', group: 'General Training',
    difficulty: 'Intermediate', estimatedMinutes: 20, skillFocus: 'Friendly tone and complete task coverage',
    prompt: 'A friend has invited you to stay with them during a holiday. Write a letter thanking them, explaining when you will arrive, and asking about something you should bring.',
    goal: 'Cover each requested point naturally with a friendly tone.',
    tips: ['Use an appropriate greeting and closing.', 'Make the arrival details clear.', 'Keep the tone warm without becoming unclear.']
  },
  {
    id: 'task1-request', type: 'task1-general', title: 'Task 1 · Semi-formal request', group: 'General Training',
    difficulty: 'Intermediate', estimatedMinutes: 20, skillFocus: 'Polite requests and explanation',
    prompt: 'You attend an evening course and have difficulty concentrating because the classroom is noisy. Write to the course manager. Explain the problem, describe how it affects your learning, and suggest a possible solution.',
    goal: 'Explain the situation, its impact and a realistic request in a polite semi-formal style.',
    tips: ['Use a clear opening purpose.', 'Separate the problem from its effect.', 'Make the requested action practical and courteous.']
  },
  {
    id: 'task1-apology', type: 'task1-general', title: 'Task 1 · Apology letter', group: 'General Training',
    difficulty: 'Intermediate', estimatedMinutes: 20, skillFocus: 'Apology, responsibility and repair',
    prompt: 'You borrowed a book from a colleague and accidentally damaged it. Write a letter apologising, explaining what happened and saying what you will do to resolve the situation.',
    goal: 'Accept responsibility without over-explaining, and offer a concrete way to make amends.',
    tips: ['Apologise clearly near the beginning.', 'Explain the incident briefly and honestly.', 'Offer a specific remedy.']
  },
  {
    id: 'task1-advice', type: 'task1-general', title: 'Task 1 · Advice letter', group: 'General Training',
    difficulty: 'Intermediate', estimatedMinutes: 20, skillFocus: 'Supportive tone and actionable advice',
    prompt: 'A friend is thinking about moving to your town to find work. Write a letter describing the advantages and disadvantages of living there and giving advice about how to prepare.',
    goal: 'Cover both requested information and practical advice in a natural informal letter.',
    tips: ['Give balanced information instead of only praise.', 'Make advice specific to the situation.', 'Keep the tone friendly and supportive.']
  }
];
