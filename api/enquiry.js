import { processEnquiry, writeEnquiryResult } from './send-enquiry.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    writeEnquiryResult(res, { status: 405, error: 'Method not allowed' });
    return;
  }

  try {
    const result = await processEnquiry(
      { body: req.body, headers: req.headers },
      { env: process.env },
    );
    writeEnquiryResult(res, result);
  } catch (err) {
    console.error('Enquiry handler failed:', err?.name || 'Error');
    writeEnquiryResult(res, { status: 500, error: 'Could not send enquiry.' });
  }
}
