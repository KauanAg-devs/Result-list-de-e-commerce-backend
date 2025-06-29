import { existsSync } from 'fs';
import { resolve } from 'path';
import dotenv from 'dotenv'

dotenv.config()

const requiredEnvVars = [
  'DATABASE_PASSWORD',
  'DATABASE_URL',
  'JWT_SECRET_KEY',
  'JWT_REFRESH_SECRET_KEY',
  'EMAIL_RESEND_API_KEY',
  'BACKEND_URI',
];

function checkEnv() {
  const envPath = resolve(process.cwd(), '.env');

  if (!existsSync(envPath)) {
    console.error('❌ Arquivo .env não encontrado! Por favor, crie um a partir do .env.example e preencha as variáveis.');
    process.exit(1);
  }

  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    console.error(`❌ Variáveis de ambiente faltando no .env: ${missingVars.join(', ')}`);
    console.error('Por favor, preencha todas as variáveis necessárias no arquivo .env antes de continuar.');
    process.exit(1);
  }

  console.log('✅ .env encontrado e todas variáveis obrigatórias estão definidas.');
}

checkEnv();
