export const MONGO_URI = 'MONGO_URI';

export const JWT_SECRET = 'JWT_SECRET';
export const JWT_EXPIRES_IN = 'JWT_EXPIRES_IN';

export const RABBITMQ_URL = 'RABBITMQ_URL';

export const RABBITMQ_QUEUE = (name: string) => `RABBITMQ_${name}_QUEUE`;
