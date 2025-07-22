import React, { useState, useEffect } from 'react';
import { updateSubEvent } from '../../services/events';
import Button from '../ui/Button';
import QRCodeUpload from '../QRCodeUpload';
import api from '../../services/api';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://pulseevent-backend.onrender.com/api';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'whatsapp', label: 'WhatsApp Number' },
  { value: 'usn', label: 'USN' },
];

const SubEventEditForm = ({ initialData, parentId, subId, onSuccess }) => {
  const [form, setForm] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    location: initialData.location || '',
    startTime: initialData.startTime ? new Date(initialData.startTime).toISOString().slice(0, 16) : '',
    endTime: initialData.endTime ? new Date(initialData.endTime).toISOString().slice(0, 16) : '',
    rsvpDeadline: initialData.rsvpDeadline ? new Date(initialData.rsvpDeadline).toISOString().slice(0, 16) : '',
    maxAttendees: initialData.maxAttendees || '',
    teamSize: initialData.teamSize || '',
    teamSizeMin: initialData.teamSizeMin || '',
    teamSizeMax: initialData.teamSizeMax || '',
    flexibleTeamSize: initialData.flexibleTeamSize || false,
    paymentEnabled: initialData.paymentEnabled || false,
    paymentProofRequired: initialData.paymentProofRequired || false,
    whatsappGroupEnabled: initialData.whatsappGroupEnabled || false,
    whatsappGroupLink: initialData.whatsappGroupLink || '',
    qrCode: initialData.qrCode || '',
    customFields: initialData.customFields || [],
  });
  const [qrPreview, setQrPreview] = useState(initialData.qrCode || null);
  const [qrFile, setQrFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [editFields, setEditFields] = useState(false);
  const [customFields, setCustomFields] = useState(form.customFields || []);
  const [fieldError, setFieldError] = useState('');

  // Sync qrPreview with initialData.qrCode on change
  useEffect(() => {
    setQrPreview(initialData.qrCode || null);
  }, [initialData.qrCode]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle QR code upload
  const handleQrChange = async (e) => {
    const file = e.target.files[0];
    setQrFile(file);
    setQrPreview(file ? URL.createObjectURL(file) : null);
    if (file) {
      setLoading(true);
      setError("");
      const qrForm = new FormData();
      qrForm.append("qrCode", file);
      qrForm.append("eventId", subId);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/upload/qr-code`, {
          method: "POST",
          body: qrForm,
          credentials: "include",
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined
          }
        });
        const data = await res.json();
        if (data.qrCode) {
          setForm((prev) => ({ ...prev, qrCode: data.qrCode }));
          setQrPreview(data.qrCode);
          setQrFile(null);
          // Immediately update the event with new QR code
          await updateSubEvent(subId, {
            ...form,
            qrCode: data.qrCode
          });
        } else {
          setError("Failed to upload QR code.");
        }
      } catch (err) {
        setError("Failed to upload QR code.");
      } finally {
        setLoading(false);
      }
    }
  };

  // QR code preview logic
  const hasQr = !!qrPreview || !!form.qrCode;
  const [showQrInput, setShowQrInput] = useState(false);

  const handleRemoveQr = () => {
    setQrPreview(null);
    setQrFile(null);
    setForm(f => ({ ...f, qrCode: '' }));
    setShowQrInput(true);
  };

  const handleReplaceQr = () => {
    setShowQrInput(true);
  };

  // WhatsApp link validation
  const isValidWhatsappLink = (link) =>
    link.startsWith('https://chat.whatsapp.com/') && link.length > 30;

  // Date/time UTC conversion
  const toISOString = (local) => (local ? new Date(local).toISOString() : '');

  const handleFieldChange = (idx, key, value) => {
    setCustomFields(fields => fields.map((f, i) => i === idx ? { ...f, [key]: value } : f));
  };
  const handleFieldOptionChange = (idx, options) => {
    setCustomFields(fields => fields.map((f, i) => i === idx ? { ...f, options } : f));
  };
  const addField = () => {
    setCustomFields([...customFields, { label: '', type: 'text', required: false, isIndividual: false, options: [] }]);
  };
  const removeField = idx => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      setCustomFields(fields => fields.filter((_, i) => i !== idx));
    }
  };
  const moveField = (from, to) => {
    if (to < 0 || to >= customFields.length) return;
    const updated = [...customFields];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setCustomFields(updated);
  };
  const validateFields = () => {
    for (let i = 0; i < customFields.length; i++) {
      const f = customFields[i];
      if (!f.label.trim()) return 'All fields must have a label.';
      if (!f.type) return 'All fields must have a type.';
      if (f.type === 'dropdown' && (!f.options || f.options.length === 0 || f.options.some(opt => !opt.trim())))
        return 'Dropdown fields must have at least one valid option.';
    }
    return '';
  };

  // Utility to ensure options is always an array
  const safeOptions = (opts) => Array.isArray(opts) ? opts : [];

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    // Validation
    if (!form.title.trim()) return setError('Title is required.');
    if (!form.location.trim()) return setError('Location is required.');
    if (!form.startTime || !form.endTime || !form.rsvpDeadline)
      return setError('All date/time fields are required.');
    if (form.paymentEnabled && !qrPreview && !form.qrCode)
      return setError('QR code is required for payment events.');
    if (form.whatsappGroupEnabled && !isValidWhatsappLink(form.whatsappGroupLink))
      return setError('Please provide a valid WhatsApp group link.');
    if (form.flexibleTeamSize) {
      if (!form.teamSizeMin || !form.teamSizeMax)
        return setError('Min and max team size required.');
      if (parseInt(form.teamSizeMin) > parseInt(form.teamSizeMax))
        return setError('Min team size cannot exceed max team size.');
    } else if (form.teamSize && parseInt(form.teamSize) < 1) {
      return setError('Team size must be at least 1.');
    }

    const fieldValidation = validateFields();
    if (fieldValidation) return setFieldError(fieldValidation);

    // Prepare payload
    const payload = {
      ...form,
      startTime: toISOString(form.startTime),
      endTime: toISOString(form.endTime),
      rsvpDeadline: toISOString(form.rsvpDeadline),
      qrCode: form.qrCode, // Will be replaced if uploading new QR
    };

    // Handle QR upload if changed
    // (Removed from handleSubmit, now handled immediately on file select)

    payload.customFields = customFields;

    try {
      await updateSubEvent(subId, payload);
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to update sub-event.');
    } finally {
      setLoading(false);
    }
  };

  // UI
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div>
        <h2 className="text-lg font-bold text-amber-400 mb-2">Basic Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-amber-300 mb-1">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} className="w-full px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-300 mb-1">Location *</label>
            <input name="location" value={form.location} onChange={handleChange} className="w-full px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400" required />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-amber-300 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400" />
        </div>
      </div>

      {/* Timing */}
      <div>
        <h2 className="text-lg font-bold text-amber-400 mb-2">Timing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-amber-300 mb-1">Start Time *</label>
            <input type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange} className="w-full px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-300 mb-1">End Time *</label>
            <input type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange} className="w-full px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-300 mb-1">RSVP Deadline *</label>
            <input type="datetime-local" name="rsvpDeadline" value={form.rsvpDeadline} onChange={handleChange} className="w-full px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400" required />
          </div>
        </div>
      </div>

      {/* Team Settings */}
      <div>
        <h2 className="text-lg font-bold text-amber-400 mb-2">Team Settings</h2>
        <div className="flex items-center gap-4 mb-4">
          <input type="checkbox" name="teamSize" checked={!!form.teamSize} onChange={e => setForm(prev => ({ ...prev, teamSize: e.target.checked ? (prev.teamSize || 4) : '' }))} className="h-5 w-5 rounded border-amber-400 text-amber-400 focus:ring-amber-400" id="teamEvent" />
          <label htmlFor="teamEvent" className="text-white font-semibold cursor-pointer select-none">Team Event</label>
        </div>
        {!!form.teamSize && (
          <div className="flex items-center gap-4 mb-4">
            <input type="checkbox" name="flexibleTeamSize" checked={form.flexibleTeamSize} onChange={handleChange} className="h-5 w-5 rounded border-amber-400 text-amber-400 focus:ring-amber-400" id="flexibleTeamSize" />
            <label htmlFor="flexibleTeamSize" className="text-white font-semibold cursor-pointer select-none">Flexible Team Size</label>
          </div>
        )}
        {!!form.teamSize && form.flexibleTeamSize ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-300 mb-1">Min Team Size *</label>
              <input type="number" name="teamSizeMin" value={form.teamSizeMin} onChange={handleChange} min={1} className="w-full px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-300 mb-1">Max Team Size *</label>
              <input type="number" name="teamSizeMax" value={form.teamSizeMax} onChange={handleChange} min={form.teamSizeMin || 1} className="w-full px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400" required />
            </div>
          </div>
        ) : !!form.teamSize ? (
          <div className="w-1/2">
            <label className="block text-sm font-medium text-amber-300 mb-1">Team Size *</label>
            <input type="number" name="teamSize" value={form.teamSize} onChange={handleChange} min={1} className="w-full px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400" required />
          </div>
        ) : null}
      </div>

      {/* Payment Settings */}
      <div>
        <h2 className="text-lg font-bold text-amber-400 mb-2">Payment</h2>
        <div className="flex items-center gap-4 mb-4">
          <input type="checkbox" name="paymentEnabled" checked={form.paymentEnabled} onChange={handleChange} className="h-5 w-5 rounded border-amber-400 text-amber-400 focus:ring-amber-400" id="paymentEnabled" />
          <label htmlFor="paymentEnabled" className="text-white font-semibold cursor-pointer select-none">Payment Required</label>
        </div>
        {form.paymentEnabled && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-amber-300 mb-1">QR Code *</label>
              {hasQr && (
                <div className="flex items-center gap-4 mb-2">
                  <img src={qrPreview || form.qrCode} alt="QR Preview" className="w-24 h-24 rounded-lg border border-amber-400 object-contain" />
                  <Button type="button" onClick={handleRemoveQr} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">Remove</Button>
                  <Button type="button" onClick={handleReplaceQr} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">Replace</Button>
                </div>
              )}
              {(!hasQr || showQrInput) && (
                <input type="file" accept="image/*" onChange={handleQrChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
              )}
            </div>
            <div className="flex items-center gap-4 mb-4">
              <input type="checkbox" name="paymentProofRequired" checked={form.paymentProofRequired} onChange={handleChange} className="h-5 w-5 rounded border-amber-400 text-amber-400 focus:ring-amber-400" id="paymentProofRequired" />
              <label htmlFor="paymentProofRequired" className="text-white font-semibold cursor-pointer select-none">Payment Proof Required</label>
            </div>
          </>
        )}
      </div>

      {/* WhatsApp Group */}
      <div>
        <h2 className="text-lg font-bold text-amber-400 mb-2">WhatsApp Group</h2>
        <div className="flex items-center gap-4 mb-4">
          <input type="checkbox" name="whatsappGroupEnabled" checked={form.whatsappGroupEnabled} onChange={handleChange} className="h-5 w-5 rounded border-amber-400 text-amber-400 focus:ring-amber-400" id="whatsappGroupEnabled" />
          <label htmlFor="whatsappGroupEnabled" className="text-white font-semibold cursor-pointer select-none">Enable WhatsApp Group</label>
        </div>
        {form.whatsappGroupEnabled && (
          <div className="w-full md:w-2/3">
            <label className="block text-sm font-medium text-amber-300 mb-1">WhatsApp Group Link *</label>
            <input type="url" name="whatsappGroupLink" value={form.whatsappGroupLink} onChange={handleChange} placeholder="https://chat.whatsapp.com/..." className="w-full px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400" required />
            {!isValidWhatsappLink(form.whatsappGroupLink) && form.whatsappGroupLink && (
              <div className="text-red-400 text-xs mt-1">Invalid WhatsApp group link.</div>
            )}
          </div>
        )}
      </div>

      {/* Custom Fields (read-only for now) */}
      <div>
        <h2 className="text-lg font-bold text-amber-400 mb-2 flex items-center gap-4">
          Custom Registration Fields
          <Button type="button" onClick={() => setEditFields(e => !e)} className="ml-2 px-3 py-1 text-xs font-semibold bg-amber-400/20 text-amber-400 rounded hover:bg-amber-400/40">
            {editFields ? 'Done' : 'Edit Fields'}
          </Button>
        </h2>
        {editFields ? (
          <div className="space-y-4">
            {customFields.map((field, idx) => (
              <div key={idx} className="bg-white/10 rounded px-3 py-2 flex flex-col md:flex-row md:items-center gap-2 relative">
                <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
                  <input
                    className="px-2 py-1 rounded bg-white/5 text-white border border-white/10 w-32"
                    placeholder="Label"
                    value={field.label}
                    onChange={e => handleFieldChange(idx, 'label', e.target.value)}
                  />
                  <div className="relative w-32">
                    <select
                      className="pl-3 pr-8 py-1.5 rounded-md bg-[#302b63] text-white border border-amber-400/30 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 text-sm shadow-sm hover:border-amber-400/60 appearance-none w-full"
                      value={field.type}
                      onChange={e => handleFieldChange(idx, 'type', e.target.value)}
                      style={{ fontSize: '1rem' }}
                    >
                      <option value="" className="bg-[#302b63] text-gray-300">Type</option>
                      {FIELD_TYPES.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-[#302b63] text-amber-200 hover:bg-amber-400/10">{opt.label}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 text-amber-300 flex items-center">
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>
                  {field.type === 'dropdown' && (
                    <input
                      className="px-2 py-1 rounded bg-white/5 text-white border border-white/10 w-48"
                      placeholder="Options (comma separated)"
                      value={safeOptions(field.options).join(',')}
                      onChange={e => handleFieldOptionChange(idx, e.target.value.split(',').map(opt => opt.trim()).filter(Boolean))}
                    />
                  )}
                  <label className="flex items-center gap-1 text-xs text-amber-300">
                    <input type="checkbox" checked={!!field.required} onChange={e => handleFieldChange(idx, 'required', e.target.checked)} /> Required
                  </label>
                  <label className="flex items-center gap-1 text-xs text-blue-300">
                    <input type="checkbox" checked={!!field.isIndividual} onChange={e => handleFieldChange(idx, 'isIndividual', e.target.checked)} /> Individual
                  </label>
                </div>
                <div className="flex gap-2 items-center mt-2 md:mt-0">
                  <Button type="button" onClick={() => moveField(idx, idx-1)} className="px-2 py-1 text-xs" disabled={idx===0}>↑</Button>
                  <Button type="button" onClick={() => moveField(idx, idx+1)} className="px-2 py-1 text-xs" disabled={idx===customFields.length-1}>↓</Button>
                  <Button type="button" onClick={() => removeField(idx)} className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white">Delete</Button>
                </div>
              </div>
            ))}
            <Button type="button" onClick={addField} className="mt-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-semibold">+ Add Field</Button>
            {fieldError && <div className="text-red-400 bg-red-500/10 border border-red-400/20 rounded-lg px-4 py-2 text-center font-medium mt-2">{fieldError}</div>}
          </div>
        ) : (
          Array.isArray(customFields) && customFields.length > 0 ? (
            <ul className="space-y-2">
              {customFields.map((field, idx) => (
                <li key={idx} className="bg-white/10 rounded px-3 py-2 text-gray-200 text-sm flex items-center gap-2">
                  <span className="font-semibold text-amber-300">{field.label}</span>
                  <span className="text-gray-400">({field.type})</span>
                  {field.required && <span className="text-red-400">*</span>}
                  {field.isIndividual && <span className="text-blue-400 text-xs ml-2">Individual</span>}
                  {field.type === 'dropdown' && field.options && (
                    <span className="text-xs text-gray-400 ml-2">[{field.options.join(', ')}]</span>
                  )}
                  {field.type === 'dropdown' && !Array.isArray(field.options) && (
                    <span className="text-xs text-red-400 ml-2">[Invalid options]</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-400 text-sm">No custom fields for this sub-event.</div>
          )
        )}
      </div>

      {/* Error/Success/Save */}
      {error && <div className="text-red-400 bg-red-500/10 border border-red-400/20 rounded-lg px-4 py-2 text-center font-medium">{error}</div>}
      {success && <div className="text-green-400 bg-green-500/10 border border-green-400/20 rounded-lg px-4 py-2 text-center font-medium">Sub-event updated successfully!</div>}
      <div className="sticky bottom-0 bg-gradient-to-t from-[#0f0c29]/80 via-[#302b63]/80 to-[#24243e]/80 py-4 flex justify-end z-20">
        <Button type="submit" disabled={loading} className="px-8 py-3 text-lg font-bold">
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default SubEventEditForm; 