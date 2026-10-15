package com.kanza.store.product;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductSizeStockRepository extends JpaRepository<ProductSizeStock, Long> {

    List<ProductSizeStock> findByProductId(Long productId);

    Optional<ProductSizeStock> findByProductIdAndShoeSize(Long productId, String shoeSize);

    boolean existsByProductId(Long productId);

    // Các sản phẩm ĐANG quản lý tồn kho mà tổng số lượng mọi size = 0 (hết sạch hàng)
    @Query("select s.productId from ProductSizeStock s group by s.productId having sum(s.quantity) = 0")
    List<Long> findSoldOutProductIds();

    void deleteByProductId(Long productId);

    // Trừ kho trong 1 câu UPDATE duy nhất và chỉ trừ khi còn đủ hàng.
    // Hai người cùng mua món cuối cùng thì chỉ một người trừ được (trả về 1), người kia nhận 0.
    @Modifying
    @Query("update ProductSizeStock s set s.quantity = s.quantity - :qty "
            + "where s.productId = :productId and s.shoeSize = :sz and s.quantity >= :qty")
    int decrease(@Param("productId") Long productId, @Param("sz") String sz, @Param("qty") int qty);

    // Cộng lại kho khi đơn bị hủy
    @Modifying
    @Query("update ProductSizeStock s set s.quantity = s.quantity + :qty "
            + "where s.productId = :productId and s.shoeSize = :sz")
    int increase(@Param("productId") Long productId, @Param("sz") String sz, @Param("qty") int qty);
}
