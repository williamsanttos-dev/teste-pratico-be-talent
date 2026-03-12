import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import { ProductService } from '#services/product_service'
import Product from '#models/product'

test.group('ProductService | update', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should update product name and amount', async ({ assert }) => {
    const product = await Product.create({
      name: 'Old Product',
      amount: 50,
    })

    const updatedData = {
      name: 'Updated Product',
      amount: 75.5,
    }

    const updated = await ProductService.update(updatedData, product.id.toString())

    assert.equal(updated.name, updatedData.name)
    assert.equal(updated.amount, updatedData.amount)

    const exists = await Product.find(product.id)
    assert.exists(exists)
    assert.equal(exists!.name, updatedData.name)
    assert.equal(exists!.amount, updatedData.amount)
  })

  test('should throw error if product does not exist', async ({ assert }) => {
    await assert.rejects(
      () => ProductService.update({ name: 'New Name' }, '99999'),
      'Product not found'
    )
  })

  test('should throw error if no fields provided', async ({ assert }) => {
    const product = await Product.create({
      name: 'Some Product',
      amount: 10,
    })

    await assert.rejects(
      () => ProductService.update({}, product.id.toString()),
      'At least one field must be updated'
    )
  })
})
