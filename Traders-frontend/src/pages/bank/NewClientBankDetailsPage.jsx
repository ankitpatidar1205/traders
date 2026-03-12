import React, { useState } from 'react';

const NewClientBankDetailsPage = () => {
  const [formData, setFormData] = useState({
    accountHolder: "SHRISHREENATHJI TRADERS",
    accountNumber: "50200012345678",
    bankName: "HDFC Bank",
    ifsc: "HDFC0001234",
    phonePe: "9876543210",
    googlePay: "9876543210",
    paytm: "9876543210",
    upiId: "shreenathji@okaxis"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = () => {
    alert('Bank Details Updated Successfully!');
    console.log('Updated Form Data:', formData);
  };

  return (
    <div className="flex flex-col h-full bg-[#1a2035] space-y-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-block bg-[#4CAF50] text-white px-4 py-2 rounded-md shadow-sm">
          <h2 className="text-base font-semibold">Bank Account Details</h2>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 bg-[#202940] p-8 rounded-lg border border-[#2d3748] shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {/* Account Holder */}
          <div className="space-y-2">
            <label className="block text-slate-400 text-sm">Account Holder</label>
            <input
              type="text"
              name="accountHolder"
              value={formData.accountHolder}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-slate-700 text-white py-1 focus:outline-none focus:border-[#4CAF50] transition-colors"
            />
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <label className="block text-slate-400 text-sm">Account Number</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-slate-700 text-white py-1 focus:outline-none focus:border-[#4CAF50] transition-colors"
            />
          </div>

          {/* Bank Name */}
          <div className="space-y-2">
            <label className="block text-slate-400 text-sm">Bank Name</label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-slate-700 text-white py-1 focus:outline-none focus:border-[#4CAF50] transition-colors"
            />
          </div>

          {/* IFSC */}
          <div className="space-y-2">
            <label className="block text-slate-400 text-sm">IFSC</label>
            <input
              type="text"
              name="ifsc"
              value={formData.ifsc}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-slate-700 text-white py-1 focus:outline-none focus:border-[#4CAF50] transition-colors"
            />
          </div>

          {/* PhonePe */}
          <div className="space-y-2">
            <label className="block text-slate-400 text-sm">PhonePe</label>
            <input
              type="text"
              name="phonePe"
              value={formData.phonePe}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-slate-700 text-white py-1 focus:outline-none focus:border-[#4CAF50] transition-colors"
            />
          </div>

          {/* Google Pay */}
          <div className="space-y-2">
            <label className="block text-slate-400 text-sm">Google Pay</label>
            <input
              type="text"
              name="googlePay"
              value={formData.googlePay}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-slate-700 text-white py-1 focus:outline-none focus:border-[#4CAF50] transition-colors"
            />
          </div>

          {/* Paytm */}
          <div className="space-y-2">
            <label className="block text-slate-400 text-sm">Paytm</label>
            <input
              type="text"
              name="paytm"
              value={formData.paytm}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-slate-700 text-white py-1 focus:outline-none focus:border-[#4CAF50] transition-colors"
            />
          </div>

          {/* UPI ID */}
          <div className="space-y-2">
            <label className="block text-slate-400 text-sm">UPI ID</label>
            <input
              type="text"
              name="upiId"
              value={formData.upiId}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-slate-700 text-white py-1 focus:outline-none focus:border-[#4CAF50] transition-colors"
            />
          </div>
        </div>

        {/* Update Button */}
        <div className="mt-12">
          <button
            onClick={handleUpdate}
            className="bg-[#4CAF50] hover:bg-green-600 text-white font-medium py-2 px-6 rounded transition-all uppercase text-xs tracking-wider"
          >
            UPDATE DETAILS
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewClientBankDetailsPage;
