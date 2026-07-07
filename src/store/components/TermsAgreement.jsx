import { Link } from 'react-router-dom';

function TermsAgreement({ checked, onChange }) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer text-sm text-gray-300">
      <input
        type="checkbox"
        required
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 rounded border-neon-purple/40 bg-transparent text-neon-purple focus:ring-neon-purple/30 shrink-0"
      />
      <span>
        I have read and agree to the{' '}
        <Link
          to="/page/terms-and-conditions"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neon-purple hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          Terms &amp; Conditions
        </Link>
        .
      </span>
    </label>
  );
}

export default TermsAgreement;
