import { openTermsModal } from './TermsModal';

function TermsAgreement({ checked, onChange }) {
  const handleOpenTerms = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openTermsModal({
      onAccept: () => {
        onChange?.(true);
      },
    });
  };

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
        <button
          type="button"
          onClick={handleOpenTerms}
          className="text-neon-purple hover:underline hover:text-purple-300 transition font-medium inline-block text-left"
        >
          Terms &amp; Conditions
        </button>
        .
      </span>
    </label>
  );
}

export default TermsAgreement;
