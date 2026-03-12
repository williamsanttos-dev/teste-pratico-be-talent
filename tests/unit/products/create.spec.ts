import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import { ProductService } from '#services/product_service'
import Product from '#models/product'

test.group('ProductService | store', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should create a product with valid data', async ({ assert }) => {
    const data = {
      name: 'Product A',
      amount: 199.99,
    }

    const product = await ProductService.store(data)

    assert.exists(product.id)
    assert.equal(product.name, data.name)
    assert.equal(product.amount, data.amount)

    const exists = await Product.find(product.id)
    assert.exists(exists)
    assert.equal(exists!.name, data.name)
    assert.equal(exists!.amount, data.amount)
  })
})
