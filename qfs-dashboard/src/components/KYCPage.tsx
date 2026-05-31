import { useState } from 'react';
import { Upload, CheckCircle } from 'lucide-react';

export function KYCPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', email: '', phoneNumber: '', address: '',
    city: '', state: '', postalCode: '', country: '',
  });
  const [documents, setDocuments] = useState({
    driverLicenseFront: null as File | null,
    driverLicenseBack: null as File | null,
    proofOfResidence: null as File | null,
  });
  const [proofType, setProofType] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (field: string, file: File | null) => {
    setDocuments({ ...documents, [field]: file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.address || !formData.postalCode || !formData.country) {
      alert('Please fill in all required fields');
      return;
    }
    if (!documents.driverLicenseFront || !documents.driverLicenseBack) {
      alert("Please upload both sides of your driver's license");
      return;
    }
    if (!documents.proofOfResidence) {
      alert('Please upload proof of residence');
      return;
    }
    if (!proofType) {
      alert('Please select proof of residence type');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    const multiForm = new FormData();
    Object.entries(formData).forEach(([key, val]) => multiForm.append(key, val));
    multiForm.append('proofType', proofType);
    // CORRECT field names that backend expects
    multiForm.append('dlFront', documents.driverLicenseFront);
    multiForm.append('dlBack', documents.driverLicenseBack);
    multiForm.append('proofDoc', documents.proofOfResidence);

    try {
      const res = await fetch('http://localhost:5001/api/user/kyc/submit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: multiForm,
      });
      if (res.ok) {
        alert('🎯 KYC verification submitted successfully!');
      } else {
        const data = await res.json();
        alert(`❌ Error: ${data.error || data.msg || 'KYC submission failed.'}`);
      }
    } catch (err) {
      alert('❌ Failed to communicate with the server.');
    } finally {
      setLoading(false);
    }
  };

  const FileUploadBox = ({ label, field, file, required = true }: { label: string; field: string; file: File | null; required?: boolean }) => (
    <div>
      <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-900">
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
        <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)} className="hidden" />
      </label>
    </div>
  );

  const inputClass = "w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-slate-900 dark:text-white text-3xl font-bold mb-2">KYC Verification</h2>
        <p className="text-slate-600 dark:text-slate-400">Complete your identity verification to unlock all features.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-slate-900 dark:text-white text-xl font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Full Name <span className="text-red-500">*</span></label><input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className={inputClass} /></div>
            <div><label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Email Address <span className="text-red-500">*</span></label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass} /></div>
            <div><label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Phone Number <span className="text-red-500">*</span></label><input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className={inputClass} /></div>
            <div><label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Country <span className="text-red-500">*</span></label><input type="text" name="country" value={formData.country} onChange={handleInputChange} className={inputClass} /></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-slate-900 dark:text-white text-xl font-semibold mb-4">Address Information</h3>
          <div className="space-y-4">
            <div><label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Street Address <span className="text-red-500">*</span></label><input type="text" name="address" value={formData.address} onChange={handleInputChange} className={inputClass} /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">City</label><input type="text" name="city" value={formData.city} onChange={handleInputChange} className={inputClass} /></div>
              <div><label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">State/Province</label><input type="text" name="state" value={formData.state} onChange={handleInputChange} className={inputClass} /></div>
              <div><label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Postal/Zip Code <span className="text-red-500">*</span></label><input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className={inputClass} /></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-slate-900 dark:text-white text-xl font-semibold mb-4">Identity Documents</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUploadBox label="Driver's License (Front)" field="driverLicenseFront" file={documents.driverLicenseFront} />
              <FileUploadBox label="Driver's License (Back)" field="driverLicenseBack" file={documents.driverLicenseBack} />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Proof of Residence Type <span className="text-red-500">*</span></label>
              <select value={proofType} onChange={(e) => setProofType(e.target.value)} className={inputClass}>
                <option value="">Select document type</option>
                <option value="water">Water Bill</option>
                <option value="internet">Internet Bill</option>
                <option value="credit">Credit Card Statement</option>
                <option value="bank">Bank Statement</option>
              </select>
            </div>
            <FileUploadBox label="Proof of Residence Document" field="proofOfResidence" file={documents.proofOfResidence} />
            <p className="text-xs text-slate-500">Upload a recent utility bill, bank statement, or credit card statement (dated within last 3 months).</p>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors">Save Draft</button>
          <button type="submit" disabled={loading} className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:bg-slate-500">
            {loading ? 'Uploading...' : 'Submit for Verification'}
          </button>
        </div>
      </form>
    </div>
  );
}