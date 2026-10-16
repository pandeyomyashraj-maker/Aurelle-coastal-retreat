(() => {
  'use strict';
  const form = document.getElementById('stayForm');
  if (!form) return;

  const arrival = document.getElementById('arrival');
  const departure = document.getElementById('departure');
  const formError = document.getElementById('formError');
  const formSuccess = document.getElementById('formSuccess');
  const guestName = document.getElementById('guestName');
  const guestEmail = document.getElementById('guestEmail');
  const today = new Date();
  const dateValue = date => date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0');

  function setDefaultDates() {
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 21);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 3);
    arrival.min = dateValue(today);
    arrival.value = dateValue(start);
    departure.min = dateValue(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1));
    departure.value = dateValue(end);
  }
  setDefaultDates();

  arrival?.addEventListener('change', () => {
    if (!arrival.value) return;
    const nextDay = new Date(arrival.value + 'T12:00:00');
    nextDay.setDate(nextDay.getDate() + 1);
    departure.min = dateValue(nextDay);
    if (!departure.value || departure.value <= arrival.value) departure.value = dateValue(nextDay);
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    formError.hidden = true;
    const name = guestName.value.trim();
    const email = guestEmail.value.trim();
    if (!arrival.value || !departure.value) return showError('Choose both arrival and departure dates.');
    if (departure.value <= arrival.value) return showError('Departure must be later than arrival.');
    if (name.length < 2) return showError('Please enter a name with at least two characters.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('Please enter a valid email address.');
    formSuccess.hidden = false;
  });

  function showError(message) {
    formError.textContent = message;
    formError.hidden = false;
    formError.focus?.();
  }

  document.getElementById('resetForm')?.addEventListener('click', () => {
    formSuccess.hidden = true;
    form.reset();
    setDefaultDates();
    guestName.focus();
  });

  // The recommendation logic is loaded with the form, not during the hero render.
  const matchText = document.getElementById('suiteMatchText');
  const guestSelect = document.getElementById('guests');
  const suiteSelect = document.getElementById('formSuite');
  const applyMatch = document.getElementById('applySuiteMatch');
  let suggestion = 'Garden Suite';
  function updateMatch() {
    const mood = document.querySelector('.mood-choice.is-active')?.dataset.mood || 'stillness';
    const count = guestSelect?.value || '2';
    suggestion = count === '5+' || Number(count) >= 4
      ? 'Horizon Residence'
      : mood === 'discovery' ? 'Cliff Suite'
        : mood === 'restore' && Number(count) >= 2 ? 'Horizon Residence' : 'Garden Suite';
    const copy = {
      'Garden Suite': 'For a slower pace, Garden Suite is a lovely fit.',
      'Cliff Suite': 'For open views and a curious spirit, Cliff Suite is a lovely fit.',
      'Horizon Residence': 'For extra room to unwind, Horizon Residence is a lovely fit.'
    };
    if (matchText) matchText.textContent = copy[suggestion];
  }
  guestSelect?.addEventListener('change', updateMatch);
  document.querySelectorAll('.mood-choice').forEach(choice => {
    choice.addEventListener('click', () => requestAnimationFrame(updateMatch));
  });
  applyMatch?.addEventListener('click', () => {
    if (suiteSelect) suiteSelect.value = suggestion;
    suiteSelect?.dispatchEvent(new Event('change', { bubbles: true }));
    applyMatch.textContent = 'Added to your enquiry';
    window.setTimeout(() => { applyMatch.textContent = 'Use suggestion'; }, 1800);
  });
  updateMatch();
})();
