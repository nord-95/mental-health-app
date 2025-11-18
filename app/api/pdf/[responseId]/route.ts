import { NextRequest, NextResponse } from 'next/server';
import { getResponse, getTestTemplate } from '@/firebase/firestore';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { formatRomanianDate } from '@/lib/utils';

// This is a simplified version - in production, use a proper PDF generation library
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ responseId: string }> }
) {
  try {
    const { responseId } = await params;
    const response = await getResponse(responseId);
    if (!response) {
      return NextResponse.json({ error: 'Răspuns nu a fost găsit' }, { status: 404 });
    }

    const template = await getTestTemplate(response.templateId);
    if (!template) {
      return NextResponse.json({ error: 'Template nu a fost găsit' }, { status: 404 });
    }

    // Generate PDF content
    const pdfContent = generatePDFContent(response, template);

    // For now, return a simple HTML representation
    // In production, use a proper PDF library like react-pdf/renderer or puppeteer
    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="test-${responseId}.html"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generatePDFContent(response: any, template: any): string {
  const html = `
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <title>Rezultate Test - ${template.title}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #1890ff; }
    h2 { color: #333; margin-top: 20px; }
    .answer { margin: 10px 0; padding: 10px; background: #f5f5f5; }
    .score { font-weight: bold; color: #1890ff; }
  </style>
</head>
<body>
  <h1>${template.title}</h1>
  <p><strong>Data completării:</strong> ${formatRomanianDate(response.createdAt)}</p>
  <p><strong>Scor Total:</strong> <span class="score">${response.totalScore}</span></p>
  
  <h2>Răspunsuri</h2>
  ${response.answers.map((answer: any, index: number) => {
    const question = template.questions.find((q: any) => q.id === answer.questionId);
    const option = question?.options.find((o: any) => 
      o.value === answer.optionValue || String(o.value) === String(answer.optionValue)
    );
    return `
      <div class="answer">
        <p><strong>${index + 1}. ${question?.text || 'Întrebare necunoscută'}</strong></p>
        <p>Răspuns: ${option?.label || String(answer.optionValue)}</p>
        <p>Scor: ${answer.score}</p>
      </div>
    `;
  }).join('')}
</body>
</html>
  `;
  return html;
}

