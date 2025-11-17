// Define como é o seu payload de usuário (vindo do JWT)
interface UserPayload {
  id: string; // IDs do Prisma são strings
  name: string;
  email: string;
  points?: number;
  studyHours?: number;
  level?: number;
  role?: string;
}

// Isso "avisa" ao TypeScript para adicionar a propriedade 'user' ao objeto Request
declare global {
  namespace Express {
    export interface Request {
      user?: UserPayload;
    }
  }
}

// Necessário para que o arquivo seja um módulo
export {};