import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env fica na raiz do monorepo (../../ a partir de server/src)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
