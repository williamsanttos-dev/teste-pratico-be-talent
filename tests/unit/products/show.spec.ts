import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import { ProductService } from '#services/product_service'
import Product from '#models/product'

test.group('ProductService | show', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should return a product when it exists', async ({ assert }) => {
    const product = await Product.create({
      name: 'Existing Product',
      amount: 123.45,
    })

    const found = await ProductService.show(product.id.toString())

    assert.exists(found)
    assert.equal(found.id, product.id)
    assert.equal(found.name, product.name)
    assert.equal(found.amount, product.amount)
  })

  test('should throw an exception when product does not exist', async ({ assert }) => {
    await assert.rejects(() => ProductService.show('99999'), 'Product not found')
  })
})
