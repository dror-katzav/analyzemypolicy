// Calls Claude API to extract structured policy data from an uploaded document.
// Falls back to a simulated result when no API key is configured.

const EXTRACT_PROMPT = `Extract the following fields from this insurance policy document and return ONLY valid JSON — no explanation, no markdown, no code block:

{
  "policyType": "Term Life | Whole Life | Universal Life | Variable Life | Other",
  "carrier": "insurance company name",
  "faceAmount": <death benefit in dollars as a number>,
  "premium": <monthly premium in dollars as a number>,
  "premiumFrequency": "monthly | quarterly | annual",
  "insuredName": "full name of insured",
  "beneficiary": "beneficiary name or empty string",
  "issueDate": "YYYY-MM-DD or empty string",
  "policyNumber": "policy number or empty string"
}

If a field cannot be determined from the document, use null.`;

export async function parsePolicy(file) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (apiKey && apiKey !== 'YOUR_KEY_HERE') {
    return callClaude(file, apiKey);
  }
  return simulateParse(file);
}

async function callClaude(file, apiKey) {
  const base64 = await fileToBase64(file);
  const isPdf = file.type === 'application/pdf';

  const contentBlock = isPdf
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
    : { type: 'image', source: { type: 'base64', media_type: file.type, data: base64 } };

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'pdfs-2024-09-25',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{ role: 'user', content: [contentBlock, { type: 'text', text: EXTRACT_PROMPT }] }],
    }),
  });

  if (!resp.ok) throw new Error('Claude API error: ' + resp.status);
  const data = await resp.json();
  const raw = data.content?.[0]?.text?.trim() ?? '{}';
  const cleaned = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/, '');
  return JSON.parse(cleaned);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function simulateParse(file) {
  // Deterministic mock based on filename hints
  const name = file.name.toLowerCase();
  const isWhole = name.includes('whole') || name.includes('permanent');
  const isUniversal = name.includes('ul') || name.includes('universal');

  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        policyType: isWhole ? 'Whole Life' : isUniversal ? 'Universal Life' : 'Term Life',
        carrier: guessCarrier(name),
        faceAmount: isWhole ? 1000000 : 500000,
        premium: isWhole ? 420 : 185,
        premiumFrequency: 'monthly',
        insuredName: null,
        beneficiary: null,
        issueDate: null,
        policyNumber: null,
      });
    }, 2800)
  );
}

function guessCarrier(name) {
  if (name.includes('metlife') || name.includes('met')) return 'MetLife';
  if (name.includes('protective')) return 'Protective Life';
  if (name.includes('prudential') || name.includes('pru')) return 'Prudential';
  if (name.includes('aig')) return 'AIG';
  if (name.includes('banner')) return 'Banner Life';
  if (name.includes('transamerica')) return 'Transamerica';
  if (name.includes('nationwide')) return 'Nationwide';
  return 'Uploaded Carrier';
}
