(() => {
  const reply = document.getElementById('conciergeReply');
  const assistant = document.getElementById('assistantPanel');
  const pet = document.getElementById('conciergePet');
  const paths = {
    match: { text: 'For quiet mornings, try Garden Suite. For open sea views, choose Cliff Suite. For more room, Horizon Residence is the concept pick.', target: null },
    stay: { text: 'Choose your dates and guest count in the enquiry form. Your details stay in this demo; nothing is sent or booked.', target: '#enquire' },
    suites: { text: 'Three imagined spaces await: garden calm, cliffside views, or a private horizon residence.', target: '#suites' },
    rituals: { text: 'Picture a slow breakfast, a restorative hour, and a last-light walk by the coast.', target: '#rituals' }
  };

  document.querySelectorAll('[data-concierge]').forEach(button => {
    button.addEventListener('click', () => {
      const item = paths[button.dataset.concierge];
      if (!item) return;
      if (reply) reply.textContent = item.text;
      pet?.classList.add('is-talking');
      window.setTimeout(() => pet?.classList.remove('is-talking'), 1800);
      if (item.target) {
        assistant.hidden = true;
        document.getElementById('assistantLauncher')?.setAttribute('aria-expanded', 'false');
        document.querySelector(item.target)?.scrollIntoView({
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start'
        });
      }
    });
  });
})();
