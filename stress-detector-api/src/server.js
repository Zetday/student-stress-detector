import server from './server/index.js';
import consumer from './services/exports/consumer.js';

const portEnv = process.env.PORT;
const host = process.env.HOST || '0.0.0.0';
const port = Number(portEnv) || 3000;

if (Number.isNaN(Number(portEnv))) {
  console.warn(`Warning: invalid PORT value '${portEnv}' — falling back to ${port}`);
}

server.listen(port, host, () => {
  const protocol = process.env.PROTOCOL || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  console.log(`Server running at ${protocol}://${host}:${port}`);

  // Start the background RabbitMQ consumer
  consumer.start();
});
// Trigger nodemon reload

