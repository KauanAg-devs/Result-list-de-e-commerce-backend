import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductGroupedDto } from './dto/create.product.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}


  //@UseGuards(AuthGuard)
  @Post('create')
  async create(@Body() createProductDTO: ProductGroupedDto){
    return this.productsService.create(createProductDTO)
  }
}
