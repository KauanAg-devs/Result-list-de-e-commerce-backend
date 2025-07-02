import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductGroupedDto } from './dto/create.product.dto';
import { AuthGuard } from '@nestjs/passport';
import { ProductPaginationDTO } from './dto/product.pagination.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  //@UseGuards(AuthGuard)
  @Post('create')
  async create(@Body() createProductDTO: ProductGroupedDto) {
    return this.productsService.create(createProductDTO);
  }

  @Post('getByPagination')
  async getByPagination(@Body() productPaginationDTO: ProductPaginationDTO) {
    const { productsPerPage, lastProductReceived } = productPaginationDTO;
    const paginatedProducts = await this.productsService.getByPagination(lastProductReceived, productsPerPage);
    console.log(paginatedProducts);
    
    return paginatedProducts
  }

  @Post('findVariantBySKU')
  async findVariantBySKU(@Body() {sku}: {sku: string}){
    return this.productsService.findVariant(sku)
  }
}
