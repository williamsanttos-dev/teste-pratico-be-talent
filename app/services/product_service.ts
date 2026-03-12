import Product from '#models/product'
import type { CreateProductData, UpdateProductData } from '#validators/product'
import { Exception } from '@adonisjs/core/exceptions'

export class ProductService {
  static async store(data: CreateProductData) {
    return await Product.create(data)
  }
  static async show(id: string) {
    const product = await Product.find(id)
    if (!product)
      throw new Exception('Product not found', {
        status: 404,
      })
    return product
  }
  static async index() {
    return await Product.all()
  }
  static async update(data: UpdateProductData, id: string) {
    if (
      (data.amount === undefined || data.amount === null) &&
      (!data.name || data.name.trim() === '')
    ) {
      throw new Exception('At least one field must be updated', { status: 400 })
    }

    const product = await Product.find(id)
    if (!product)
      throw new Exception('Product not found', {
        status: 404,
      })

    product.merge(data)
    await product.save()

    return product
  }
  static async destroy(id: string) {
    const product = await Product.find(id)
    if (!product)
      throw new Exception('Product not found', {
        status: 404,
      })

    await product.delete()
    return
  }
}
