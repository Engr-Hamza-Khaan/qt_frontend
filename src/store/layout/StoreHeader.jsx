import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, LogIn, Heart, Shirt, ChevronRight, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import BrandLogo from '../../components/ui/BrandLogo';
import { STORE_NAV } from '../config/navigation';
import SearchBar from '../components/SearchBar';

function DesktopNavItem({ item, active, onNavigate }) {
  const [openSubmenu, setOpenSubmenu] = useState(null);

  if (item.isCenterLogo) {
    return (
      <Link
        to={item.to || '/'}
        className="store-nav-center-item group shrink-0 mx-0.5 sm:mx-1 focus:outline-none"
        aria-label="Quick Turn Home"
        onClick={onNavigate}
      >
        <div className="store-nav-center-emblem relative flex items-center justify-center p-0.5 sm:p-1">
          <img
            src={item.iconOutline || '/Icons/QT Icon.png'}
            alt="Quick Turn"
            className="h-9 sm:h-10 md:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] group-hover:drop-shadow-[0_0_16px_rgba(140,180,255,0.85)]"
          />
        </div>
      </Link>
    );
  }

  const iconSrc = active
    ? item.iconFilled || item.iconOutline
    : item.iconOutline;

  const iconElement = (
    <div
      className={`store-nav-item-inner group flex flex-col items-center justify-center gap-0.5 px-2 sm:px-2.5 py-1 rounded-2xl transition-all duration-200 ${
        active ? 'store-nav-item-inner--active' : 'store-nav-item-inner--default'
      }`}
    >
      <div className="relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7">
        {item.iconName === 'Shirt' ? (
          <Shirt
            className={`w-5 h-5 sm:w-6 sm:h-6 object-contain transition-all duration-200 group-hover:scale-105 ${
              active
                ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                : 'text-gray-300 opacity-90 group-hover:opacity-100 group-hover:text-white group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]'
            }`}
          />
        ) : (
          <img
            src={iconSrc}
            alt={item.label}
            className={`w-6 h-6 sm:w-7 sm:h-7 object-contain transition-all duration-200 group-hover:scale-105 ${
              active
                ? 'brightness-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                : 'brightness-95 opacity-90 group-hover:opacity-100 group-hover:brightness-110 drop-shadow-[0_0_4px_rgba(255,255,255,0.2)]'
            }`}
          />
        )}
      </div>
      <span className="store-nav-label">{item.label}</span>
    </div>
  );

  if (item.dropdown) {
    return (
      <div className="store-nav-item-wrap relative shrink-0">
        {item.to ? (
          <Link to={item.to} className="block group focus:outline-none" aria-label={item.label} onClick={onNavigate}>
            {iconElement}
          </Link>
        ) : (
          <button
            type="button"
            className="block group focus:outline-none"
            aria-haspopup="true"
            aria-expanded="false"
            aria-label={item.label}
          >
            {iconElement}
          </button>
        )}
        <div className="store-nav-dropdown" role="menu">
          {item.dropdown.map((sub) => {
            if (sub.children && sub.children.length > 0) {
              const isSubOpen = openSubmenu === sub.label;
              return (
                <div
                  key={sub.label}
                  className="relative group/nested"
                  onMouseEnter={() => setOpenSubmenu(sub.label)}
                  onMouseLeave={() => setOpenSubmenu(null)}
                >
                  <div className="flex items-center justify-between store-nav-dropdown-link cursor-pointer">
                    <Link
                      to={sub.to}
                      role="menuitem"
                      className="flex-1 text-inherit"
                      onClick={onNavigate}
                    >
                      {sub.label}
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenSubmenu(isSubOpen ? null : sub.label);
                      }}
                      className="p-1 text-gray-400 group-hover/nested:text-cyan-300 transition-colors"
                      aria-label={`Toggle ${sub.label} submenu`}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div
                    className={`store-nav-nested-box ${
                      isSubOpen ? 'opacity-100 visible translate-x-0 pointer-events-auto' : ''
                    }`}
                    role="menu"
                  >
                    <div className="px-3 py-1.5 mb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/10">
                      {sub.label}
                    </div>
                    {sub.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.to}
                        role="menuitem"
                        className="store-nav-dropdown-link"
                        onClick={() => {
                          setOpenSubmenu(null);
                          onNavigate();
                        }}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={sub.label}
                to={sub.to}
                role="menuitem"
                className="store-nav-dropdown-link"
                onClick={onNavigate}
              >
                {sub.label}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Link to={item.to} className="shrink-0 block group focus:outline-none" aria-label={item.label} onClick={onNavigate}>
      {iconElement}
    </Link>
  );
}

function MobileDropdownItem({ sub, onNavigate }) {
  const [subOpen, setSubOpen] = useState(false);

  if (sub.children && sub.children.length > 0) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between rounded-xl hover:bg-white/5 transition">
          <Link
            to={sub.to}
            className="flex-1 px-3 py-2 text-xs sm:text-sm text-gray-300 hover:text-blue-400 transition font-medium"
            onClick={onNavigate}
          >
            {sub.label}
          </Link>
          <button
            type="button"
            onClick={() => setSubOpen(!subOpen)}
            className="p-2 text-gray-400 hover:text-white transition"
            aria-label={`Toggle ${sub.label}`}
          >
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${subOpen ? 'rotate-90 text-cyan-300' : ''}`} />
          </button>
        </div>

        {subOpen && (
          <div className="pl-4 space-y-1 border-l border-cyan-400/30 ml-3 animate-fade-in">
            {sub.children.map((child) => (
              <Link
                key={child.label}
                to={child.to}
                className="block px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition"
                onClick={onNavigate}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={sub.to}
      className="block px-3 py-2 rounded-xl text-xs sm:text-sm text-gray-300 hover:text-blue-400 hover:bg-white/5 transition"
      onClick={onNavigate}
    >
      {sub.label}
    </Link>
  );
}

function MobileNavSection({ item, active, onNavigate }) {
  const [expanded, setExpanded] = useState(false);

  if (item.isCenterLogo) {
    return (
      <Link
        key={item.id}
        to={item.to || '/'}
        className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition mb-2"
        onClick={onNavigate}
      >
        <img
          src={item.iconOutline || '/Icons/QT Icon.png'}
          alt="Home"
          className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
        />
        <span className="text-sm font-semibold text-white">Home</span>
      </Link>
    );
  }

  const iconSrc = active
    ? item.iconFilled || item.iconOutline
    : item.iconOutline;

  const renderIcon = (isLarge = false) => {
    const sizeCls = isLarge ? 'w-6 h-6' : 'w-5 h-5';
    if (item.iconName === 'Shirt') {
      return <Shirt className={`${sizeCls} shrink-0 ${active ? 'text-cyan-300' : 'text-gray-400 group-hover:text-white'}`} />;
    }
    return <img src={iconSrc} alt={item.label} className={`${sizeCls} object-contain shrink-0`} />;
  };

  if (item.dropdown) {
    return (
      <div key={item.id} className="space-y-1">
        <div className="flex items-center justify-between rounded-xl hover:bg-white/5 transition">
          {item.to ? (
            <Link
              to={item.to}
              className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                active
                  ? 'bg-blue-600/20 text-white border border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={onNavigate}
            >
              {renderIcon(true)}
              <span>{item.label}</span>
            </Link>
          ) : (
            <div className="flex-1 flex items-center gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {renderIcon(false)}
              <span>{item.label}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-2.5 text-gray-400 hover:text-white transition"
            aria-label={`Toggle ${item.label} menu`}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180 text-cyan-300' : ''}`} />
          </button>
        </div>

        {expanded && (
          <div className="pl-6 space-y-1 border-l border-white/10 ml-4 animate-fade-in">
            {item.dropdown.map((sub) => (
              <MobileDropdownItem key={sub.label} sub={sub} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      key={item.id}
      to={item.to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
        active
          ? 'bg-blue-600/20 text-white border border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
          : 'text-gray-300 hover:text-white hover:bg-white/5'
      }`}
      onClick={onNavigate}
    >
      {renderIcon(true)}
      <span>{item.label}</span>
    </Link>
  );
}

function StoreHeader({ embedded = false }) {
  const { itemCount, setIsOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  const isItemActive = (item) => {
    if (item.isActive) return item.isActive(location);
    if (item.to) return location.pathname + location.search === item.to;
    return false;
  };

  const closeMenus = () => {
    setMobileOpen(false);
    setSearchOpen(false);
  };

  return (
    <header className={`sticky top-0 z-[100] overflow-visible ${embedded ? '' : 'bg-[#050c38]'}`}>
      <div className={`px-4 sm:px-6 lg:px-8 pt-4 overflow-visible ${embedded ? 'pb-2' : 'pb-4 lg:pb-6'}`}>
        <div className="max-w-7xl mx-auto overflow-visible store-header-shell">
          <div className="flex items-center justify-between gap-2 sm:gap-4 overflow-visible">
            <Link to="/" className="shrink-0 flex items-center gap-2 sm:gap-2.5 group" onClick={closeMenus} aria-label="Quick Turn Home">
              <img
                src="/logo(white).png"
                alt="Quick Turn Logo"
                className="h-8 sm:h-9 md:h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(75,125,255,0.4)] group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col justify-center">
                <span className="font-outfit font-black text-sm sm:text-base md:text-lg text-white tracking-wider uppercase leading-none group-hover:text-blue-200 transition-colors">
                  QUICK TURN
                </span>
                <span className="text-[7.5px] sm:text-[8.5px] md:text-[9px] text-gray-300 tracking-wider font-medium leading-tight mt-0.5 whitespace-nowrap">
                  Where Deals Turn Right.
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex flex-1 justify-center min-w-0 px-2">
              <nav className="store-navbar w-fit px-3 py-1.5">
                <div className="store-nav-items">
                  {STORE_NAV.map((item) => (
                    <DesktopNavItem
                      key={item.id}
                      item={item}
                      active={isItemActive(item)}
                      onNavigate={closeMenus}
                    />
                  ))}
                </div>
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setSearchOpen((o) => !o)}
                className={`p-2 sm:p-2.5 rounded-full transition ${
                  searchOpen
                    ? 'text-blue-400 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                    : 'text-gray-200 hover:text-white hover:bg-white/10'
                }`}
                aria-label="Search"
                title="Search products (Ctrl+K)"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="relative p-2 sm:p-2.5 rounded-full text-gray-200 hover:text-white hover:bg-white/10 transition"
                aria-label="Cart"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(37,99,235,0.6)]">
                    {itemCount}
                  </span>
                )}
              </button>

              <Link
                to="/admin/login"
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#0a1548] border border-blue-400/30 hover:border-blue-400/60 hover:bg-[#102066] transition shadow-[0_0_15px_rgba(30,80,220,0.2)]"
              >
                Sign In
              </Link>

              <button
                type="button"
                className="lg:hidden p-2 rounded-full text-gray-200 hover:text-white hover:bg-white/10 transition"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Prominent Real-time Search Bar Dropdown Shell */}
          {searchOpen && (
            <div className="mt-3 animate-fade-in">
              <SearchBar onCloseMobile={() => setSearchOpen(false)} />
            </div>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden px-4 sm:px-6 lg:px-8 pb-4 animate-fade-in">
          <div className="max-w-7xl mx-auto p-4 store-glass-panel space-y-3 max-h-[80vh] overflow-y-auto">
            {/* Prominent Search on Mobile Menu */}
            <div className="pb-2">
              <SearchBar onCloseMobile={closeMenus} />
            </div>

            {STORE_NAV.map((item) => (
              <MobileNavSection
                key={item.id}
                item={item}
                active={isItemActive(item)}
                onNavigate={closeMenus}
              />
            ))}

            <div className="pt-3 mt-2 border-t border-white/10 space-y-2">
              <Link
                to="/wishlist"
                onClick={closeMenus}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition"
              >
                <span className="flex items-center gap-3">
                  <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-rose-400 fill-rose-500/20' : ''}`} />
                  Wishlist
                </span>
                {wishlistCount > 0 && (
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/admin/login"
                onClick={closeMenus}
                className="store-btn-primary w-full justify-center px-4 py-2.5 text-sm normal-case tracking-normal font-semibold"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default StoreHeader;
