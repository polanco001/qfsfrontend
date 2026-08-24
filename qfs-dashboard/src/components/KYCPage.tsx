import { useRef } from 'react';

export function KYCPage() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    alert('Button clicked!');
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">KYC Upload Test</h2>
      <p>Click the button to open file picker.</p>

      <button
        onClick={handleClick}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Choose File
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => alert('File selected: ' + e.target.files?.[0]?.name)}
      />
    </div>
  );
}
