export const pricing = {
  demo: true,
  currency: 'AED',
  contact: {
    instagram: 'https://www.instagram.com/centuryacademy_/',
    instagramMessage: 'https://ig.me/m/centuryacademy_',
    whatsapp: null,
    email: null,
  },
  hourly: {
    one_to_one: { igcse_olevel: 150, as_a_level: 190 },
    group: { igcse_olevel: 75, as_a_level: 95, max_group_size: null },
  },
  monthly_plans: [
    { name: 'One-to-one', lessons_per_month: 4, format: 'one-to-one', levels: ['igcse_olevel'], price: 560 },
    { name: 'Group', lessons_per_month: 4, format: 'group', levels: ['igcse_olevel'], price: 280 },
    { name: 'One-to-one', lessons_per_month: 4, format: 'one-to-one', levels: ['as_a_level'], price: 720 },
    { name: 'Group', lessons_per_month: 4, format: 'group', levels: ['as_a_level'], price: 360 },
  ],
  payment_notes: null,
  incentives: [
    { title: 'Free first online trial', detail: 'Talk through your course, then try a lesson.', confirmed: true },
  ],
};

