import Complaint from '../models/Complaint.js';

// POST /api/ai/officer-summary (Logged-in officer)
export const getOfficerSummary = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pendingCount = await Complaint.countDocuments({ status: 'pending' });
    const inProgressCount = await Complaint.countDocuments({ status: 'in-progress' });
    const resolvedCount = await Complaint.countDocuments({ status: 'resolved' });

    const statsPrompt = `System Statistics:
- Total Complaints: ${totalComplaints}
- Pending: ${pendingCount}
- In-Progress: ${inProgressCount}
- Resolved: ${resolvedCount}`;

    // Integrates directly with Anthropic / Claude API if CLAUDE_API_KEY is configured
    if (process.env.CLAUDE_API_KEY) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 300,
          messages: [
            {
              role: 'user',
              content: `You are an AI assistant for municipal officers. Generate a concise, professional briefing report based on these stats:\n${statsPrompt}`,
            },
          ],
        }),
      });

      const data = await response.json();
      return res.json({ summary: data.content[0].text, stats: { totalComplaints, pendingCount, inProgressCount, resolvedCount } });
    }

    // Fallback response if AI Key is not configured
    res.json({
      summary: `Briefing Report: Currently managing ${totalComplaints} total issues. ${pendingCount} require immediate triage, ${inProgressCount} are actively being addressed, and ${resolvedCount} have been completed.`,
      stats: { totalComplaints, pendingCount, inProgressCount, resolvedCount },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};