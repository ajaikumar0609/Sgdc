'use client';

import React, { useState } from 'react';
import { studentEnquirySchema, TAMIL_NADU_DISTRICTS, ACADEMIC_INTEREST_AREAS, EnquirySource } from '@shasthi-guru/shared';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Send,
  AlertCircle,
  FileCheck2,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StudentEnquiryFormProps {
  source?: EnquirySource;
  defaultProgram?: string;
  defaultArea?: string;
  className?: string;
  title?: string;
  subtitle?: string;
  showAadhaarField?: boolean; // Controlled by feature flag
}

export function StudentEnquiryForm({
  source = 'ENQUIRY_PAGE',
  defaultProgram = '',
  defaultArea = '',
  className,
  title = 'Student Admission & Counselling Enquiry',
  subtitle = 'Get personalized academic guidance and transparent admission support from Shasthi Guru education mentors.',
  showAadhaarField = false,
}: StudentEnquiryFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    areaOfInterest: defaultArea,
    courseProgram: defaultProgram,
    mark12th: '',
    aadhaarNumber: '',
    consent: false,
    source,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{
    enquiryCode: string;
    studentName: string;
    courseProgram: string;
    district: string;
  } | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
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
    setGeneralError(null);
    setErrors({});

    // 1. Client-Side Zod Validation
    const validationResult = studentEnquirySchema.safeParse(formData);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        const path = err.path.join('.');
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // 2. Submit to Real Backend API
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validationResult.data),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.error?.fields) {
          setErrors(data.error.fields);
        } else {
          setGeneralError(
            data.error?.message || 'An error occurred while submitting your enquiry. Please try again.'
          );
        }
        return;
      }

      // 3. Display Success State
      setSubmitSuccess({
        enquiryCode: data.data.enquiryCode,
        studentName: formData.firstName,
        courseProgram: formData.courseProgram,
        district: formData.district,
      });
    } catch (err: any) {
      setGeneralError(
        'Unable to connect to the Shasthi Guru admissions platform. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitSuccess(null);
    setFormData({
      firstName: '',
      phone: '',
      email: '',
      address: '',
      district: '',
      areaOfInterest: defaultArea,
      courseProgram: defaultProgram,
      mark12th: '',
      aadhaarNumber: '',
      consent: false,
      source,
    });
    setErrors({});
    setGeneralError(null);
  };

  // SUCCESS CONFIRMATION VIEW
  if (submitSuccess) {
    return (
      <Card className={cn('p-8 sm:p-10 text-center bg-white border-brand-emerald-200 shadow-soft-lg', className)}>
        <div className="w-16 h-16 rounded-2xl bg-brand-emerald-50 text-brand-emerald-600 flex items-center justify-center mx-auto mb-6 border border-brand-emerald-200 shadow-soft-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-navy-50 text-brand-navy-800 text-xs font-bold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald-600" />
          <span>Enquiry Registered Successfully</span>
        </span>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Thank you, {submitSuccess.studentName}!
        </h3>

        <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 max-w-md mx-auto">
          <span className="text-xs uppercase font-bold text-slate-500 tracking-wider block">
            Your Official Enquiry Reference ID
          </span>
          <span className="text-2xl font-black text-brand-navy-800 font-mono tracking-tight block mt-1">
            {submitSuccess.enquiryCode}
          </span>
          <span className="text-xs text-slate-500 block mt-1">
            Program: {submitSuccess.courseProgram} • District: {submitSuccess.district}
          </span>
        </div>

        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Your admission enquiry has entered the Shasthi Guru counselling workflow. A dedicated educational mentor will review your academic background and call you shortly to assist with course selection, college eligibility, and admission procedures.
        </p>

        <div className="pt-8 flex flex-wrap items-center justify-center gap-4">
          <Button variant="outline" size="md" onClick={handleReset} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Submit Another Query
          </Button>
          <a href="tel:+919876543210">
            <Button variant="emerald" size="md" leftIcon={<Phone className="w-4 h-4" />}>
              Call Admissions Directly
            </Button>
          </a>
        </div>
      </Card>
    );
  }

  // STANDARD FORM VIEW
  return (
    <Card className={cn('p-6 sm:p-8 bg-white border-slate-200 shadow-soft-md', className)}>
      <div className="mb-6 space-y-1">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h3>
        {subtitle && <p className="text-sm text-slate-600 leading-relaxed">{subtitle}</p>}
      </div>

      {generalError && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Row 1: Student Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Student's Full Name"
            placeholder="e.g. Meenakshi Sundaram"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            error={errors.firstName}
            required
          />
          <Input
            label="10-Digit Mobile Number"
            type="tel"
            placeholder="e.g. 9840123456"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={errors.phone}
            required
            hint="For counselor follow-up via Call / WhatsApp"
          />
        </div>

        {/* Row 2: Email & District */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="student@example.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            required
          />
          <Select
            label="District"
            placeholder="Select Your District"
            value={formData.district}
            onChange={(e) => handleChange('district', e.target.value)}
            error={errors.district}
            required
            options={TAMIL_NADU_DISTRICTS.map((d) => ({ value: d, label: d }))}
          />
        </div>

        {/* Row 3: Area of Interest & Course/Program */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Area of Interest"
            placeholder="Select Stream / Field"
            value={formData.areaOfInterest}
            onChange={(e) => handleChange('areaOfInterest', e.target.value)}
            error={errors.areaOfInterest}
            required
            options={ACADEMIC_INTEREST_AREAS.map((a) => ({ value: a, label: a }))}
          />
          <Input
            label="Desired Course / Program"
            placeholder="e.g. B.E. CSE, B.Sc. Nursing, B.Pharm"
            value={formData.courseProgram}
            onChange={(e) => handleChange('courseProgram', e.target.value)}
            error={errors.courseProgram}
            required
          />
        </div>

        {/* Row 4: 12th Mark & Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="12th Standard Mark / Percentage"
            placeholder="e.g. 88.5% or 530/600"
            value={formData.mark12th}
            onChange={(e) => handleChange('mark12th', e.target.value)}
            error={errors.mark12th}
            required
            hint="Used strictly to evaluate eligibility"
          />
          <Input
            label="Residential Address"
            placeholder="City / Area, Town"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            error={errors.address}
            required
          />
        </div>

        {/* Optional Feature-Flagged Aadhaar field */}
        {showAadhaarField && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <Input
              label="Aadhaar Number (Optional Verification)"
              type="text"
              placeholder="12-digit number"
              value={formData.aadhaarNumber}
              onChange={(e) => handleChange('aadhaarNumber', e.target.value)}
              error={errors.aadhaarNumber}
              hint="Confidential: Encrypted via AES-256 and never shared."
            />
          </div>
        )}

        {/* Mandatory Consent Checkbox */}
        <div className="pt-2">
          <Checkbox
            label="I grant permission for Shasthi Guru Dream Campus education consultants to contact me via phone, WhatsApp, or email to provide academic counseling and admission updates."
            checked={formData.consent}
            onChange={(e) => handleChange('consent', e.target.checked)}
            error={errors.consent}
            required
          />
        </div>

        {/* Submit Action */}
        <div className="pt-4">
          <Button
            type="submit"
            variant="emerald"
            size="lg"
            className="w-full justify-center shadow-soft-md"
            isLoading={isSubmitting}
            rightIcon={<Send className="w-4 h-4" />}
          >
            Submit Admission & Counselling Query
          </Button>
        </div>

        {/* Security / Privacy Assurance */}
        <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-500 text-center">
          <ShieldCheck className="w-4 h-4 text-brand-emerald-600 shrink-0" />
          <span>Strict Privacy Assurance • No Spam • Your details are protected</span>
        </div>
      </form>
    </Card>
  );
}
