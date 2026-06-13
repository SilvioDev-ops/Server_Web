import request from 'supertest';
import app from '../src/app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno de prueba
dotenv.config({ path: '.env.test' });

let clientToken = '';
let adminToken = '';
let clientUserId = '507f1f77bcf86cd799439011'; // ID de prueba
let adminUserId = '507f1f77bcf86cd799439012'; // ID de prueba
let profileId = '';

// Generar tokens de prueba
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI_AUTH);
  }

  // Limpiar la base de datos de prueba
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }

  // Generar tokens de autenticación
  clientToken = jwt.sign(
    { userId: clientUserId, email: 'client@test.com', rol: 'Client' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  adminToken = jwt.sign(
    { userId: adminUserId, email: 'admin@test.com', rol: 'Admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Users Service - Creación de Perfil', () => {

  describe('POST /userProfile/postUserProfile', () => {
    test('Debe crear un perfil de usuario con todos los campos válidos', async () => {
      const profileData = {
        userId: clientUserId,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        address: '123 Main St',
        city: 'New York',
        country: 'USA'
      };

      const response = await request(app)
        .post('/userProfile/postUserProfile')
        .send(profileData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.firstName).toBe(profileData.firstName);
      profileId = response.body._id;
    });

    test('No debe crear perfil sin campos obligatorios', async () => {
      const invalidData = {
        userId: clientUserId
        // Falta firstName y otros campos requeridos
      };

      await request(app)
        .post('/userProfile/postUserProfile')
        .send(invalidData)
        .expect(400);
    });

    test('No debe crear perfil duplicado para el mismo userId', async () => {
      const profileData = {
        userId: clientUserId,
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '+1234567890',
        address: '456 Oak St',
        city: 'Boston',
        country: 'USA'
      };

      await request(app)
        .post('/userProfile/postUserProfile')
        .send(profileData)
        .expect(409);
    });

    test('Debe crear perfil para el administrador', async () => {
      const adminProfileData = {
        userId: adminUserId,
        firstName: 'Admin',
        lastName: 'User',
        phone: '+9876543210',
        address: '789 Admin St',
        city: 'Washington',
        country: 'USA'
      };

      const response = await request(app)
        .post('/userProfile/postUserProfile')
        .send(adminProfileData)
        .expect(201);

      expect(response.body.firstName).toBe(adminProfileData.firstName);
    });
  });
});

describe('Users Service - Consulta de Perfiles', () => {

  describe('GET /userProfile/getUserProfile/:userId', () => {
    test('Cliente debe poder consultar su propio perfil', async () => {
      const response = await request(app)
        .get(`/userProfile/getUserProfile/${clientUserId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('firstName');
      expect(response.body.userId).toBe(clientUserId);
    });

    test('Admin debe poder consultar cualquier perfil', async () => {
      const response = await request(app)
        .get(`/userProfile/getUserProfile/${clientUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('firstName');
    });

    test('No debe consultar perfil sin autenticación', async () => {
      await request(app)
        .get(`/userProfile/getUserProfile/${clientUserId}`)
        .expect(401);
    });

    test('No debe consultar perfil con token inválido', async () => {
      await request(app)
        .get(`/userProfile/getUserProfile/${clientUserId}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
    });
  });

  describe('GET /userProfile/getAllUsersProfile', () => {
    test('Admin debe poder obtener todos los perfiles', async () => {
      const response = await request(app)
        .get('/userProfile/getAllUsersProfile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('Cliente no debe poder obtener todos los perfiles', async () => {
      await request(app)
        .get('/userProfile/getAllUsersProfile')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });

    test('No debe obtener perfiles sin autenticación', async () => {
      await request(app)
        .get('/userProfile/getAllUsersProfile')
        .expect(401);
    });
  });
});

describe('Users Service - Actualización de Perfiles', () => {

  describe('PUT /userProfile/putUserProfile/:userId', () => {
    test('Cliente debe poder actualizar su propio perfil', async () => {
      const updateData = {
        firstName: 'John Updated',
        phone: '+1111111111'
      };

      const response = await request(app)
        .put(`/userProfile/putUserProfile/${clientUserId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    test('Admin debe poder actualizar cualquier perfil', async () => {
      const updateData = {
        firstName: 'Updated by Admin'
      };

      const response = await request(app)
        .put(`/userProfile/putUserProfile/${clientUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    test('No debe actualizar perfil sin autenticación', async () => {
      await request(app)
        .put(`/userProfile/putUserProfile/${clientUserId}`)
        .send({ firstName: 'Test' })
        .expect(401);
    });

    test('No debe actualizar con datos inválidos', async () => {
      const invalidData = {
        phone: 'invalid-phone-format'
      };

      await request(app)
        .put(`/userProfile/putUserProfile/${clientUserId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(invalidData)
        .expect(400);
    });
  });
});

describe('Users Service - Subida de Avatar', () => {

  describe('POST /userProfile/uploadAvatar/:userId', () => {
    test('Cliente debe poder subir avatar con archivo válido', async () => {
      // Mock de archivo de imagen
      const mockImageBuffer = Buffer.from('fake-image-data');

      const response = await request(app)
        .post(`/userProfile/uploadAvatar/${clientUserId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .attach('avatar', mockImageBuffer, 'avatar.jpg')
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    test('No debe subir avatar sin autenticación', async () => {
      const mockImageBuffer = Buffer.from('fake-image-data');

      await request(app)
        .post(`/userProfile/uploadAvatar/${clientUserId}`)
        .attach('avatar', mockImageBuffer, 'avatar.jpg')
        .expect(401);
    });

    test('Admin debe poder subir avatar para cualquier usuario', async () => {
      const mockImageBuffer = Buffer.from('fake-image-data');

      const response = await request(app)
        .post(`/userProfile/uploadAvatar/${clientUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('avatar', mockImageBuffer, 'avatar.jpg')
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    test('No debe subir avatar sin archivo', async () => {
      await request(app)
        .post(`/userProfile/uploadAvatar/${clientUserId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(400);
    });
  });
});

describe('Users Service - Eliminación de Perfiles', () => {

  describe('DELETE /userProfile/deleteUserProfile/:userId', () => {
    test('Cliente no debe poder eliminar su perfil sin permisos apropiados', async () => {
      await request(app)
        .delete(`/userProfile/deleteUserProfile/${adminUserId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });

    test('No debe eliminar perfil sin autenticación', async () => {
      await request(app)
        .delete(`/userProfile/deleteUserProfile/${clientUserId}`)
        .expect(401);
    });

    test('Admin debe poder eliminar cualquier perfil', async () => {
      const response = await request(app)
        .delete(`/userProfile/deleteUserProfile/${clientUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    test('Cliente debe poder eliminar su propio perfil', async () => {
      // Crear un nuevo perfil para eliminarlo
      const newProfile = {
        userId: '507f1f77bcf86cd799439013',
        firstName: 'Temp',
        lastName: 'User',
        phone: '+5555555555',
        address: 'Temp St',
        city: 'TempCity',
        country: 'TempCountry'
      };

      await request(app)
        .post('/userProfile/postUserProfile')
        .send(newProfile);

      const tempToken = jwt.sign(
        { userId: newProfile.userId, email: 'temp@test.com', rol: 'Client' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .delete(`/userProfile/deleteUserProfile/${newProfile.userId}`)
        .set('Authorization', `Bearer ${tempToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });
});
