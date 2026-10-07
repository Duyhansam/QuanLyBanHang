package com.kanza.store.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.kanza.store.entity.Product;
import com.kanza.store.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public List<Product> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword.trim());
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category.trim().toUpperCase());
    }

    public List<Product> getSaleProducts() {
        return productRepository.findByOriginalPriceNotNull();
    }
}