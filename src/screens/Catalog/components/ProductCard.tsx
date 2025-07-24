import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { productStyles } from "../styles";
import { AvailableProduct } from "../../../constants/products";

interface ProductCardProps {
  product: AvailableProduct;
  onAddToCart: (product: AvailableProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <View style={productStyles.productCard}>
      <View style={productStyles.productImage} />
      <Text style={productStyles.productBrand}>Productos Beland</Text>
      <Text style={productStyles.productName}>{product.name}</Text>
      <Text style={productStyles.productCategory}>{product.category}</Text>
      <View style={productStyles.productPriceRow}>
        <Text style={productStyles.productPrice}>
          {formatPrice(product.basePrice)}
        </Text>
        <TouchableOpacity
          style={productStyles.addToCartButton}
          onPress={() => onAddToCart(product)}
        >
          <Text style={productStyles.addToCartText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
