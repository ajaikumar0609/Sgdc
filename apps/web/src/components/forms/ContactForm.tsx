'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Send, AlertCircle, RefreshCw } from 'lucide-react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Full name is required (minimum 2 characters)';
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errs.email = 'Valid email address is required';
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      errs.phone = 'Valid phone number is required (minimum 10 digits)';
    }
    if (!formData.subject.trim() || formData.subject.trim().length < 2) {
      errs.subject = 'Subject is required';
    }
    if (!formData.message.trim() || formData.message.trim().length < 5) {
      errs.message = 'Message must be at least 5 characters long';
    }
    return errs;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setApiError(data.error?.message || 'Unable to submit your message. Please try again.');
        return;
      }

      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      setApiError('Network connection issue. Please check your connection or call our desk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="p-8 border-brand-emerald-300 bg-brand-emerald-50/40 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-brand-emerald-100 text-brand-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-brand-navy-950">
          Message Received Successfully
        </h3>
        <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
          Thank you for reaching out. Our education counselling desk has received your note and will get back to you shortly.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSuccess(false)}
          className="mt-4"
        >
          Send Another Message
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-8 border-slate-200 bg-white shadow-soft-sm space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-brand-navy-950 font-heading">
          Send Us a Message
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Have an inquiry regarding courses, admission schedules, or counseling? Fill out the form below.
        </p>
      </div>

      {apiError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Ananya Raman"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            disabled={isSubmitting}
            required
          />

          <Input
            label="Phone Number *"
            type="tel"
            placeholder="10-digit mobile number"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={errors.phone}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address *"
            type="email"
            placeholder="e.g. ananya@example.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            disabled={isSubmitting}
            required
          />

          <Input
            label="Subject *"
            placeholder="e.g. Admission Inquiry for Paramedical"
            value={formData.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            error={errors.subject}
            disabled={isSubmitting}
            required
          />
        </div>

        <Textarea
          label="Your Message / Query *"
          placeholder="Please share details about your 12th stream, preferred course, or questions..."
          rows={4}
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          error={errors.message}
          disabled={isSubmitting}
          required
        />

        <Button
          type="submit"
          variant="emerald"
          size="lg"
          className="w-full justify-center"
          isLoading={isSubmitting}
          rightIcon={<Send className="w-4 h-4" />}
        >
          {isSubmitting ? 'Sending Message...' : 'Submit Message'}
        </Button>
      </form>
    </Card>
  );
}
