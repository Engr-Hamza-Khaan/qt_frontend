import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { storeApi } from '../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { openTermsModal } from '../components/TermsModal';
import { ScrollText } from 'lucide-react';

function CmsPage() {
  const { slug } = useParams();
  const isTermsSlug = slug === 'terms-and-conditions' || slug === 'terms';

  useEffect(() => {
    if (isTermsSlug) {
      openTermsModal();
    }
  }, [isTermsSlug]);

  const { data, loading, error } = useFetch(
    () => (isTermsSlug ? Promise.resolve({ data: null }) : storeApi.getPage(slug)),
    [slug]
  );

  if (isTermsSlug) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center text-neon-purple mx-auto shadow-lg shadow-purple-900/30">
          <ScrollText className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white font-display">Terms &amp; Conditions</h1>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Terms &amp; Conditions are displayed in an interactive modal. Click below to reopen at any time.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => openTermsModal()}
            className="store-btn-primary px-6 py-2.5 text-xs font-bold"
          >
            Open Terms &amp; Conditions Modal
          </button>
          <Link to="/shop" className="px-5 py-2.5 rounded-xl border border-white/15 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner size="lg" className="min-h-[40vh]" />;

  if (error || !data?.data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="store-muted">Page not found</p>
        <Link to="/" className="store-link text-sm mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  const page = data.data;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="store-page-title mb-8">{page.title}</h1>
      <div
        className="cms-content text-gray-400 leading-relaxed space-y-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:text-neon-purple [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: page.content || '' }}
      />
    </div>
  );
}

export default CmsPage;
