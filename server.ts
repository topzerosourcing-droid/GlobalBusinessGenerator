import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { 
  generateBusinessPlanWithAI, 
  regenerateSectionWithAI, 
  generateMarketingKitWithAI,
  generateBusinessIdeasWithAI
} from './src/server/geminiService.ts';
import { paymentRouter } from './src/server/paymentRoutes.ts';
import { adminRouter } from './src/server/adminRoutes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' }));

// Mount Payment & Entitlement Engine
app.use('/api/payments', paymentRouter);
// Mount Super Admin Engine
app.use('/api/admin', adminRouter);
app.get('/api/admin/orders-summary', (req, res) => {
  res.redirect('/api/payments/admin-summary');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Global Business Generator API', timestamp: new Date().toISOString() });
});

app.post('/api/generate-plan', async (req, res) => {
  try {
    const input = req.body;
    if (!input || !input.businessName || !input.businessIdea) {
      return res.status(400).json({ error: 'Missing required business details' });
    }
    const plan = await generateBusinessPlanWithAI(input);
    res.json(plan);
  } catch (err: any) {
    console.error('Plan generation failed:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate plan' });
  }
});

app.post('/api/regenerate-section', async (req, res) => {
  try {
    const { input, sectionKey, currentContent, customInstruction } = req.body;
    if (!input || !sectionKey) {
      return res.status(400).json({ error: 'Missing required parameters: input and sectionKey are required' });
    }
    const updatedContent = await regenerateSectionWithAI(input, sectionKey, currentContent, customInstruction);
    res.json({ sectionKey, content: updatedContent });
  } catch (err: any) {
    console.error(`Plan section regeneration failed for ${req.body?.sectionKey}:`, err);
    res.status(500).json({ error: err?.message || 'Failed to regenerate section' });
  }
});

app.post('/api/generate-marketing-kit', async (req, res) => {
  try {
    const { input, plan } = req.body;
    if (!input || !input.businessName) {
      return res.status(400).json({ error: 'Missing required business input details' });
    }
    const marketingKit = await generateMarketingKitWithAI(input, plan);
    res.json(marketingKit);
  } catch (err: any) {
    console.error('Marketing kit generation failed:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate marketing kit' });
  }
});

app.post('/api/generate-business-ideas', async (req, res) => {
  try {
    const input = req.body;
    const ideas = await generateBusinessIdeasWithAI(input || {});
    res.json({ ideas });
  } catch (err: any) {
    console.error('AI business ideas generation failed:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate business ideas' });
  }
});

// Serve production static assets
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Global Business Generator server running on port ${port}`);
});
