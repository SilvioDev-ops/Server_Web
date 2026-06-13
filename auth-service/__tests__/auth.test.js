import request from 'supertest';
import app from '../src/app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import { jest } from '@jest/globals';

// Cargar variables de entorno de prueba
dotenv.config({ path: '.env.test' });

// Mock de axios para las llamadas HTTP externas
jest.spyOn(axios, 'post').mockImplementation((url, data) => {
  // Mock para users-service (crear perfil)
  if (url.includes('userProfile/postUserProfile')) {
    return Promise.resolve({
      data: {
        _id: 'profile-id-123',
        userId: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName
      }
    });
  }

  // Mock para notification-service (enviar email)
  if (url.includes('notification/forgot-password')) {
    return Promise.resolve({
      data: {
        message: 'Email enviado exitosamente',
        messageId: 'mock-message-id'
      }
    });
  }

  return Promise.resolve({ data: {} });
});

let testUser = {
  email: 'testuser@example.com',
  password: 'Test1234!',
  firstName: 'Test',
  lastName: 'User'
};

let adminUser = {
  email: process.env.MAIL_ADMIN || 'admin@example.com',
  password: 'Admin1234!',
  firstName: 'Admin',
  lastName: 'User'
};

let authToken = '';
let adminToken = '';
let userId = '';
let adminUserId = '';
let refreshToken = '';

// Conectar a la base de datos de prueba antes de las pruebas
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI_AUTH);
  }
  // Limpiar la base de datos de prueba
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Desconectar después de todas las pruebas
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth Service - Registro y Login', () => {

  describe('POST /user/register', () => {
    test('Debe registrar un nuevo usuario exitosamente', async () => {
      const response = await request(app)
        .post('/user/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('_id');
      userId = response.body.user._id;

      // Verificar el usuario para poder hacer login
      const collections = mongoose.connection.collections;
      await collections.users.updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { $set: { isVerified: true } }
      );
    });

    test('No debe registrar un usuario con email duplicado', async () => {
      const response = await request(app)
        .post('/user/register')
        .send(testUser)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('already exists');
    });

    test('No debe registrar un usuario con datos inválidos', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: '123',
        firstName: 'A',
        lastName: 'B'
      };

      await request(app)
        .post('/user/register')
        .send(invalidUser)
        .expect(400);
    });

    test('Debe registrar un usuario administrador', async () => {
      const response = await request(app)
        .post('/user/register')
        .send(adminUser)
        .expect(201);

      expect(response.body.user.email).toBe(adminUser.email);
      expect(response.body.user.roles).toContain('Admin');
      adminUserId = response.body.user._id;

      // Verificar el admin para poder hacer login
      const collections = mongoose.connection.collections;
      await collections.users.updateOne(
        { _id: new mongoose.Types.ObjectId(adminUserId) },
        { $set: { isVerified: true } }
      );
    });
  });

  describe('POST /user/login', () => {
    test('Debe hacer login exitosamente con credenciales válidas', async () => {
      const response = await request(app)
        .post('/user/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');

      authToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    test('Debe hacer login del administrador', async () => {
      const response = await request(app)
        .post('/user/login')
        .send({
          email: adminUser.email,
          password: adminUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      adminToken = response.body.accessToken;
    });

    test('No debe hacer login con credenciales inválidas', async () => {
      await request(app)
        .post('/user/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);
    });

    test('No debe hacer login con email inexistente', async () => {
      await request(app)
        .post('/user/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);
    });
  });
});

describe('Auth Service - Renovación de Token', () => {

  describe('POST /user/refresh-token', () => {
    test('Debe renovar el token con un refresh token válido', async () => {
      const response = await request(app)
        .post('/user/refresh-token')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
    });

    test('No debe renovar el token con refresh token inválido', async () => {
      await request(app)
        .post('/user/refresh-token')
        .send({ refreshToken: 'invalid-token-12345' })
        .expect(401);
    });

    test('No debe renovar el token sin refresh token', async () => {
      await request(app)
        .post('/user/refresh-token')
        .send({})
        .expect(400);
    });
  });
});

describe('Auth Service - Recuperación y Restablecimiento de Contraseña', () => {

  describe('POST /user/forgot-password', () => {
    test('Debe solicitar recuperación de contraseña exitosamente', async () => {
      const response = await request(app)
        .post('/user/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    test('No debe solicitar recuperación con email inválido', async () => {
      await request(app)
        .post('/user/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);
    });

    test('Debe procesar recuperación para email inexistente sin revelar info', async () => {
      const response = await request(app)
        .post('/user/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /user/reset-password', () => {
    test('No debe restablecer contraseña con token inválido', async () => {
      await request(app)
        .post('/user/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'NewPassword123!'
        })
        .expect(400);
    });
  });
});

describe('Auth Service - Rutas Protegidas con Autenticación', () => {

  describe('GET /user/getUser/:userId', () => {
    test('Debe obtener usuario con token válido', async () => {
      const response = await request(app)
        .get(`/user/getUser/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('email', testUser.email);
    });

    test('No debe obtener usuario sin token', async () => {
      await request(app)
        .get(`/user/getUser/${userId}`)
        .expect(401);
    });

    test('No debe obtener usuario con token inválido', async () => {
      await request(app)
        .get(`/user/getUser/${userId}`)
        .set('Authorization', 'Bearer invalid-token-xyz')
        .expect(401);
    });
  });

  describe('PUT /user/updateUser/:userId', () => {
    test('Admin debe poder actualizar contraseña de cualquier usuario', async () => {
      const response = await request(app)
        .put(`/user/updateUser/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          oldPassword: testUser.password,
          newPassword: 'NewPassword123!'
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');

      // Actualizar la contraseña en el objeto de prueba
      testUser.password = 'NewPassword123!';
    });

    test('No debe actualizar contraseña sin autenticación', async () => {
      await request(app)
        .put(`/user/updateUser/${userId}`)
        .send({
          oldPassword: 'OldPassword123!',
          newPassword: 'NewPassword456!'
        })
        .expect(401);
    });
  });
});

describe('Auth Service - Administración de Usuarios (Rol Admin)', () => {

  describe('GET /user/getAllUsers', () => {
    test('Admin debe poder obtener todos los usuarios', async () => {
      const response = await request(app)
        .get('/user/getAllUsers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('Cliente no debe poder obtener todos los usuarios', async () => {
      await request(app)
        .get('/user/getAllUsers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });

    test('No debe obtener usuarios sin autenticación', async () => {
      await request(app)
        .get('/user/getAllUsers')
        .expect(401);
    });
  });

  describe('POST /user/updateUserStatus/:userId', () => {
    test('Admin debe poder actualizar estado de usuario', async () => {
      const response = await request(app)
        .post(`/user/updateUserStatus/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false })
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    test('Cliente no debe poder actualizar estado de usuario', async () => {
      await request(app)
        .post(`/user/updateUserStatus/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isActive: false })
        .expect(403);
    });

    test('No debe actualizar estado sin autenticación', async () => {
      await request(app)
        .post(`/user/updateUserStatus/${userId}`)
        .send({ isActive: false })
        .expect(401);
    });
  });
});
