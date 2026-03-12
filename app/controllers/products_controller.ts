import { ProductService } from '#services/product_service'
import { createProductValidation, updateProductValidation } from '#validators/product'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProductsController {
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createProductValidation)

    const product = await ProductService.store(payload)

    return response.ok({
      data: product,
    })
  }
  async show({ params, response }: HttpContext) {
    const product = await ProductService.show(params.id)

    return response.ok({ data: product })
  }
  async index({ response }: HttpContext) {
    const products = await ProductService.index()
    return response.ok({ data: products })
  }
  async update({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateProductValidation)

    const product = await ProductService.update(payload, params.id)

    return response.ok({ data: product })
  }
  async destroy({ params, response }: HttpContext) {
    await ProductService.destroy(params.id)

    return response.noContent()
  }
}
