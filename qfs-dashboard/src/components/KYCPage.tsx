import { useState, useRef } from 'react';

export function KYCPage() {
  const [loading, setLoading] = useState(false);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const proofRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setter(file);
      console.log('File selected:', file?.name);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('Submit clicked – you can implement your fetch here.');
  };

  // Helper to trigger file input
  const triggerFilePicker = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current) {
      ref.current.click();
    } else {
      alert('Input ref is null!');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        KYC Verification
      </h2>
      <p style={{ marginBottom: '24px' }}>
        Upload your documents.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Driver's License Front */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
            Driver's License (Front) *
          </label>
          <button
            type="button"
            onClick={() => triggerFilePicker(frontRef)}
            style={{
              padding: '10px 20px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            {frontFile ? frontFile.name : 'Choose File'}
          </button>
          <input
            ref={frontRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange(setFrontFile)}
            style={{ display: 'none' }}
          />
        </div>

        {/* Driver's License Back */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
            Driver's License (Back) *
          </label>
          <button
            type="button"
            onClick={() => triggerFilePicker(backRef)}
            style={{
              padding: '10px 20px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            {backFile ? backFile.name : 'Choose File'}
          </button>
          <input
            ref={backRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange(setBackFile)}
            style={{ display: 'none' }}
          />
        </div>

        {/* Proof of Residence */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
            Proof of Residence *
          </label>
          <button
            type="button"
            onClick={() => triggerFilePicker(proofRef)}
            style={{
              padding: '10px 20px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            {proofFile ? proofFile.name : 'Choose File'}
          </button>
          <input
            ref={proofRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange(setProofFile)}
            style={{ display: 'none' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 32px',
            background: '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          {loading ? 'Uploading...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
