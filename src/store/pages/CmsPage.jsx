import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { storeApi } from '../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function CmsPage() {
  const { slug } = useParams();
  const { data, loading, error } = useFetch(() => storeApi.getPage(slug), [slug]);

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
