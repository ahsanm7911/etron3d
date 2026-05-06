import React, { useEffect, useState, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import api from '../utils/api';

const STATUS_META = {
  completed: {
    label: 'Completed',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50',
  },
  processing: {
    label: 'Processing',
    dot: 'bg-blue-400 animate-pulse',
    badge: 'bg-blue-900/40 text-blue-300 border border-blue-700/50',
  },
  pending: {
    label: 'Pending',
    dot: 'bg-yellow-400 animate-pulse',
    badge: 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/50',
  },
  failed: {
    label: 'Failed',
    dot: 'bg-red-400',
    badge: 'bg-red-900/40 text-red-300 border border-red-700/50',
  },
};

const FILTERS = ['all', 'completed', 'processing', 'pending', 'failed'];

function ModelCard({ model, index }) {
  const meta = STATUS_META[model.status] ?? STATUS_META.pending;
  const [imgError, setImgError] = useState(false);

  const formattedDate = new Date(model.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = new Date(model.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative flex flex-col bg-gray-900 border border-gray-700/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-blue-900/30 hover:shadow-2xl hover:border-gray-600 transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-square bg-gray-800 overflow-hidden">
        {!imgError && model.input_image ? (
          <img
            src={model.input_image}
            alt={`Model #${model.id}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-14 h-14 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status badge */}
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </div>

        {/* Download button appears on hover */}
        {model.status === 'completed' && model.model_file && (
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <a
              href={model.model_file}
              download
              className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
              onClick={e => e.stopPropagation()}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download .glb
            </a>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-100 truncate">
            Asset #{String(model.id).padStart(4, '0')}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formattedDate} · {formattedTime}
        </div>

        {model.task_id && (
          <p className="text-xs text-gray-600 font-mono truncate" title={model.task_id}>
            Task: {model.task_id.slice(0, 16)}…
          </p>
        )}

        {model.status === 'failed' && (
          <p className="text-xs text-red-400 mt-auto">Generation failed. Try again.</p>
        )}
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-gray-900 border border-gray-700/60 animate-pulse">
      <div className="aspect-square bg-gray-800" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 w-24 bg-gray-800 rounded" />
        <div className="h-3 w-32 bg-gray-800 rounded" />
        <div className="h-3 w-20 bg-gray-800 rounded" />
      </div>
    </div>
  );
}

export default function AssetsPage() {
  const { user } = useContext(AppContext);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  const fetchModels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/generation/assets/', {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      console.log("RAW RESPONSE: ", res)
      if (res.status !== 200) throw new Error(`Server error: ${res.status}`);
      const data = res.data;
      setModels(data.models ?? []);
    } catch (err) {
      console.log("ERR: ", err)
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const filtered = models
    .filter(m => {
      const matchesFilter = activeFilter === 'all' || m.status === activeFilter;
      const matchesSearch = searchQuery === '' || String(m.id).includes(searchQuery) || (m.task_id ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      return new Date(a.created_at) - new Date(b.created_at);
    });

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'all' ? models.length : models.filter(m => m.status === f).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pt-24 pb-32 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-300 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight">My Assets</h1>
          </div>
          <p className="text-gray-400 text-sm ml-8">
            All your generated 3D models in one place
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
        >
          {[
            { label: 'Total', value: counts.all, color: 'text-gray-100' },
            { label: 'Completed', value: counts.completed, color: 'text-emerald-400' },
            { label: 'Processing', value: counts.processing + counts.pending, color: 'text-blue-400' },
            { label: 'Failed', value: counts.failed, color: 'text-red-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 border border-gray-700/60 rounded-xl px-4 py-3 flex flex-col gap-1">
              <span className={`text-2xl font-extrabold ${stat.color}`}>{loading ? '–' : stat.value}</span>
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by ID or task…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-700/60 rounded-xl text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className="px-4 py-2.5 bg-gray-900 border border-gray-700/60 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-blue-600 transition-colors cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>

          {/* Refresh */}
          <button
            onClick={fetchModels}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border border-gray-700/60 rounded-xl text-sm text-gray-300 hover:border-gray-500 hover:text-gray-100 disabled:opacity-50 transition-all"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>

          {/* New generation CTA */}
          <Link
            to="/upload"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold text-white transition-colors shadow-lg shadow-blue-900/30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Model
          </Link>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeFilter === f
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'bg-transparent border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {!loading && (
                <span className={`ml-2 text-xs ${activeFilter === f ? 'text-blue-200' : 'text-gray-600'}`}>
                  {counts[f]}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-red-400 font-medium">{error}</p>
            <button onClick={fetchModels} className="text-sm text-blue-400 hover:underline">Try again</button>
          </motion.div>
        )}

        {/* Loading skeleton */}
        {loading && !error && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-5 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-gray-900 border border-gray-700/60 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            </div>
            <div>
              <p className="text-gray-300 font-semibold text-lg">No assets found</p>
              <p className="text-gray-600 text-sm mt-1">
                {activeFilter !== 'all' || searchQuery
                  ? 'Try adjusting your filters or search query.'
                  : "You haven't generated any 3D models yet."}
              </p>
            </div>
            {activeFilter === 'all' && !searchQuery && (
              <Link
                to="/upload"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold text-white transition-colors"
              >
                Generate your first model →
              </Link>
            )}
          </motion.div>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && (
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
            >
              {filtered.map((model, i) => (
                <ModelCard key={model.id} model={model} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Footer count */}
        {!loading && !error && filtered.length > 0 && (
          <p className="text-center text-xs text-gray-600 mt-10">
            Showing {filtered.length} of {models.length} asset{models.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
