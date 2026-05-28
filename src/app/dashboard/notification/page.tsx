'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Book,
  CheckCircle,
  Clock,
  Loader,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  course: string;
  state: string;
  message: string;
  termsAccepted: boolean;
  status: 'new' | 'contacted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  count: number;
  data: Inquiry[];
}

const NotificationPage = () => {
  const { token } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'contacted' | 'rejected'>(
    'all'
  );

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://api.ifbb.qurilo.com/api/admin/course-inquiries', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'include',
      });

      const data: ApiResponse = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setInquiries(data.data);
        setError('');
      } else {
        setError('Failed to load inquiries');
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatStatusLabel = (status: 'all' | 'new' | 'contacted' | 'rejected') =>
    status.charAt(0).toUpperCase() + status.slice(1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'contacted':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="h-4 w-4" />;
      case 'contacted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const filteredInquiries =
    filterStatus === 'all'
      ? inquiries
      : inquiries.filter((inquiry) => inquiry.status === filterStatus);

  const statusCounts = {
    all: inquiries.length,
    new: inquiries.filter((i) => i.status === 'new').length,
    contacted: inquiries.filter((i) => i.status === 'contacted').length,
    rejected: inquiries.filter((i) => i.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="h-12 w-12 animate-spin text-[#2424B9]" />
          <p className="text-center text-base font-medium text-slate-600 sm:text-lg">
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl">Notifications</h1>
          <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
            Manage course inquiry submissions and track their status.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded border border-red-400 bg-red-100 p-4 text-red-700 sm:flex-row sm:items-center sm:gap-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm sm:text-base">{error}</span>
            <button
              onClick={fetchInquiries}
              className="text-left font-semibold underline hover:text-red-900 sm:ml-auto"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {(['all', 'new', 'contacted', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded px-3 py-2 text-sm font-medium transition-all sm:px-4 sm:text-base ${
                filterStatus === status
                  ? 'bg-[#2424B9] text-white shadow-lg'
                  : 'border border-slate-300 bg-white text-slate-700 hover:border-[#2424B9] hover:text-[#2424B9]'
              }`}
            >
              {formatStatusLabel(status)}
              <span className="ml-2 font-bold">({statusCounts[status]})</span>
            </button>
          ))}
        </div>

        {filteredInquiries.length === 0 ? (
          <div className="rounded border border-slate-200 bg-white py-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-slate-400" />
            <p className="text-lg text-slate-600">No inquiries found</p>
          </div>
        ) : (
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredInquiries.map((inquiry) => (
              <button
                key={inquiry._id}
                type="button"
                onClick={() => setSelectedInquiry(inquiry)}
                className="overflow-hidden rounded border border-slate-200 bg-white text-left shadow-sm transition-all hover:border-[#2424B9] hover:shadow-lg"
              >
                <div className={`h-1.5 ${getStatusColor(inquiry.status).split(' ')[0]}`} />
                <div className="p-4 sm:p-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                        {inquiry.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        {formatDate(inquiry.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex w-fit items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(
                        inquiry.status
                      )}`}
                    >
                      {getStatusIcon(inquiry.status)}
                      <span>{formatStatusLabel(inquiry.status)}</span>
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-slate-600">
                      <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2424B9]" />
                      <span className="min-w-0 break-all text-sm">{inquiry.email}</span>
                    </div>
                    <div className="flex items-start gap-3 text-slate-600">
                      <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2424B9]" />
                      <span className="text-sm">{inquiry.phone}</span>
                    </div>
                    <div className="flex items-start gap-3 text-slate-600">
                      <Book className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2424B9]" />
                      <span className="break-words text-sm">{inquiry.course}</span>
                    </div>
                    <div className="flex items-start gap-3 text-slate-600">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2424B9]" />
                      <span className="text-sm">{inquiry.state}</span>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm text-slate-600">{inquiry.message}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedInquiry && (
          <div className="fixed inset-0 z-50 bg-black/50 p-3 sm:p-4">
            <div className="flex min-h-full items-center justify-center">
              <div className="max-h-[92vh] w-full max-w-2xl mt-18 ml-50 overflow-y-auto rounded-xl bg-white shadow-2xl">
                <div className={`h-1 ${getStatusColor(selectedInquiry.status).split(' ')[0]}`} />
                <div className="p-4 sm:p-6">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="break-words text-xl font-bold text-slate-900 sm:text-2xl">
                        {selectedInquiry.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Submitted: {formatDate(selectedInquiry.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedInquiry(null)}
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-2xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Close inquiry details"
                    >
                      &times;
                    </button>
                  </div>

                  <div
                    className={`mb-6 flex w-fit items-center gap-2 rounded border px-4 py-2 font-semibold ${getStatusColor(
                      selectedInquiry.status
                    )}`}
                  >
                    {getStatusIcon(selectedInquiry.status)}
                    <span>{formatStatusLabel(selectedInquiry.status)}</span>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold uppercase text-slate-500">
                          Email
                        </label>
                        <div className="mt-2 flex items-start gap-2">
                          <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2424B9]" />
                          <p className="break-all text-slate-900">{selectedInquiry.email}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase text-slate-500">
                          Phone
                        </label>
                        <div className="mt-2 flex items-start gap-2">
                          <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2424B9]" />
                          <p className="text-slate-900">{selectedInquiry.phone}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase text-slate-500">
                          Course
                        </label>
                        <div className="mt-2 flex items-start gap-2">
                          <Book className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2424B9]" />
                          <p className="break-words text-slate-900">{selectedInquiry.course}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase text-slate-500">
                          State
                        </label>
                        <div className="mt-2 flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2424B9]" />
                          <p className="text-slate-900">{selectedInquiry.state}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase text-slate-500">
                          Date of Birth
                        </label>
                        <p className="mt-2 text-slate-900">
                          {new Date(selectedInquiry.dob).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase text-slate-500">ID</label>
                        <p className="mt-2 break-all font-mono text-sm text-slate-600">
                          {selectedInquiry._id}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase text-slate-500">
                        Message
                      </label>
                      <p className="mt-2 rounded bg-slate-50 p-4 break-words text-slate-900">
                        {selectedInquiry.message}
                      </p>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span className="text-slate-600">
                        Terms and Conditions{' '}
                        {selectedInquiry.termsAccepted ? 'Accepted' : 'Not Accepted'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedInquiry(null)}
                    className="mt-6 w-full rounded bg-[#2424B9] py-2.5 font-semibold text-white transition-colors hover:bg-blue-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
