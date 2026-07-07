import { Link } from 'react-router-dom';
import {
  getProductImage,
  getLowestPrice,
  getTotalStock,
  getProductPlatforms,
} from '../utils';
import { formatCurrency } from '../../utils/formatters';

function formatCondition(condition) {
  if (!condition) return null;
  return condition
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function ProductCard({ product }) {
  const image = getProductImage(product);
  const price = getLowestPrice(product);
  const inStock = getTotalStock(product) > 0;
  const platforms = getProductPlatforms(product);

  return (
    <Link
      to={`/product/${product.id}`}
      className="store-product-card group block"
    >
      <div className="store-product-card__media">
        {image ? (
          <img
            src={image}
            alt={product.title}
            className="store-product-card__image"
          />
        ) : (
          <div className="store-product-card__image flex items-center justify-center text-gray-500 text-sm">
            No Image
          </div>
        )}
      </div>

      {product.isFlashSale && (
        <span className="store-product-card__sale-badge">Sale</span>
      )}

      {platforms.length > 0 && (
        <div className="store-product-card__platforms">
          {platforms.map((platform) => (
            <span key={platform} className="store-product-card__platform-badge">
              {platform}
            </span>
          ))}
        </div>
      )}

      <div className="store-product-card__overlay">
        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">
          {product.title}
        </h3>
        {product.condition && (
          <p className="text-xs text-white/80 mt-1 capitalize">
            {formatCondition(product.condition)}
          </p>
        )}
        <p className="text-base font-bold text-white mt-1.5">
          {formatCurrency(price)}
        </p>
      </div>

      {!inStock && (
        <div className="absolute inset-0 z-20 bg-[#08050f]/80 flex items-center justify-center rounded-[inherit]">
          <span className="px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded-full border border-white/10">
            Out of Stock
          </span>
        </div>
      )}
    </Link>
  );
}

export default ProductCard;
