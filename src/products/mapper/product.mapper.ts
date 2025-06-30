import { generateSKU } from "src/utils/generate-sku";
import { OptionValueDto, OptionDto, ProductVariantDto, SpecDto } from "../dto/create.product.dto";

export class ProductMapper {
  static mapOptionValues(values: OptionValueDto[]) {
    return values.map((value) => ({
      color: value.color ?? '',
      label: value.label ?? '',
      relativeImage: value.relativeImage ?? 0,
    }));
  }
  static mapOptions(options: OptionDto[]) {
    return options.map((option) => ({
      label: option.label ?? '',
      type: option.type ?? '',
      values: { create: this.mapOptionValues(option.values) },
    }));
  }
  static mapVariants(variants: ProductVariantDto[]) {
    return variants.map((variant, index) => ({
      name: variant.name,
      sku: generateSKU({productName: variant.name, options: variant.options, batch: index}),
      price: variant.price,
      discount: variant.discount,
      stock: variant.stock,
      images: variant.images,
      options: variant.options,
    }));
  }

  static mapSpecs(specs?: SpecDto[]) {
    if (!specs) return undefined;
    return {
      create: specs.map((spec) => ({ label: spec.label, value: spec.value })),
    };
  }
}