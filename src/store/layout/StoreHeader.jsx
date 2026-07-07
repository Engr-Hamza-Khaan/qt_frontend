import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, LogIn } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import BrandLogo from '../../components/ui/BrandLogo';
import { STORE_NAV } from '../config/navigation';

function NavIconButton({ active, children, title }) {
  return (
    <span
      className={`store-nav-icon-btn ${active ? 'store-nav-icon-btn--active' : 'store-nav-icon-btn--default'}`}
      title={title}
    >
      {children}
    </span>
  );
}

function DesktopNavItem({ item, active, onNavigate }) {
  const Icon = item.icon;

  if (item.dropdown) {
    const iconContent = (
      <NavIconButton active={active} title={item.label}>
        <Icon className="w-[1.15rem] h-[1.15rem]" strokeWidth={2.25} />
        <span className="store-nav-label">{item.label}</span>
      </NavIconButton>
    );

    return (
      <div className="store-nav-item-wrap relative shrink-0">
        {item.to ? (
          <Link to={item.to} className="block" aria-label={item.label} onClick={onNavigate}>
            {iconContent}
          </Link>
        ) : (
          <button
            type="button"
            className="block"
            aria-haspopup="true"
            aria-expanded="false"
            aria-label={item.label}
          >
            {iconContent}
          </button>
        )}
        <div className="store-nav-dropdown" role="menu">
          {item.dropdown.map((sub) => (
            <Link
              key={sub.label}
              to={sub.to}
              role="menuitem"
              className="store-nav-dropdown-link"
              onClick={onNavigate}
            >
              {sub.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Link to={item.to} className="shrink-0" aria-label={item.label} onClick={onNavigate}>
      <NavIconButton active={active} title={item.label}>
        <Icon className="w-[1.15rem] h-[1.15rem]" strokeWidth={2.25} />
        <span className="store-nav-label">{item.label}</span>
      </NavIconButton>
    </Link>
  );
}

function MobileNavSection({ item, active, onNavigate }) {
  const Icon = item.icon;

  if (item.dropdown) {
    return (
      <div key={item.id}>
        {item.to ? (
          <Link
            to={item.to}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              active
                ? 'bg-neon-purple/15 text-neon-purple border border-neon-purple/35'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
            onClick={onNavigate}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {item.label}
          </Link>
        ) : (
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <Icon className="w-3.5 h-3.5" />
            {item.label}
          </p>
        )}
        {item.dropdown.map((sub) => (
          <Link
            key={sub.label}
            to={sub.to}
            className="block px-3 py-2.5 ml-3 rounded-xl text-sm text-gray-300 hover:text-neon-purple hover:bg-white/5"
            onClick={onNavigate}
          >
            {sub.label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <Link
      key={item.id}
      to={item.to}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
        active
          ? 'bg-neon-purple/15 text-neon-purple border border-neon-purple/35'
          : 'text-gray-300 hover:text-white hover:bg-white/5'
      }`}
      onClick={onNavigate}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {item.label}
    </Link>
  );
}

function StoreHeader({ embedded = false }) {
  const { itemCount, setIsOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const isItemActive = (item) => {
    if (item.isActive) return item.isActive(location);
    if (item.to) return location.pathname + location.search === item.to;
    return false;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileOpen(false);
    }
  };

  const closeMenus = () => setMobileOpen(false);

  return (
    <header className={`sticky top-0 z-[100] overflow-visible ${embedded ? '' : 'bg-[#08050f]'}`}>
      <div className={`px-4 sm:px-6 lg:px-8 pt-4 overflow-visible ${embedded ? 'pb-2' : 'pb-4 lg:pb-6'}`}>
        <div className="max-w-7xl mx-auto overflow-visible store-header-shell">
          <div className="flex items-center gap-2 sm:gap-3 overflow-visible">
            <Link to="/" className="shrink-0 min-w-0 lg:hidden">
              <BrandLogo
                variant="white"
                logoSize="sm"
                showSubtitle={false}
                nameClassName="text-xs font-bold text-white uppercase tracking-wider leading-none truncate"
                className="gap-2 [&_img]:drop-shadow-[0_0_10px_rgba(176,38,255,0.55)]"
              />
            </Link>

            <Link to="/" className="shrink-0 min-w-0 hidden lg:block">
              <BrandLogo
                variant="white"
                logoSize="sm"
                showSubtitle={false}
                nameClassName="text-xs sm:text-sm font-bold text-white uppercase tracking-wider leading-none truncate"
                className="gap-2 [&_img]:drop-shadow-[0_0_10px_rgba(176,38,255,0.55)]"
              />
            </Link>

            <div className="hidden lg:flex flex-1 justify-center min-w-0">
              <nav className="store-navbar w-fit px-3 py-2">
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

            <div className="flex-1 lg:hidden" />

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSearchOpen((o) => !o)}
                className="p-2.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="relative p-2.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-neon-purple text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              <Link
                to="/admin/login"
                className="store-btn-primary hidden lg:inline-flex px-4 py-2 text-sm normal-case tracking-normal font-semibold"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>

              <button
                type="button"
                className="lg:hidden p-2.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {searchOpen && (
            <form
              onSubmit={handleSearch}
              className="mt-3 flex items-center gap-2 px-4 py-2.5 store-glass-panel rounded-full animate-fade-in"
            >
              <Search className="w-4 h-4 text-gray-500 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search consoles, games, accessories..."
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 text-gray-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden px-4 sm:px-6 lg:px-8 pb-4 animate-fade-in">
          <div className="max-w-7xl mx-auto p-4 store-glass-panel space-y-1 max-h-[70vh] overflow-y-auto">
            {STORE_NAV.map((item) => (
              <MobileNavSection
                key={item.id}
                item={item}
                active={isItemActive(item)}
                onNavigate={closeMenus}
              />
            ))}

            <div className="pt-3 mt-2 border-t border-white/10">
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
