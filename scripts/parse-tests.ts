import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { TestTemplate, Question, QuestionOption } from '../lib/types';

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !match[1].startsWith('#')) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } else if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    // Use project ID from environment
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } else {
    console.error('❌ Eroare: Nu s-a găsit configurația Firebase!');
    console.error('   Asigură-te că ai setat FIREBASE_SERVICE_ACCOUNT_KEY sau NEXT_PUBLIC_FIREBASE_PROJECT_ID în .env.local');
    process.exit(1);
  }
}

const db = getFirestore();

interface ParsedTest {
  title: string;
  description?: string;
  questions: Question[];
  scoringRules?: {
    interpretation?: {
      ranges: Array<{ min: number; max: number; label: string; description?: string }>;
    };
  };
}

function parseBeckTest(content: string): ParsedTest {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  let title = 'Chestionar Beck';
  let description = '';
  const questions: Question[] = [];
  
  // Extract description
  const descMatch = content.match(/Chestionarul cuprinde[\s\S]*?(?=A TRISTETE|Chestionar Beck)/i);
  if (descMatch) {
    description = descMatch[0].trim();
  }
  
  // Parse sections (A-V) with options (0-3)
  // Look for pattern: "A. TRISTETE" or "A TRISTETE" followed by options "0. ...", "1. ...", etc.
  const sectionRegex = /^([A-V])\.?\s+(.+)$/i;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for section header (e.g., "A. TRISTETE" or "A TRISTETE")
    const sectionMatch = line.match(sectionRegex);
    if (sectionMatch) {
      const sectionLetter = sectionMatch[1].toUpperCase();
      const sectionName = sectionMatch[2].trim();
      
      // Skip if this is in the scoring section at the end
      if (line.includes('Itemi') || line.includes('scor')) {
        break;
      }
      
      // Collect options for this section (0-3)
      const options: QuestionOption[] = [];
      let j = i + 1;
      
      while (j < lines.length && j < i + 10) {
        const optionLine = lines[j];
        
        // Match pattern: "0. Text" or "0.Text" or "0 Text" (with or without space after dot)
        const optionMatch = optionLine.match(/^(\d+)\.\s*(.+)$/);
        if (optionMatch && ['0', '1', '2', '3'].includes(optionMatch[1])) {
          options.push({
            label: optionMatch[2].trim(),
            value: parseInt(optionMatch[1]),
            score: parseInt(optionMatch[1]),
          });
          j++;
        } else if (optionLine.match(/^[A-V]\.?\s+/i)) {
          // Next section found
          break;
        } else if (optionLine && !optionLine.match(/^(Itemi|Cum se|NOTA|Raspunsuri|Itemi \/ scor)/i)) {
          j++;
        } else {
          break;
        }
      }
      
      if (options.length >= 2) {
        questions.push({
          id: `section_${sectionLetter}`,
          text: sectionName,
          section: sectionLetter,
          options,
        });
      }
    }
  }
  
  // Parse scoring rules
  const scoringRules = {
    interpretation: {
      ranges: [
        { min: 0, max: 13, label: 'Depresie minimă' },
        { min: 14, max: 19, label: 'Depresie ușoară' },
        { min: 20, max: 28, label: 'Depresie moderată' },
        { min: 29, max: 63, label: 'Depresie severă' },
      ],
    },
  };

  return { title, description, questions, scoringRules };
}

function parseLeahyAnxietyTest(content: string): ParsedTest {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  let title = 'Scala de anxietate Leahy';
  let description = '';
  const questions: Question[] = [];
  
  // Extract description (everything before "INTREBARI:")
  const introIndex = content.indexOf('INTREBARI:');
  if (introIndex !== -1) {
    description = content.substring(0, introIndex).trim();
  }
  
  // Standard scale options
  const scaleOptions: QuestionOption[] = [
    { label: 'Nu este deloc adevărat', value: 1, score: 1 },
    { label: 'Adevărat în mică măsură', value: 2, score: 2 },
    { label: 'Adevărat în mare măsură', value: 3, score: 3 },
    { label: 'Absolut adevărat', value: 4, score: 4 },
  ];
  
  // Parse questions (1-16)
  const questionRegex = /^(\d+)\.\s*(.+)$/;
  for (const line of lines) {
    const match = line.match(questionRegex);
    if (match) {
      const questionNumber = parseInt(match[1]);
      if (questionNumber >= 1 && questionNumber <= 16) {
        questions.push({
          id: `q${questionNumber}`,
          text: match[2].trim(),
          options: scaleOptions,
        });
      }
    }
  }
  
  return { title, description, questions };
}

function parseCTOCTest(content: string): ParsedTest {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  let title = 'Chestionarul tulburării obsesiv-compulsive (CTOC)';
  let description = '';
  const questions: Question[] = [];
  
  // Extract description
  const descStart = content.indexOf('În tabelul');
  const descEnd = content.indexOf('Nivel de teama:');
  if (descStart !== -1 && descEnd !== -1) {
    description = content.substring(descStart, descEnd).trim();
  } else if (descStart !== -1) {
    description = content.substring(descStart, content.indexOf('Temeri:')).trim();
  }
  
  const scaleOptions: QuestionOption[] = [
    { label: 'Deloc', value: 0, score: 0 },
    { label: 'Puțin', value: 1, score: 1 },
    { label: 'Moderat', value: 2, score: 2 },
    { label: 'Foarte mult', value: 3, score: 3 },
  ];
  
  // Parse fears/obsessions (1-14)
  const questionRegex = /^(\d+)\.\s*(.+)$/;
  for (const line of lines) {
    const match = line.match(questionRegex);
    if (match) {
      const questionNumber = parseInt(match[1]);
      if (questionNumber >= 1 && questionNumber <= 14) {
        questions.push({
          id: `fear_${questionNumber}`,
          text: match[2].trim(),
          options: scaleOptions,
        });
      }
    }
  }
  
  return { title, description, questions };
}

function parseLearningStylesTest(content: string): ParsedTest {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  let title = 'Chestionar Stiluri de învățare';
  let description = '';
  const questions: Question[] = [];
  
  // Extract description (everything before first numbered question)
  const firstQuestionIndex = content.search(/\n1\.\s/);
  if (firstQuestionIndex !== -1) {
    description = content.substring(0, firstQuestionIndex).trim();
  }
  
  const binaryOptions: QuestionOption[] = [
    { label: 'Da (O)', value: 'O', score: 1 },
    { label: 'Nu (X)', value: 'X', score: 0 },
  ];
  
  // Parse questions (1-80)
  const questionRegex = /^(\d+)\.\s*(.+)$/;
  for (const line of lines) {
    const match = line.match(questionRegex);
    if (match) {
      const questionNumber = parseInt(match[1]);
      if (questionNumber >= 1 && questionNumber <= 80) {
        questions.push({
          id: `q${questionNumber}`,
          text: match[2].trim(),
          options: binaryOptions,
        });
      }
    }
  }
  
  return { title, description, questions };
}

function parseSCIDTest(content: string): ParsedTest {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  let title = 'Chestionar de Personalitate (SCID)';
  let description = '';
  const questions: Question[] = [];
  
  // Extract title and description
  const titleMatch = content.match(/^([^\n]+)/);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }
  
  // Extract description (everything from "Instructiuni" to first numbered question)
  const descStart = content.indexOf('Instructiuni');
  const descEnd = content.search(/\n1\.\s/);
  if (descStart !== -1 && descEnd !== -1) {
    description = content.substring(descStart, descEnd).trim();
  } else if (descStart !== -1) {
    description = content.substring(descStart, content.indexOf('1.')).trim();
  }
  
  const binaryOptions: QuestionOption[] = [
    { label: 'DA', value: 'DA', score: 1 },
    { label: 'NU', value: 'NU', score: 0 },
  ];
  
  // Parse questions - handle multi-line questions
  const questionRegex = /^(\d+)\.\s*(.+)$/;
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(questionRegex);
    if (match) {
      const questionNumber = parseInt(match[1]);
      if (questionNumber >= 1 && questionNumber <= 200) {
        let questionText = match[2].trim();
        
        // Collect continuation lines until next question or empty line
        let j = i + 1;
        while (j < lines.length && !lines[j].match(/^\d+\.\s/) && lines[j]) {
          questionText += ' ' + lines[j];
          j++;
        }
        
        questions.push({
          id: `q${questionNumber}`,
          text: questionText.trim(),
          options: binaryOptions,
        });
      }
    }
  }
  
  return { title, description, questions };
}

function parseSensoryPerceptionTest(content: string): ParsedTest {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  let title = 'Test de percepție senzorială';
  let description = '';
  const questions: Question[] = [];
  
  // Extract description
  const firstQuestionIndex = content.search(/\n1\.\s/);
  if (firstQuestionIndex !== -1) {
    description = content.substring(0, firstQuestionIndex).trim();
  }
  
  const options: QuestionOption[] = [
    { label: 'A', value: 'A', score: 1 },
    { label: 'B', value: 'B', score: 2 },
    { label: 'C', value: 'C', score: 3 },
    { label: 'D', value: 'D', score: 4 },
  ];
  
  // Parse questions with A-D options
  const questionRegex = /^(\d+)\.\s+(.+)$/;
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(questionRegex);
    if (match) {
      const questionNumber = parseInt(match[1]);
      if (questionNumber >= 1 && questionNumber <= 50) {
        let questionText = match[2];
        
        // Look for options in next lines
        const foundOptions: string[] = [];
        for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
          const optionMatch = lines[j].match(/^([A-D])\.\s+(.+)$/i);
          if (optionMatch) {
            foundOptions.push(optionMatch[2]);
          } else if (lines[j].match(/^\d+\./)) {
            break;
          } else if (lines[j] && !lines[j].match(/^(NOTA|Cum se)/i)) {
            questionText += ' ' + lines[j];
          }
        }
        
        questions.push({
          id: `q${questionNumber}`,
          text: questionText.trim(),
          options: foundOptions.length > 0 
            ? foundOptions.map((opt, idx) => ({
                label: opt,
                value: String.fromCharCode(65 + idx), // A, B, C, D
                score: idx + 1,
              }))
            : options,
        });
      }
    }
  }
  
  return { title, description, questions };
}

function parseTemperamentTest(content: string): ParsedTest {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  let title = 'Test de Temperament';
  let description = '';
  const questions: Question[] = [];
  
  // Extract description
  const firstQuestionIndex = content.search(/\n1\.\s+A\.\s/);
  if (firstQuestionIndex !== -1) {
    description = content.substring(0, firstQuestionIndex).trim();
  }
  
  // Parse questions with A/B options
  const questionRegex = /^(\d+)\.\s+A\.\s+(.+)$/i;
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(questionRegex);
    if (match) {
      const questionNumber = parseInt(match[1]);
      const optionAText = match[2].trim();
      
      // Find option B
      let optionBText = '';
      if (i + 1 < lines.length) {
        const bMatch = lines[i + 1].match(/^B\.\s+(.+)$/i);
        if (bMatch) {
          optionBText = bMatch[1].trim();
        }
      }
      
      if (optionBText) {
        questions.push({
          id: `q${questionNumber}`,
          text: `Întrebarea ${questionNumber}`,
          options: [
            { label: `A. ${optionAText}`, value: 'A', score: 1 },
            { label: `B. ${optionBText}`, value: 'B', score: 0 },
          ],
        });
      }
    }
  }
  
  return { title, description, questions };
}

function parseIntelligenceTest(content: string): ParsedTest {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  let title = 'Test de Inteligență - Tipuri de Inteligență Multiple';
  let description = '';
  const questions: Question[] = [];
  
  // Extract title and description
  const titleMatch = content.match(/^([^\n]+)/);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }
  
  // Extract description (everything before first numbered question)
  const firstQuestionIndex = content.search(/\n1\.\s/);
  if (firstQuestionIndex !== -1) {
    description = content.substring(0, firstQuestionIndex).trim();
  }
  
  // Parse questions (format: "1. Text (number)")
  const questionRegex = /^(\d+)\.\s+(.+?)(?:\s*\((\d+)\))?$/;
  for (const line of lines) {
    const match = line.match(questionRegex);
    if (match) {
      const questionNumber = parseInt(match[1]);
      let questionText = match[2].trim();
      
      // Remove the number in parentheses if present
      questionText = questionText.replace(/\s*\(\d+\)\s*$/, '').trim();
      
      if (questionNumber >= 1 && questionNumber <= 100) {
        // Binary options (true/false for this test)
        questions.push({
          id: `q${questionNumber}`,
          text: questionText,
          options: [
            { label: 'Adevărat', value: 'true', score: 1 },
            { label: 'Fals', value: 'false', score: 0 },
          ],
        });
      }
    }
  }
  
  return { title, description, questions };
}

function detectTestType(filename: string, content: string): string {
  const lowerContent = content.toLowerCase();
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.includes('beck') || lowerContent.includes('chestionar beck')) {
    return 'beck';
  }
  if (lowerFilename.includes('leahy') || lowerContent.includes('scala de anxietate')) {
    return 'leahy';
  }
  if (lowerFilename.includes('ctoc') || lowerContent.includes('tulburării obsesiv') || lowerContent.includes('obsesii')) {
    return 'ctoc';
  }
  if (lowerFilename.includes('stiluri') || lowerFilename.includes('învățare') || lowerFilename.includes('invatare')) {
    return 'learning';
  }
  if (lowerFilename.includes('scid') || lowerContent.includes('chestionar de personalitate')) {
    return 'scid';
  }
  if (lowerFilename.includes('percepție') || lowerFilename.includes('senzorial') || lowerFilename.includes('perceptie')) {
    return 'sensory';
  }
  if (lowerFilename.includes('temperament')) {
    return 'temperament';
  }
  if (lowerFilename.includes('inteligență') || lowerFilename.includes('inteligenta') || lowerFilename.includes('inteligente')) {
    return 'intelligence';
  }
  
  return 'generic';
}

async function parseAndUploadTest(filePath: string): Promise<boolean> {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const filename = path.basename(filePath);
    const testType = detectTestType(filename, content);
    
    let parsed: ParsedTest;
    
    switch (testType) {
      case 'beck':
        parsed = parseBeckTest(content);
        break;
      case 'leahy':
        parsed = parseLeahyAnxietyTest(content);
        break;
      case 'ctoc':
        parsed = parseCTOCTest(content);
        break;
      case 'learning':
        parsed = parseLearningStylesTest(content);
        break;
      case 'scid':
        parsed = parseSCIDTest(content);
        break;
      case 'sensory':
        parsed = parseSensoryPerceptionTest(content);
        break;
      case 'temperament':
        parsed = parseTemperamentTest(content);
        break;
      case 'intelligence':
        parsed = parseIntelligenceTest(content);
        break;
      default:
        // Try generic parsing
        parsed = parseIntelligenceTest(content);
    }
    
    if (parsed.questions.length === 0) {
      console.error(`❌ ${filename}: Nu s-au găsit întrebări (tip detectat: ${testType})`);
      return false;
    }
    
    // Check if template already exists
    const existingQuery = await db.collection('testTemplates')
      .where('title', '==', parsed.title)
      .limit(1)
      .get();
    
    if (!existingQuery.empty) {
      console.log(`⚠️  ${filename}: Template există deja, se actualizează...`);
      const existingDoc = existingQuery.docs[0];
      await existingDoc.ref.update({
        ...parsed,
        version: (existingDoc.data().version || 0) + 1,
        updatedAt: new Date(),
      });
      console.log(`✅ ${filename}: Actualizat cu succes (${parsed.questions.length} întrebări)`);
    } else {
      await db.collection('testTemplates').add({
        ...parsed,
        version: 1,
        createdAt: new Date(),
      });
      console.log(`✅ ${filename}: Încărcat cu succes (${parsed.questions.length} întrebări)`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ ${path.basename(filePath)}:`, error);
    return false;
  }
}

async function main() {
  const testsDir = path.join(process.cwd(), 'tests-data');
  
  if (!fs.existsSync(testsDir)) {
    console.error('❌ Directorul tests-data nu există!');
    process.exit(1);
  }
  
  const files = fs.readdirSync(testsDir)
    .filter(f => f.endsWith('.txt'))
    .map(f => path.join(testsDir, f));
  
  if (files.length === 0) {
    console.error('❌ Nu s-au găsit fișiere .txt în tests-data!');
    process.exit(1);
  }
  
  console.log(`\n📋 Găsite ${files.length} fișiere de test\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const file of files) {
    const success = await parseAndUploadTest(file);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log(`\n📊 Rezumat:`);
  console.log(`   ✅ Succes: ${successCount}`);
  console.log(`   ❌ Eșec: ${failCount}`);
  console.log(`\n`);
}

main().catch(console.error);
