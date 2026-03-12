import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import jwt from 'jsonwebtoken'

import User from '#models/user'
import Product from '#models/product'
import { UserRole } from '../../../app/enums/user_role.ts'
import env from '#start/env'

test.group('Products | update', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  const generateToken = (userId: number, role: UserRole) =>
    jwt.sign({ userId, role }, env.get('JWT_SECRET'), { expiresIn: '1h' })

  test('should update product for ADMIN user', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@email.com',
      password: '12345678',
      role: UserRole.ADMIN,
    })
    const token = generateToken(admin.id, UserRole.ADMIN)

    const product = await Product.create({ name: 'Old Name', amount: 50.87 })

    const payload = { name: 'Updated Name', amount: 75.98 }

    const response = await client
      .patch(`/api/v1/products/${product.id}`)
      .header('Authorization', `Bearer ${token}`)
      .json(payload)

    response.assertStatus(200)

    const { data } = response.body()
    assert.equal(data.name, payload.name)
    assert.equal(data.amount, payload.amount)
  })

  test('should return 404 if product does not exist', async ({ client }) => {
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin2@email.com',
      password: '12345678',
      role: UserRole.ADMIN,
    })
    const token = generateToken(admin.id, UserRole.ADMIN)

    const payload = { name: 'Updated Name' }

    const response = await client
      .patch('/api/v1/products/99999')
      .header('Authorization', `Bearer ${token}`)
      .json(payload)

    response.assertStatus(404)
    response.assertBodyContains({ message: 'Product not found' })
  })

  test('should return 400 if no fields provided', async ({ client }) => {
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin3@email.com',
      password: '12345678',
      role: UserRole.ADMIN,
    })
    const token = generateToken(admin.id, UserRole.ADMIN)

    const product = await Product.create({ name: 'Old Name', amount: 50 })

    const response = await client
      .patch(`/api/v1/products/${product.id}`)
      .header('Authorization', `Bearer ${token}`)
      .json({}) // nenhum campo

    response.assertStatus(400)
    response.assertBodyContains({ message: 'At least one field must be updated' })
  })

  test('should return 401 if token is missing', async ({ client }) => {
    const product = await Product.create({ name: 'Old Name', amount: 50 })

    const response = await client.patch(`/api/v1/products/${product.id}`).json({ name: 'New Name' })

    response.assertStatus(401)
    response.assertBodyContains({ error: 'Token missing' })
  })

  test('should return 403 if user role is insufficient', async ({ client }) => {
    const user = await User.create({
      fullName: 'Regular User',
      email: 'user@email.com',
      password: '12345678',
      role: UserRole.USER,
    })
    const token = generateToken(user.id, UserRole.USER)

    const product = await Product.create({ name: 'Old Name', amount: 50 })

    const response = await client
      .patch(`/api/v1/products/${product.id}`)
      .header('Authorization', `Bearer ${token}`)
      .json({ name: 'New Name' })

    response.assertStatus(403)
    response.assertBodyContains({ error: 'Insufficient permissions' })
  })
})
