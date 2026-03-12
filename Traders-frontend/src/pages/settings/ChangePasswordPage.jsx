import React, { useState } from 'react';
import { Lock, CheckCircle } from 'lucide-react';

const ChangePasswordPage = () => {
    const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ show: false, type: '', text: '' });

    const showToast = (text, type = 'success') => {
        setToast({ show: true, type, text });
        setTimeout(() => setToast({ show: false, type: '', text: '' }), 3000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.newPassword) newErrors.newPassword = 'New password is required.';
        else if (formData.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters.';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password.';
        else if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
        showToast('Password changed successfully!', 'success');
        setFormData({ newPassword: '', confirmPassword: '' });
        setErrors({});
    };

    return (
        <div className="flex flex-col h-full bg-[#1a2035]">
            {toast.show && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-lg shadow-2xl text-white text-[14px] font-medium ${toast.type === 'success' ? 'bg-[#16a34a]' : 'bg-[#dc2626]'}`}>
                    <CheckCircle className="w-5 h-5" />{toast.text}
                </div>
            )}
            <div className="relative">
                <div className="bg-[#1f283e] rounded-md shadow-2xl relative pt-10 pb-6 w-full">
                    <div className="absolute -top-6 left-5 rounded-md px-8 py-5 z-10"
                        style={{ background: 'linear-gradient(60deg, #288c6c, #4ea752)', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(76,175,80,0.4)' }}>
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-white" />
                            <h4 className="text-white text-[15px] font-bold tracking-tight">Change Login Password</h4>
                        </div>
                    </div>
                    <div className="px-8 pt-2">
                        <form onSubmit={handleSubmit} autoComplete="off">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                <div className="space-y-1">
                                    <label className="block text-slate-400 text-[13px] font-medium uppercase tracking-wide">New Password</label>
                                    <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange}
                                        placeholder="Minimum 8 characters"
                                        className="w-full bg-transparent border-b border-white/10 text-white pb-1.5 focus:outline-none focus:border-[#4caf50] transition-colors text-[14px] placeholder-slate-600" />
                                    {errors.newPassword && <p className="text-red-400 text-[12px] mt-1">{errors.newPassword}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-slate-400 text-[13px] font-medium uppercase tracking-wide">Confirm Password</label>
                                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                                        placeholder="Re-enter new password"
                                        className="w-full bg-transparent border-b border-white/10 text-white pb-1.5 focus:outline-none focus:border-[#4caf50] transition-colors text-[14px] placeholder-slate-600" />
                                    {errors.confirmPassword && <p className="text-red-400 text-[12px] mt-1">{errors.confirmPassword}</p>}
                                </div>
                            </div>
                            <div className="mt-8">
                                <button type="submit" className="btn-success-gradient text-white font-bold py-2.5 px-8 rounded uppercase text-[11px] tracking-widest min-w-[160px] h-[40px]">
                                    SAVE PASSWORD
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordPage;
