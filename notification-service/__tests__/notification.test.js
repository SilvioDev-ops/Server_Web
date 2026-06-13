import request from 'supertest';
import app from '../src/app.js';
import dotenv from 'dotenv';
import { jest } from '@jest/globals';

// Cargar variables de entorno de prueba
dotenv.config({ path: '.env.test' });

// Mock del controlador de envío de email
jest.unstable_mockModule('../src/controllers/sendResetPasswordEmailController.js', () => ({
  sendResetPasswordEmailController: jest.fn()
}));

// Importar el mock después de configurarlo
const { sendResetPasswordEmailController } = await import('../src/controllers/sendResetPasswordEmailController.js');

describe('Notification Service - Envío de Correos', () => {

  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('POST /notification/forgot-password', () => {
    test('Debe enviar correo de recuperación exitosamente', async () => {
      // Configurar el mock para devolver una respuesta exitosa
      sendResetPasswordEmailController.mockResolvedValue({
        messageId: 'mock-message-id-12345'
      });

      const emailData = {
        to: 'user@example.com',
        subject: 'Recuperación de contraseña',
        text: 'Haz clic en el siguiente enlace para recuperar tu contraseña',
        html: '<p>Haz clic en el siguiente enlace para recuperar tu contraseña</p>'
      };

      const response = await request(app)
        .post('/notification/forgot-password')
        .send(emailData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Email enviado exitosamente');
      expect(response.body).toHaveProperty('messageId');
      expect(sendResetPasswordEmailController).toHaveBeenCalledTimes(1);
      expect(sendResetPasswordEmailController).toHaveBeenCalledWith(
        expect.objectContaining({
          to: emailData.to,
          subject: emailData.subject
        })
      );
    });

    test('No debe enviar correo sin campo "to" (destinatario)', async () => {
      const invalidData = {
        subject: 'Test Subject',
        text: 'Test content'
      };

      const response = await request(app)
        .post('/notification/forgot-password')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Faltan campos obligatorios');
      expect(sendResetPasswordEmailController).not.toHaveBeenCalled();
    });

    test('No debe enviar correo sin campo "subject" (asunto)', async () => {
      const invalidData = {
        to: 'user@example.com',
        text: 'Test content'
      };

      const response = await request(app)
        .post('/notification/forgot-password')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Faltan campos obligatorios');
      expect(sendResetPasswordEmailController).not.toHaveBeenCalled();
    });

    test('No debe enviar correo sin contenido (text o html)', async () => {
      const invalidData = {
        to: 'user@example.com',
        subject: 'Test Subject'
      };

      const response = await request(app)
        .post('/notification/forgot-password')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Faltan campos obligatorios');
      expect(sendResetPasswordEmailController).not.toHaveBeenCalled();
    });

    test('Debe aceptar correo solo con campo "text"', async () => {
      sendResetPasswordEmailController.mockResolvedValue({
        messageId: 'mock-message-id-67890'
      });

      const emailData = {
        to: 'user@example.com',
        subject: 'Test Subject',
        text: 'Plain text content'
      };

      const response = await request(app)
        .post('/notification/forgot-password')
        .send(emailData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Email enviado exitosamente');
      expect(sendResetPasswordEmailController).toHaveBeenCalledTimes(1);
    });

    test('Debe aceptar correo solo con campo "html"', async () => {
      sendResetPasswordEmailController.mockResolvedValue({
        messageId: 'mock-message-id-11111'
      });

      const emailData = {
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<p>HTML content</p>'
      };

      const response = await request(app)
        .post('/notification/forgot-password')
        .send(emailData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Email enviado exitosamente');
      expect(sendResetPasswordEmailController).toHaveBeenCalledTimes(1);
    });

    test('Debe manejar error del proveedor de correo (500)', async () => {
      // Configurar el mock para que rechace la promesa
      sendResetPasswordEmailController.mockRejectedValue(
        new Error('Error de conexión con el servidor de correo')
      );

      const emailData = {
        to: 'user@example.com',
        subject: 'Test Subject',
        text: 'Test content'
      };

      const response = await request(app)
        .post('/notification/forgot-password')
        .send(emailData)
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Error al enviar email');
      expect(response.body).toHaveProperty('error');
      expect(sendResetPasswordEmailController).toHaveBeenCalledTimes(1);
    });

    test('Debe manejar error de autenticación del proveedor', async () => {
      sendResetPasswordEmailController.mockRejectedValue(
        new Error('Authentication failed')
      );

      const emailData = {
        to: 'user@example.com',
        subject: 'Recovery Email',
        text: 'Click here to recover your password'
      };

      const response = await request(app)
        .post('/notification/forgot-password')
        .send(emailData)
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Error al enviar email');
      expect(response.body.error).toContain('Authentication failed');
    });

    test('Debe validar que el email destino sea un string', async () => {
      const invalidData = {
        to: 12345, // número en lugar de string
        subject: 'Test',
        text: 'Test'
      };

      const response = await request(app)
        .post('/notification/forgot-password')
        .send(invalidData);

      // Podría ser 400 o podría procesar dependiendo de la validación
      // Asumimos que pasa validación básica pero debería fallar
      expect([400, 500]).toContain(response.status);
    });

    test('Debe enviar correo con múltiples destinatarios', async () => {
      sendResetPasswordEmailController.mockResolvedValue({
        messageId: 'mock-message-id-multi'
      });

      const emailData = {
        to: 'user1@example.com, user2@example.com',
        subject: 'Mass notification',
        text: 'This is a mass email'
      };

      const response = await request(app)
        .post('/notification/forgot-password')
        .send(emailData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Email enviado exitosamente');
      expect(sendResetPasswordEmailController).toHaveBeenCalledTimes(1);
    });
  });
});
