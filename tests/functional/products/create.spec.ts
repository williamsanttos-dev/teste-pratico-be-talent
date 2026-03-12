import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import jwt from 'jsonwebtoken'

import User from '#models/user'
import { UserRole } from '../../../app/enums/user_role.ts'
import env from '#start/env'

test.group('Products | store', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  const generateToken = (userId: number, role: UserRole) =>
    jwt.sign({ userId, role }, env.get('JWT_SECRET'), { expiresIn: '1h' })

  test('should create a product with ADMIN role', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@email.com',
      password: '12345678',
      role: UserRole.ADMIN,
    })

    const token = generateToken(admin.id, UserRole.ADMIN)

    const payload = {
      name: 'Product A',
      amount: 99.99,
    }

    const response = await client
      .post('/api/v1/products')
      .header('Authorization', `Bearer ${token}`)
      .json(payload)

    response.assertStatus(200)

    const { data }: any = response.body()
    assert.equal(data.name, payload.name)
    assert.equal(data.amount, payload.amount)
    assert.exists(data.id)
  })

  test('should forbid creation with non-ADMIN role', async ({ client }) => {
    const user = await User.create({
      fullName: 'Regular User',
      email: 'user@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    const token = generateToken(user.id, UserRole.USER)

    const payload = {
      name: 'Product B',
      amount: 49.99,
    }

    const response = await client
      .post('/api/v1/products')
      .header('Authorization', `Bearer ${token}`)
      .json(payload)

    response.assertStatus(403)
    response.assertBodyContains({
      error: 'Insufficient permissions',
    })
  })

  test('should reject creation without token', async ({ client }) => {
    const payload = {
      name: 'Product C',
      amount: 10,
    }

    const response = await client.post('/api/v1/products').json(payload)

    response.assertStatus(401)
    response.assertBodyContains({
      error: 'Token missing',
    })
  })

  test('should reject creation with invalid payload', async ({ client }) => {
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin2@email.com',
      password: '12345678',
      role: UserRole.ADMIN,
    })

    const token = generateToken(admin.id, UserRole.ADMIN)

    const invalidPayload = {
      amount: 100,
    }

    const response = await client
      .post('/api/v1/products')
      .header('Authorization', `Bearer ${token}`)
      .json(invalidPayload)

    response.assertStatus(422)
  })
})
