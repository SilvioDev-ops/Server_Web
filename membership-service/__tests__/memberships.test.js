import request from 'supertest';
import app from '../src/app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Cargar variables de entorno de prueba
dotenv.config({ path: '.env.test' });

let clientToken = '';
let adminToken = '';
let clientUserId = '507f1f77bcf86cd799439011'; // ID de prueba
let adminUserId = '507f1f77bcf86cd799439012'; // ID de prueba
let planId = '';
let membershipId = '';

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

describe('Membership Service - Planes de Membresía', () => {

  describe('POST /memberships/membership-plans', () => {
    test('Admin debe poder crear un plan de membresía', async () => {
      const planData = {
        name: 'Plan Básico',
        description: 'Plan de membresía básico',
        price: 99.99,
        duration: 30,
        features: ['Feature 1', 'Feature 2']
      };

      const response = await request(app)
        .post('/memberships/membership-plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(planData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(planData.name);
      planId = response.body._id;
    });

    test('Cliente no debe poder crear un plan de membresía', async () => {
      const planData = {
        name: 'Plan Premium',
        description: 'Plan premium',
        price: 199.99,
        duration: 30
      };

      await request(app)
        .post('/memberships/membership-plans')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(planData)
        .expect(403);
    });

    test('No debe crear plan sin autenticación', async () => {
      const planData = {
        name: 'Plan Test',
        price: 99.99
      };

      await request(app)
        .post('/memberships/membership-plans')
        .send(planData)
        .expect(401);
    });
  });

  describe('GET /memberships/membership-plans', () => {
    test('Cliente debe poder listar planes de membresía', async () => {
      const response = await request(app)
        .get('/memberships/membership-plans')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Admin debe poder listar planes de membresía', async () => {
      const response = await request(app)
        .get('/memberships/membership-plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('No debe listar planes sin autenticación', async () => {
      await request(app)
        .get('/memberships/membership-plans')
        .expect(401);
    });
  });

  describe('PUT /memberships/membership-plans/:planId', () => {
    test('Admin debe poder actualizar un plan de membresía', async () => {
      const updateData = {
        name: 'Plan Básico Actualizado',
        price: 89.99
      };

      const response = await request(app)
        .put(`/memberships/membership-plans/${planId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    test('Cliente no debe poder actualizar un plan', async () => {
      await request(app)
        .put(`/memberships/membership-plans/${planId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ price: 99.99 })
        .expect(403);
    });
  });

  describe('DELETE /memberships/membership-plans/:planId', () => {
    test('Cliente no debe poder eliminar un plan', async () => {
      await request(app)
        .delete(`/memberships/membership-plans/${planId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });
  });
});

describe('Membership Service - Gestión de Membresías', () => {

  describe('POST /memberships/memberships', () => {
    test('Cliente debe poder crear una membresía con payload válido', async () => {
      const membershipData = {
        planId: planId,
        userId: clientUserId
      };

      const response = await request(app)
        .post('/memberships/memberships')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(membershipData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      membershipId = response.body._id;
    });

    test('No debe crear membresía con payload inválido', async () => {
      const invalidData = {
        planId: 'invalid-id'
      };

      await request(app)
        .post('/memberships/memberships')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(invalidData)
        .expect(400);
    });

    test('No debe crear membresía sin autenticación', async () => {
      await request(app)
        .post('/memberships/memberships')
        .send({ planId: planId })
        .expect(401);
    });

    test('Admin no debe poder crear membresía (solo Client)', async () => {
      const membershipData = {
        planId: planId,
        userId: adminUserId
      };

      await request(app)
        .post('/memberships/memberships')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(membershipData)
        .expect(403);
    });
  });

  describe('GET /memberships/my-memberships', () => {
    test('Cliente debe poder consultar sus membresías', async () => {
      const response = await request(app)
        .get('/memberships/my-memberships')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('No debe consultar membresías sin autenticación', async () => {
      await request(app)
        .get('/memberships/my-memberships')
        .expect(401);
    });
  });

  describe('GET /memberships/all-memberships', () => {
    test('Admin debe poder consultar todas las membresías', async () => {
      const response = await request(app)
        .get('/memberships/all-memberships')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Cliente no debe poder consultar todas las membresías', async () => {
      await request(app)
        .get('/memberships/all-memberships')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });
  });

  describe('GET /memberships/membership-history', () => {
    test('Cliente debe poder consultar su historial de membresías', async () => {
      const response = await request(app)
        .get('/memberships/membership-history')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    test('Admin debe poder consultar historial', async () => {
      const response = await request(app)
        .get('/memberships/membership-history')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('POST /memberships/memberships/:membershipId/renew', () => {
    test('Cliente debe poder renovar su membresía', async () => {
      const response = await request(app)
        .post(`/memberships/memberships/${membershipId}/renew`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    test('No debe renovar membresía sin autenticación', async () => {
      await request(app)
        .post(`/memberships/memberships/${membershipId}/renew`)
        .expect(401);
    });
  });

  describe('PUT /memberships/memberships/:membershipId/suspend', () => {
    test('Admin debe poder suspender una membresía', async () => {
      const response = await request(app)
        .put(`/memberships/memberships/${membershipId}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    test('Cliente no debe poder suspender membresía', async () => {
      await request(app)
        .put(`/memberships/memberships/${membershipId}/suspend`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });
  });

  describe('DELETE /memberships/memberships/:membershipId', () => {
    test('Cliente debe poder cancelar su membresía', async () => {
      const response = await request(app)
        .delete(`/memberships/memberships/${membershipId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    test('No debe cancelar membresía sin autenticación', async () => {
      await request(app)
        .delete(`/memberships/memberships/${membershipId}`)
        .expect(401);
    });
  });
});
