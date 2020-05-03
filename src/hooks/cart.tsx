import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const response = await AsyncStorage.getItem('@GoMarketplace:cart');
      if (response) {
        setProducts(JSON.parse(response));
      }
    }

    loadProducts();
  }, [products, setProducts]);

  const addToCart = useCallback(
    async product => {
      const productIndex = products.findIndex(
        oldProduct => oldProduct.id === product.id,
      );

      if (productIndex !== -1) {
        const newProducts = products;
        newProducts[productIndex].quantity =
          products[productIndex].quantity + 1;

        setProducts(newProducts);

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(newProducts),
        );
      } else {
        const newProduct = product;
        newProduct.quantity = 1;

        setProducts([...products, newProduct]);

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify([...products, newProduct]),
        );
      }
      // await AsyncStorage.removeItem('@GoMarketplace:cart');
      // setProducts([]);
    },
    [products, setProducts],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product,
      );

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(newProducts),
      );
    },
    [products, setProducts],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(
        oldProduct => oldProduct.id === id,
      );

      const newProducts = products;

      if (products[productIndex].quantity === 1) {
        newProducts.splice(productIndex);
      } else {
        newProducts[productIndex].quantity =
          products[productIndex].quantity - 1;
      }

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(newProducts),
      );
    },
    [products, setProducts],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
