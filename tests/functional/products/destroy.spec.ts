import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import jwt from 'jsonwebtoken'

import User from '#models/user'
import Product from '#models/product'
import { UserRole } from '../../../app/enums/user_role.ts'
import env from '#start/env'

test.group('Products | destroy', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  const generateToken = (userId: number, role: UserRole) =>
    jwt.sign({ userId, role }, env.get('JWT_SECRET'), { expiresIn: '1h' })

  test('should delete product for ADMIN user', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@email.com',
      password: '12345678',
      role: UserRole.ADMIN,
    })
    const token = generateToken(admin.id, UserRole.ADMIN)

    const product = await Product.create({ name: 'To Be Deleted', amount: 100 })

    const response = await client
      .delete(`/api/v1/products/${product.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(204)

    const exists = await Product.find(product.id)
    assert.isNull(exists)
  })

  test('should return 404 if product does not exist', async ({ client }) => {
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin2@email.com',
      password: '12345678',
      role: UserRole.ADMIN,
    })
    const token = generateToken(admin.id, UserRole.ADMIN)

    const response = await client
      .delete('/api/v1/products/99999')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
    response.assertBodyContains({ message: 'Product not found' })
  })

  test('should return 401 if token is missing', async ({ client }) => {
    const product = await Product.create({ name: 'Product X', amount: 50 })

    const response = await client.delete(`/api/v1/products/${product.id}`)

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

    const product = await Product.create({ name: 'Product Y', amount: 50 })

    const response = await client
      .delete(`/api/v1/products/${product.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(403)
    response.assertBodyContains({ error: 'Insufficient permissions' })
  })
})
