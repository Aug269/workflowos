import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Increase payload limit for high-res document images
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// POST /api/ocr: Multimodal OCR extraction for physical paper Work Orders
app.post('/api/ocr', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Nenhuma imagem foi recebida.' });
    }

    if (!ai) {
      // In case GEMINI_API_KEY is not supplied in dev, provide intelligent fallback
      const isInvalidDoc = imageBase64.includes('DOCUMENTO INVÁLIDO') || 
                           imageBase64.includes('DIVERSA') || 
                           imageBase64.includes('NOTA FISCAL') || 
                           imageBase64.includes('COMPROVANTE') || 
                           imageBase64.includes('sample_nota_fiscal') ||
                           imageBase64.includes('sample_comprovante');

      if (isInvalidDoc) {
        return res.status(200).json({
          success: true,
          fallback: true,
          data: {
            isWorkOrder: false,
            detectedDocumentType: 'outro_invalido',
            documentTypeLabel: 'Documento Inválido',
            nonWorkOrderReason: 'O documento digitalizado não é uma Ordem de Serviço.',
            confidenceScore: 98,
            osNumber: '',
            clientName: '',
            clientPhone: '',
            equipmentModel: '',
            serialNumber: '',
            reportedDefect: 'Documento não reconhecido como Ordem de Serviço.',
            entryDate: new Date().toISOString().split('T')[0],
            technicianName: '',
            priority: 'Baixa',
            serviceType: 'Corretiva',
            preliminaryNotes: 'Documento físico que não é uma Ordem de Serviço.',
          },
        });
      }

      return res.status(200).json({
        success: true,
        fallback: true,
        message: 'Modo de demonstração ativado (chave Gemini não configurada).',
        data: {
          isWorkOrder: true,
          detectedDocumentType: 'ordem_de_servico',
          documentTypeLabel: 'Ordem de Serviço (O.S.)',
          nonWorkOrderReason: '',
          confidenceScore: 97,
          osNumber: 'OS-' + Math.floor(1000 + Math.random() * 9000),
          clientName: 'Indústria Metalúrgica Aliança Ltda',
          clientPhone: '(11) 98765-4321',
          equipmentModel: 'Motor Elétrico WEG W22 15CV 4P',
          serialNumber: 'WEG-2024-88419',
          reportedDefect: 'Superaquecimento excessivo no mancal dianteiro e ruído atípico em rotação nominal após parada brusca.',
          entryDate: new Date().toISOString().split('T')[0],
          technicianName: 'Roberto Silva (Técnico de Produção)',
          priority: 'Alta',
          serviceType: 'Corretiva',
          preliminaryNotes: 'Folha física com carimbo inicial de entrada na Produção. Enrolamento aparenta bom estado visual.',
        },
      });
    }

    const cleanedBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanedBase64,
            },
          },
          {
            text: `Você é um perito em digitalização, triagem e leitura OCR de documentos industriais e ordens de serviço (O.S.).
PRIMEIRA TAREFA CRÍTICA:
Determine com máxima precisão se a imagem capturada é de fato uma ORDEM DE SERVIÇO (ficha de atendimento, ordem de trabalho, ficha de manutenção/conserto).
Se o documento NÃO for uma Ordem de Serviço:
Defina "isWorkOrder": false, "documentTypeLabel": "Documento Inválido", "nonWorkOrderReason": "O documento físico digitalizado não é uma Ordem de Serviço.". Não precisa detalhar qual é o tipo de documento.

Se for uma Ordem de Serviço:
Defina "isWorkOrder": true, "documentTypeLabel": "Ordem de Serviço (O.S.)", "nonWorkOrderReason": "", e extraia todos os dados cadastrais, técnicos e de identificação presentes nos campos impressos ou manuscritos.

Retorne EXCLUSIVAMENTE um objeto JSON válido no seguinte formato:
{
  "isWorkOrder": true ou false,
  "documentTypeLabel": "Ordem de Serviço (O.S.)" ou "Documento Inválido",
  "nonWorkOrderReason": "Se não for O.S., informe apenas que o documento não é uma Ordem de Serviço. Se for O.S., deixe vazio",
  "confidenceScore": número entre 0 e 100,
  "osNumber": "Número da O.S. se for O.S. (ex: OS-1042)",
  "clientName": "Nome do Cliente ou Razão Social",
  "clientPhone": "Telefone, WhatsApp ou contato",
  "equipmentModel": "Nome do Equipamento, Fabricante e Modelo",
  "serialNumber": "Número de Série ou Plaqueta/Tag",
  "reportedDefect": "Defeito relatado ou problema informado",
  "entryDate": "Data de entrada encontrada no formato AAAA-MM-DD",
  "technicianName": "Nome do técnico responsável pela abertura",
  "priority": "Baixa, Média, Alta ou Urgente",
  "serviceType": "Garantia, Orçamento, Corretiva ou Preventiva",
  "preliminaryNotes": "Observações adicionais legíveis na folha"
}`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsedData = JSON.parse(text);
    return res.json({ success: true, fallback: false, data: parsedData });
  } catch (err: any) {
    console.error('Erro no processamento OCR:', err);
    return res.status(500).json({
      error: 'Falha ao processar OCR da imagem da folha física.',
      details: err?.message || String(err),
    });
  }
});

// Vite middleware in development
const isProd = process.env.NODE_ENV === 'production';
if (!isProd) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
