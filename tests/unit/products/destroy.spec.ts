import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import { ProductService } from '#services/product_service'
import Product from '#models/product'

test.group('ProductService | destroy', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should delete an existing product', async ({ assert }) => {
    const product = await Product.create({
      name: 'Product To Delete',
      amount: 100,
    })

    await ProductService.destroy(product.id.toString())

    const exists = await Product.find(product.id)
    assert.isNull(exists)
  })

  test('should throw error if product does not exist', async ({ assert }) => {
    await assert.rejects(() => ProductService.destroy('99999'), 'Product not found')
  })
})
