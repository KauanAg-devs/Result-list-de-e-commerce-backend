import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductGroupedDto } from './dto/create.product.dto';
import { ProductMapper } from './mapper/product.mapper';
import { generateSKU } from 'src/utils/generate-sku';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByOwnerID(ownerId: number) {
    return this.prisma.product.findMany({
      where: {
        ownerId,
      },
      include: {
        variants: true,
        options: true,
        specs: true,
      },
    });
  }

  async findVariant(sku: string) {
    return this.prisma.variant.findUnique({
      where: { sku },
    });
  }

  async getByPagination(
    lastProductReceived?: string,
    productsPerPage: number = 4,
  ) {
    return this.prisma.product.findMany({
      take: productsPerPage,
      skip: lastProductReceived ? 1 : 0,
      cursor: lastProductReceived ? { id: lastProductReceived } : undefined,
      orderBy: {
        id: 'asc',
      },
      include: {
        variants: true,
        options: true,
        specs: true,
      },
    });
  }

  async create(product: ProductGroupedDto) {
    const defaultSku = generateSKU({
     productName: product.default.name,
     options: product.default.options,
     batch: 0,
   } );

    const defaultVariant = await this.prisma.variant.create({
      data: {
        name: product.default.name,
        sku: defaultSku,
        price: product.default.price,
        discount: product.default.discount,
        stock: product.default.stock,
        images: product.default.images,
        options: product.default.options,
      },
    });

    const otherVariants = product.variants.map((variant, index) => {
      const sku = generateSKU({productName: variant.name, options: variant.options, batch: index + 1}); 
      return {
        name: variant.name,
        sku,
        price: variant.price,
        discount: variant.discount,
        stock: variant.stock,
        images: variant.images,
        options: variant.options,
      };
    });

    const createdProduct = await this.prisma.product.create({
      data: {
        ownerId: product.ownerId,
        default: { connect: { id: defaultVariant.id } },
        options: { create: ProductMapper.mapOptions(product.options) },
        specs: ProductMapper.mapSpecs(product.specs),
        variants: { create: otherVariants },
      },
      include: {
        variants: true,
        options: { include: { values: true } },
        specs: true,
      },
    });

    return createdProduct;
  }
}
