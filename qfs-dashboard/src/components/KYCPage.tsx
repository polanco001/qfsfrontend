import { useState, useRef } from 'react';
import { Upload, CheckCircle } from 'lucide-react';

export function KYCPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    dateOfBirth: '',
    ssn: '',
  });
  const [documents, setDocuments] = useState({
    driverLicenseFront: null as File | null,
    driverLicenseBack: null as File | null,
    proofOfResidence: null as File | null,
  });
  const [proofType, setProofType] = useState('');

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (field: string, file: File | null) => {
    console.log(`📁 File selected for ${field}:`, file?.name);
    setDocuments({ ...documents, [field]: file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // ... (same as before)
  };

  const FileUploadBox = ({
    label,
    field,
    file,
    required = true,
    inputRef,
  }: {
    label: string;
    field: string;
    file: File | null;
    required?: boolean;
    inputRef: React.RefObject<HTMLInputElement>;
  }) => {
    const inputId = `file-${field}`;

    const handleDivClick = () => {
      console.log(`🖱️ Div clicked for ${field}`);
      if (inputRef.current) {
        inputRef.current.click();
      } else {
        console.warn(`⚠️ inputRef.current is null for ${field}`);
        alert(`inputRef.current is null for ${field}`);
      }
    };

    const handleFallbackClick = () => {
      alert(`🔔 Fallback button clicked for ${field}`);  // <-- ALERT
      console.log(`🖱️ Fallback button clicked for ${field}`);
      if (inputRef.current) {
        console.log('✅ inputRef exists, calling click()');
        inputRef.current.click();
      } else {
        console.warn(`⚠️ inputRef.current is null for ${field}`);
        alert(`❌ inputRef.current is null for ${field}`);
      }
    };

    return (
      <div>
        <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <label
          htmlFor={inputId}
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-900"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {file ? (
              <>
                <CheckCircle className="text-green-500 mb-2" size={32} />
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Click to change</p>
              </>
            ) : (
              <>
                <Upload className="text-slate-400 mb-2" size={32} />
                <p className="text-sm text-slate-600 dark:text-slate-400">Click to upload</p>
              </>
            )}
          </div>
        </label>

        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
          style={{ display: 'none' }}
        />

        <button
          type="button"
          onClick={handleFallbackClick}
          className="mt-2 w-full py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800/50 transition"
        >
          📎 Click here if the box above doesn't work
        </button>
      </div>
    );
  };

  const inputClass =
    'w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-slate-900 dark:text-white text-3xl font-bold mb-2">KYC Verification</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Complete your identity verification to unlock all features.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ... (form fields - same as before) */}
        {/* I'll keep the rest identical, but to save space I'm abbreviating; you can copy from previous version */}
        {/* For brevity, I'm not repeating all fields, but you must include them */}
      </form>
    </div>
  );
}
