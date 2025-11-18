import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { TestTemplate, Question, QuestionOption } from '../lib/types';

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    initializeApp();
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
  let currentSection = '';
  let questionCounter = 0;

  // Extract title and description
  const titleMatch = content.match(/Chestionar Beck/i);
  if (titleMatch) {
    const introIndex = content.indexOf('Chestionarul cuprinde');
    if (introIndex !== -1) {
      description = content.substring(introIndex, content.indexOf('A TRISTETE')).trim();
    }
  }

  // Parse sections and questions
  const sectionRegex = /^([A-V])\.?\s+(.+)$/;
  const questionRegex = /^(\d+)\.\s*(.+)$/;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for section header
    const sectionMatch = line.match(sectionRegex);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      continue;
    }
    
    // Check for question with options
    const questionMatch = line.match(questionRegex);
    if (questionMatch && currentSection) {
      const questionNumber = parseInt(questionMatch[1]);
      const questionText = questionMatch[2];
      
      // Look ahead for options (0, 1, 2, 3)
      const options: QuestionOption[] = [];
      let j = i + 1;
      while (j < lines.length && j < i + 5) {
        const optionLine = lines[j];
        const optionMatch = optionLine.match(/^(\d+)\.\s*(.+)$/);
        if (optionMatch && ['0', '1', '2', '3'].includes(optionMatch[1])) {
          options.push({
            label: optionMatch[2],
            value: parseInt(optionMatch[1]),
            score: parseInt(optionMatch[1]),
          });
          j++;
        } else {
          break;
        }
      }
      
      if (options.length > 0) {
        questions.push({
          id: `${currentSection}_${questionNumber}`,
          text: questionText,
          section: currentSection,
          options,
        });
        questionCounter++;
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
  
  // Extract scale description
  const scaleStart = content.indexOf('1 =');
  const scaleEnd = content.indexOf('INTREBARI:');
  if (scaleStart !== -1 && scaleEnd !== -1) {
    description = content.substring(0, scaleEnd).trim();
  }
  
  // Parse questions
  const questionRegex = /^(\d+)\.\s*(.+)$/;
  const scaleOptions: QuestionOption[] = [
    { label: 'Nu este deloc adevărat', value: 1, score: 1 },
    { label: 'Adevărat în mică măsură', value: 2, score: 2 },
    { label: 'Adevărat în mare măsură', value: 3, score: 3 },
    { label: 'Absolut adevărat', value: 4, score: 4 },
  ];
  
  for (const line of lines) {
    const match = line.match(questionRegex);
    if (match) {
      const questionNumber = parseInt(match[1]);
      if (questionNumber >= 1 && questionNumber <= 16) {
        questions.push({
          id: `q${questionNumber}`,
          text: match[2],
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
  }
  
  const scaleOptions: QuestionOption[] = [
    { label: 'Deloc', value: 0, score: 0 },
    { label: 'Puțin', value: 1, score: 1 },
    { label: 'Moderat', value: 2, score: 2 },
    { label: 'Foarte mult', value: 3, score: 3 },
  ];
  
  // Parse fears/obsessions
  const questionRegex = /^(\d+)\.\s*(.+)$/;
  for (const line of lines) {
    const match = line.match(questionRegex);
    if (match) {
      const questionNumber = parseInt(match[1]);
      if (questionNumber >= 1 && questionNumber <= 14) {
        questions.push({
          id: `fear_${questionNumber}`,
          text: match[2],
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
  
  // Extract description
  const descEnd = content.indexOf('1. Am opinii');
  if (descEnd !== -1) {
    description = content.substring(0, descEnd).trim();
  }
  
  const binaryOptions: QuestionOption[] = [
    { label: 'Da (O)', value: 'O', score: 1 },
    { label: 'Nu (X)', value: 'X', score: 0 },
  ];
  
  // Parse questions
  const questionRegex = /^(\d+)\.\s*(.+)$/;
  for (const line of lines) {
    const match = line.match(questionRegex);
    if (match) {
      const questionNumber = parseInt(match[1]);
      if (questionNumber >= 1 && questionNumber <= 80) {
        questions.push({
          id: `q${questionNumber}`,
          text: match[2],
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
  
  // Extract description
  const descStart = content.indexOf('Instructiuni');
  const descEnd = content.indexOf('1. Ati evitat');
  if (descStart !== -1 && descEnd !== -1) {
    description = content.substring(descStart, descEnd).trim();
  }
  
  const binaryOptions: QuestionOption[] = [
    { label: 'DA', value: 'DA', score: 1 },
    { label: 'NU', value: 'NU', score: 0 },
  ];
  
  // Parse questions
  const questionRegex = /^(\d+)\.\s*(.+)$/;
  for (const line of lines) {
    const match = line.match(questionRegex);
    if (match) {
      const questionNumber = parseInt(match[1]);
      if (questionNumber >= 1 && questionNumber <= 119) {
        questions.push({
          id: `q${questionNumber}`,
          text: match[2],
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
  const descEnd = content.indexOf('1.      Când');
  if (descEnd !== -1) {
    description = content.substring(0, descEnd).trim();
  }
  
  const options: QuestionOption[] = [
    { label: 'A', value: 'A', score: 1 },
    { label: 'B', value: 'B', score: 2 },
    { label: 'C', value: 'C', score: 3 },
    { label: 'D', value: 'D', score: 4 },
  ];
  
  // Parse questions
  const questionRegex = /^(\d+)\.\s+(.+)$/;
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(questionRegex);
    if (match) {
      const questionNumber = parseInt(match[1]);
      if (questionNumber >= 1 && questionNumber <= 15) {
        // Get question text (may span multiple lines)
        let questionText = match[2];
        // Look for options in next lines
        const optionLines: string[] = [];
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          if (lines[j].match(/^[A-D]\.\s+/)) {
            optionLines.push(lines[j]);
          } else if (lines[j].trim() && !lines[j].match(/^\d+\./)) {
            questionText += ' ' + lines[j];
          } else {
            break;
          }
        }
        
        questions.push({
          id: `q${questionNumber}`,
          text: questionText,
          options,
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
  const descEnd = content.indexOf('1. A. Sunt');
  if (descEnd !== -1) {
    description = content.substring(0, descEnd).trim();
  }
  
  // Parse questions with A/B options
  const questionRegex = /^(\d+)\.\s+A\.\s+(.+)$/;
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(questionRegex);
    if (match) {
      const questionNumber = parseInt(match[1]);
      const optionAText = match[2];
      
      // Find option B
      let optionBText = '';
      if (i + 1 < lines.length && lines[i + 1].match(/^B\.\s+(.+)$/)) {
        const bMatch = lines[i + 1].match(/^B\.\s+(.+)$/);
        if (bMatch) {
          optionBText = bMatch[1];
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
  // Generic parser for intelligence test
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  let title = lines[0] || 'Test de Inteligență';
  let description = '';
  const questions: Question[] = [];
  
  // Try to detect format and parse accordingly
  // This is a fallback parser
  const questionRegex = /^(\d+)\.\s*(.+)$/;
  for (const line of lines) {
    const match = line.match(questionRegex);
    if (match) {
      questions.push({
        id: `q${match[1]}`,
        text: match[2],
        options: [
          { label: 'Da', value: 'DA', score: 1 },
          { label: 'Nu', value: 'NU', score: 0 },
        ],
      });
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
  if (lowerFilename.includes('ctoc') || lowerContent.includes('tulburării obsesiv')) {
    return 'ctoc';
  }
  if (lowerFilename.includes('stiluri') || lowerFilename.includes('învățare')) {
    return 'learning';
  }
  if (lowerFilename.includes('scid') || lowerContent.includes('chestionar de personalitate')) {
    return 'scid';
  }
  if (lowerFilename.includes('percepție') || lowerFilename.includes('senzorial')) {
    return 'sensory';
  }
  if (lowerFilename.includes('temperament')) {
    return 'temperament';
  }
  if (lowerFilename.includes('inteligență') || lowerFilename.includes('inteligenta')) {
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
        parsed = parseIntelligenceTest(content);
    }
    
    if (parsed.questions.length === 0) {
      console.error(`❌ ${filename}: Nu s-au găsit întrebări`);
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

