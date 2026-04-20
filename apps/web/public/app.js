const form = document.getElementById('flow-form');
const resultJson = document.getElementById('result-json');
const chipsRoot = document.getElementById('state-chips');

const states = [
  'entry', 'triage', 'intake', 'safety_check', 'advice_ready', 'service_decision',
  'watchful_waiting', 'followup_active', 'result_ingested', 're_evaluation',
  'doctor_handoff', 'value_eligible', 'value_blocked'
];

function renderChips(activeState) {
  chipsRoot.innerHTML = '';
  states.forEach((state) => {
    const el = document.createElement('span');
    el.className = `chip ${activeState === state ? 'active' : ''}`;
    el.textContent = state;
    chipsRoot.appendChild(el);
  });
}

function parseBoolean(value) {
  return value === 'true';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const fd = new FormData(form);

  const payload = {
    symptoms: String(fd.get('symptoms') || '').split(',').map((x) => x.trim()).filter(Boolean),
    session: {
      rawUserInput: String(fd.get('rawUserInput') || ''),
    },
    structuredAnswers: {
      hasFever: fd.get('hasFever') === 'unknown' ? undefined : parseBoolean(fd.get('hasFever')),
    },
    valueConfirmed: parseBoolean(fd.get('valueConfirmed')),
    ingestedResult: parseBoolean(fd.get('ingestedResult')),
  };

  resultJson.textContent = '执行中...';

  try {
    const res = await fetch('/api/flow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    renderChips(data.state);
    resultJson.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    resultJson.textContent = JSON.stringify({ error: error.message }, null, 2);
  }
});

renderChips('entry');
