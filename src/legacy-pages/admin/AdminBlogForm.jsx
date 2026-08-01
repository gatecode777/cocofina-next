'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'react-toastify';
import { getUploadUrl } from '@/lib/imageHelper';
import '@/styles/admin/AdminBlogs.css';
import '@/styles/admin/AdminOrders.css';

// ── Content block types ────────────────────────────────────────────────────────
const BLOCK_TYPES = [
  { value: 'paragraph',      icon: 'fa-align-left',    label: 'Paragraph'     },
  { value: 'heading',        icon: 'fa-heading',       label: 'Heading (H2)'  },
  { value: 'subheading',     icon: 'fa-h3',            label: 'Subheading'    },
  { value: 'bullet_list',    icon: 'fa-list-ul',       label: 'Bullet List'   },
  { value: 'numbered_list',  icon: 'fa-list-ol',       label: 'Numbered List' },
  { value: 'quote',          icon: 'fa-quote-right',   label: 'Blockquote'    },
  { value: 'callout',        icon: 'fa-info-circle',   label: 'Callout Box'   },
  { value: 'table',          icon: 'fa-table',         label: 'Table'         },
  { value: 'divider',        icon: 'fa-minus',         label: 'Divider'       },
];

const emptyBlock = (type = 'paragraph') => ({
  type, text: '', items: [''], tableHeaders: ['', ''], tableRows: [['', '']], _id: Date.now(),
});

// Helper function to get auth token
const tok = () => localStorage.getItem('adminToken');

const LinkEditor = ({ isOpen, onClose, onSave, initialText, initialUrl, initialNewTab }) => {
  const [text, setText] = useState(initialText || '');
  const [url, setUrl] = useState(initialUrl || '');
  const [openInNewTab, setOpenInNewTab] = useState(initialNewTab !== false);

  const handleSave = () => {
    if (!text.trim() || !url.trim()) {
      toast.error('Please enter both link text and URL');
      return;
    }
    onSave({ text: text.trim(), url: url.trim(), openInNewTab });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container link-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add/Edit Link</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Link Text *</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., Click here"
            />
          </div>
          <div className="form-group">
            <label>URL *</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com or /internal-page"
            />
          </div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={openInNewTab}
              onChange={(e) => setOpenInNewTab(e.target.checked)}
            />
            <span>Open in new tab</span>
          </label>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Save Link</button>
        </div>
      </div>
    </div>
  );
};

// ── Block editor ────────────────────────────────────────────────────────────────
const BlockEditor = ({ block, index, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const [showLinkEditor, setShowLinkEditor] = useState(false);
  const [editingLinkIndex, setEditingLinkIndex] = useState(null);
  const [selectedText, setSelectedText] = useState('');

  const update = (patch) => onChange(index, { ...block, ...patch });

  const addListItem = () => update({ items: [...(block.items || ['']), ''] });
  const removeListItem = (i) => update({ items: block.items.filter((_, j) => j !== i) });
  const updateListItem = (i, val) => {
    const items = [...(block.items || [])];
    items[i] = val;
    update({ items });
  };

  const addTableCol = () => {
    update({
      tableHeaders: [...(block.tableHeaders || []), ''],
      tableRows: (block.tableRows || []).map(r => [...r, '']),
    });
  };
  const addTableRow = () => update({ tableRows: [...(block.tableRows || []), new Array((block.tableHeaders || []).length).fill('')] });
  const updateTableHeader = (ci, val) => {
    const h = [...(block.tableHeaders || [])]; h[ci] = val; update({ tableHeaders: h });
  };
  const updateTableCell = (ri, ci, val) => {
    const rows = (block.tableRows || []).map(r => [...r]);
    if (!rows[ri]) rows[ri] = [];
    rows[ri][ci] = val;
    update({ tableRows: rows });
  };

  // Link management functions
  const addLink = () => {
    setEditingLinkIndex(null);
    setSelectedText('');
    setShowLinkEditor(true);
  };

  const editLink = (linkIndex) => {
    setEditingLinkIndex(linkIndex);
    setShowLinkEditor(true);
  };

  const removeLink = (linkIndex) => {
    const links = [...(block.links || [])];
    links.splice(linkIndex, 1);
    update({ links });
    toast.success('Link removed');
  };

  const handleSaveLink = (linkData) => {
    const links = [...(block.links || [])];
    if (editingLinkIndex !== null) {
      links[editingLinkIndex] = linkData;
    } else {
      links.push(linkData);
    }
    update({ links });
    toast.success(editingLinkIndex !== null ? 'Link updated' : 'Link added');
  };

  const renderTextWithLinks = () => {
    const text = block.text || '';
    const links = block.links || [];
    
    if (links.length === 0) return text;
    
    let result = [];
    let lastIndex = 0;
    
    // Sort links by position (if you store position, otherwise simple replacement)
    // For simplicity, we'll do simple string replacement
    const processedText = text;
    if (typeof text !== 'string') return text;
    
    // Simple approach: replace link texts with anchor tags
    // For production, you'd want to store positions or use a proper rich text editor
    return text;
  };

  const BLOCK_COLORS = {
    paragraph: '#6366f1', heading: '#f59e0b', subheading: '#f97316',
    bullet_list: '#10b981', numbered_list: '#3b82f6', quote: '#8b5cf6',
    callout: '#ec4899', table: '#14b8a6', divider: '#9ca3af',
  };
  const color = BLOCK_COLORS[block.type] || '#6b7280';

  return (
    <div className="abf-block">
      <LinkEditor
        isOpen={showLinkEditor}
        onClose={() => setShowLinkEditor(false)}
        onSave={handleSaveLink}
        initialText={editingLinkIndex !== null ? block.links?.[editingLinkIndex]?.text : ''}
        initialUrl={editingLinkIndex !== null ? block.links?.[editingLinkIndex]?.url : ''}
        initialNewTab={editingLinkIndex !== null ? block.links?.[editingLinkIndex]?.openInNewTab : true}
      />
      
      <div className="abf-block-handle" style={{ borderLeft: `3px solid ${color}` }}>
        <div className="abf-block-type-label" style={{ color }}>{block.type.replace('_', ' ')}</div>
        <div className="abf-block-controls">
          <button type="button" onClick={() => onMoveUp(index)}   disabled={isFirst} title="Move up">↑</button>
          <button type="button" onClick={() => onMoveDown(index)} disabled={isLast}  title="Move down">↓</button>
          <button type="button" onClick={() => onRemove(index)}   className="abf-block-del" title="Remove">✕</button>
        </div>
      </div>

      <div className="abf-block-content">
        {/* Text-based blocks with link support */}
        {['paragraph', 'heading', 'subheading', 'quote', 'callout'].includes(block.type) && (
          <>
            <textarea
              rows={block.type === 'paragraph' ? 4 : 2}
              placeholder={
                block.type === 'heading'    ? 'Section heading…'        :
                block.type === 'subheading' ? 'Sub-section heading…'    :
                block.type === 'quote'      ? 'Blockquote text…'        :
                block.type === 'callout'    ? 'Callout / tip text…'     :
                'Paragraph text…'
              }
              value={block.text}
              onChange={(e) => update({ text: e.target.value })}
              className="abf-block-textarea"
            />
            
            {/* Links section for text blocks */}
            <div className="abf-links-section">
              <div className="abf-links-header">
                <span className="abf-links-label">Inline Links</span>
                <button type="button" className="abf-add-link-btn" onClick={addLink}>
                  <i className="fas fa-link"></i> Add Link
                </button>
              </div>
              
              {(block.links || []).length > 0 && (
                <div className="abf-links-list">
                  {(block.links || []).map((link, linkIndex) => (
                    <div key={linkIndex} className="abf-link-item">
                      <div className="abf-link-info">
                        <span className="abf-link-text">{link.text}</span>
                        <span className="abf-link-url">→ {link.url}</span>
                        <span className="abf-link-target">{link.openInNewTab ? '🔗 New Tab' : '📄 Same Tab'}</span>
                      </div>
                      <div className="abf-link-actions">
                        <button type="button" className="abf-link-edit" onClick={() => editLink(linkIndex)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button type="button" className="abf-link-delete" onClick={() => removeLink(linkIndex)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Divider */}
        {block.type === 'divider' && (
          <div className="abf-divider-preview"><hr /></div>
        )}

        {/* Lists - add link support for list items */}
        {['bullet_list', 'numbered_list'].includes(block.type) && (
          <div className="abf-list-editor">
            {(block.items || ['']).map((item, i) => (
              <div key={i} className="abf-list-item-row">
                <span className="abf-list-marker">{block.type === 'numbered_list' ? `${i+1}.` : '•'}</span>
                <input 
                  type="text" 
                  value={item} 
                  placeholder={`Item ${i+1}`}
                  onChange={(e) => updateListItem(i, e.target.value)} 
                />
                {block.items.length > 1 && (
                  <button type="button" className="abf-list-del" onClick={() => removeListItem(i)}>✕</button>
                )}
              </div>
            ))}
            <button type="button" className="abf-add-item" onClick={addListItem}>
              <i className="fas fa-plus"></i> Add item
            </button>
          </div>
        )}

        {/* Table */}
        {block.type === 'table' && (
          <div className="abf-table-editor">
            <div className="abf-table-scroll">
              <table className="abf-table">
                <thead>
                  <tr>
                    {(block.tableHeaders || []).map((h, ci) => (
                      <th key={ci}>
                        <input type="text" value={h} placeholder={`Header ${ci+1}`}
                          onChange={(e) => updateTableHeader(ci, e.target.value)} />
                      </th>
                    ))}
                    <th>
                      <button type="button" className="abf-table-add-col" onClick={addTableCol}>+ Col</button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(block.tableRows || []).map((row, ri) => (
                    <tr key={ri}>
                      {(block.tableHeaders || []).map((_, ci) => (
                        <td key={ci}>
                          <input type="text" value={row[ci] || ''} placeholder="Cell"
                            onChange={(e) => updateTableCell(ri, ci, e.target.value)} />
                        </td>
                      ))}
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="abf-add-item" onClick={addTableRow}>
              <i className="fas fa-plus"></i> Add row
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  Main Form
// ════════════════════════════════════════════════════════════════════════════
const AdminBlogForm = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'author' | 'seo'
  const [coverPreview, setCoverPreview] = useState('');
  const [authorImgPreview, setAuthorImgPreview] = useState('');
  const coverRef = useRef(null);
  const authorImgRef = useRef(null);

  const [form, setForm] = useState({
    title: '', excerpt: '', category: '', tags: '',
    status: 'draft', isFeatured: false,
    coverImageAlt: '',
    authorName: '', authorDesignation: '',
    seoTitle: '', seoDescription: '', seoKeywords: '',
  });
  const [coverFile, setCoverFile] = useState(null);
  const [authorImgFile, setAuthorImgFile] = useState(null);
  const [removeCoverImage, setRemoveCoverImage] = useState(false);
  const [removeAuthorImage, setRemoveAuthorImage] = useState(false);
  const [blocks, setBlocks] = useState([emptyBlock('paragraph')]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/admin/blog-categories', {
          headers: { Authorization: `Bearer ${tok()}` }
        });
        const d = await res.json();
        if (d.success) setCategories(d.categories);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
    if (isEdit) loadBlog();
  }, [id]);

  const loadBlog = async () => {
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        headers: { Authorization: `Bearer ${tok()}` }
      });
      const d = await res.json();
      if (!d.success) { toast.error('Failed to load blog'); return; }
      const b = d.blog;
      setForm({
        title: b.title || '', excerpt: b.excerpt || '',
        category: b.category?._id || '', tags: (b.tags || []).join(', '),
        status: b.status || 'draft', isFeatured: b.isFeatured || false,
        coverImageAlt: b.coverImageAlt || '',
        authorName: b.author?.name || '', authorDesignation: b.author?.designation || '',
        seoTitle: b.seo?.metaTitle || '', seoDescription: b.seo?.metaDescription || '',
        seoKeywords: b.seo?.metaKeywords || '',
      });
      if (b.coverImage) setCoverPreview(getUploadUrl(b.coverImage, 'blogs'));
      if (b.author?.image) setAuthorImgPreview(getUploadUrl(b.author.image, 'profiles'));
      if (b.content?.length) {
        setBlocks(b.content.map((bl, i) => ({ ...bl, _id: Date.now() + i })));
      }
    } catch (err) {
      toast.error('Failed to load blog');
    }
  };

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  // Block ops
  const addBlock = (type) => setBlocks(b => [...b, emptyBlock(type)]);
  const updateBlock = (idx, updated) => setBlocks(b => b.map((bl, i) => i === idx ? updated : bl));
  const removeBlock = (idx) => setBlocks(b => b.filter((_, i) => i !== idx));
  const moveBlock = (idx, dir) => {
    setBlocks(b => {
      const a = [...b];
      const target = idx + dir;
      if (target < 0 || target >= a.length) return a;
      [a[idx], a[target]] = [a[target], a[idx]];
      return a;
    });
  };

  const handleCoverChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
    setRemoveCoverImage(false);
  };

  const handleRemoveCover = (e) => {
    e.stopPropagation();
    setCoverFile(null);
    setCoverPreview('');
    setRemoveCoverImage(true);
    if (coverRef.current) coverRef.current.value = '';
  };
  
  const handleAuthorImgChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setAuthorImgFile(f);
    setAuthorImgPreview(URL.createObjectURL(f));
    setRemoveAuthorImage(false);
  };

  const handleRemoveAuthorImg = (e) => {
    e.stopPropagation();
    setAuthorImgFile(null);
    setAuthorImgPreview('');
    setRemoveAuthorImage(true);
    if (authorImgRef.current) authorImgRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('excerpt', form.excerpt.trim());
      fd.append('category', form.category);
      fd.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
      fd.append('status', form.status);
      fd.append('isFeatured', String(form.isFeatured));
      fd.append('coverImageAlt', form.coverImageAlt.trim());
      fd.append('authorName', form.authorName.trim());
      fd.append('authorDesignation', form.authorDesignation.trim());
      fd.append('content', JSON.stringify(blocks.map(({ _id, ...rest }) => rest)));
      fd.append('seo', JSON.stringify({
        metaTitle: form.seoTitle,
        metaDescription: form.seoDescription,
        metaKeywords: form.seoKeywords,
      }));
      if (coverFile) fd.append('coverImage', coverFile);
      else if (removeCoverImage) fd.append('removeCoverImage', 'true');

      if (authorImgFile) fd.append('authorImage', authorImgFile);
      else if (removeAuthorImage) fd.append('removeAuthorImage', 'true');

      const url = isEdit ? `/api/admin/blogs/${id}` : '/api/admin/blogs';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${tok()}` },
        body: fd,
      });
      const data = await res.json();

      if (data.success) {
        toast.success(isEdit ? 'Blog updated!' : 'Blog created!');
        router.push('/admin/blogs');
      } else {
        toast.error(data.message || 'Failed to save blog');
      }
    } catch (err) {
      toast.error('Server error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-blogs abf-page">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>{isEdit ? 'Edit Blog Post' : 'New Blog Post'}</h1>
            <p>{isEdit ? 'Update your blog content and settings' : 'Create a new blog article'}</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn-secondary" onClick={() => router.push('/admin/blogs')}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving…</> : <><i className="fas fa-save"></i> {isEdit ? 'Update' : 'Publish'}</>}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="abf-form-layout">

          {/* ── LEFT: main content ──────────────────────────────────────── */}
          <div className="abf-main">

            {/* Cover image */}
            <div className="abf-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 className="abf-card-title" style={{ margin: 0 }}>Cover Image</h3>
                {coverPreview && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="abf-btn-action abf-btn-replace"
                      onClick={() => coverRef.current?.click()}
                      title="Replace Cover Image"
                    >
                      <i className="fas fa-sync-alt"></i> Replace Image
                    </button>
                    <button
                      type="button"
                      className="abf-btn-action abf-btn-remove"
                      onClick={handleRemoveCover}
                      title="Remove Cover Image"
                    >
                      <i className="fas fa-trash-alt"></i> Remove Image
                    </button>
                  </div>
                )}
              </div>

              <div className="abf-cover-area" onClick={() => coverRef.current?.click()}>
                {coverPreview
                  ? <img src={coverPreview} alt="Cover preview" className="abf-cover-preview" />
                  : <div className="abf-cover-placeholder">
                      <i className="fas fa-image"></i>
                      <p>Click to upload cover image</p>
                      <small>JPG, PNG — max 5MB</small>
                    </div>
                }
              </div>
              <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverChange} />
              {coverPreview && (
                <div style={{ marginTop: 12 }}>
                  <label className="abf-label">Image Alt Text</label>
                  <input className="abf-input" name="coverImageAlt" value={form.coverImageAlt}
                    onChange={handleInput} placeholder="Describe the image for accessibility" />
                </div>
              )}
            </div>

            {/* Title + Excerpt */}
            <div className="abf-card">
              <div className="form-group">
                <label className="abf-label">Title *</label>
                <input className="abf-input abf-input-title" name="title" value={form.title}
                  onChange={handleInput} placeholder="Blog post title…" required />
              </div>
              <div className="form-group" style={{ marginTop: 14 }}>
                <label className="abf-label">Excerpt <span style={{ color: '#aaa', fontWeight: 400 }}>(shown on listing cards)</span></label>
                <textarea className="abf-input" name="excerpt" value={form.excerpt}
                  onChange={handleInput} placeholder="Brief summary of this article…" rows={3} />
              </div>
            </div>

            {/* Content blocks */}
            <div className="abf-card">
              <div className="abf-content-header">
                <h3 className="abf-card-title" style={{ margin: 0 }}>Content Blocks</h3>
                <span className="abf-block-count">{blocks.length} block{blocks.length !== 1 ? 's' : ''}</span>
              </div>

              <div className="abf-blocks">
                {blocks.map((block, i) => (
                  <BlockEditor
                    key={block._id || i}
                    block={block}
                    index={i}
                    onChange={updateBlock}
                    onRemove={removeBlock}
                    onMoveUp={(idx) => moveBlock(idx, -1)}
                    onMoveDown={(idx) => moveBlock(idx, 1)}
                    isFirst={i === 0}
                    isLast={i === blocks.length - 1}
                  />
                ))}
              </div>

              {/* Add block toolbar */}
              <div className="abf-add-block-bar">
                <span className="abf-add-label">Add block:</span>
                <div className="abf-add-btns">
                  {BLOCK_TYPES.map((bt) => (
                    <button key={bt.value} type="button" className="abf-add-block-btn"
                      onClick={() => addBlock(bt.value)} title={bt.label}>
                      <i className={`fas ${bt.icon}`}></i>
                      <span>{bt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: sidebar ──────────────────────────────────────────── */}
          <div className="abf-sidebar">

            {/* Publish settings */}
            <div className="abf-card">
              <h3 className="abf-card-title">Publish Settings</h3>
              <div className="form-group">
                <label className="abf-label">Status</label>
                <select className="abf-input" name="status" value={form.status} onChange={handleInput}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <label className="abf-checkbox-row">
                <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleInput} />
                <span><i className="fas fa-star" style={{ color: '#f59e0b' }}></i> Feature this post</span>
              </label>
            </div>

            {/* Category & Tags */}
            <div className="abf-card">
              <h3 className="abf-card-title">Category & Tags</h3>
              <div className="form-group">
                <label className="abf-label">Category</label>
                <select className="abf-input" name="category" value={form.category} onChange={handleInput}>
                  <option value="">— No category —</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="abf-label">Tags <small style={{ color: '#aaa' }}>(comma separated)</small></label>
                <input className="abf-input" name="tags" value={form.tags} onChange={handleInput}
                  placeholder="health, nutrition, coconut" />
              </div>
            </div>

            {/* Tabs: Author / SEO */}
            <div className="abf-card">
              <div className="abf-tabs">
                {[['author', 'Author'], ['seo', 'SEO']].map(([tab, label]) => (
                  <button key={tab} type="button"
                    className={`abf-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}>
                    {label}
                  </button>
                ))}
              </div>

              {activeTab === 'author' && (
                <div className="abf-tab-content">
                  {/* Author image */}
                  <div className="abf-author-upload" onClick={() => authorImgRef.current?.click()}>
                    {authorImgPreview
                      ? <img src={authorImgPreview} alt="Author" className="abf-author-img-preview" />
                      : <div className="abf-author-img-ph"><i className="fas fa-user"></i></div>
                    }
                    <div className="abf-author-upload-text">
                      <span>{authorImgPreview ? 'Change Photo' : 'Upload Photo'}</span>
                      <small>JPG, PNG — max 5MB</small>
                    </div>
                  </div>
                  {authorImgPreview && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button
                        type="button"
                        className="abf-btn-action abf-btn-replace"
                        style={{ flex: 1, padding: '5px 8px', fontSize: 12, justifyContent: 'center' }}
                        onClick={() => authorImgRef.current?.click()}
                      >
                        <i className="fas fa-sync-alt"></i> Replace
                      </button>
                      <button
                        type="button"
                        className="abf-btn-action abf-btn-remove"
                        style={{ flex: 1, padding: '5px 8px', fontSize: 12, justifyContent: 'center' }}
                        onClick={handleRemoveAuthorImg}
                      >
                        <i className="fas fa-trash-alt"></i> Remove
                      </button>
                    </div>
                  )}
                  <input ref={authorImgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAuthorImgChange} />

                  <div className="form-group" style={{ marginTop: 12 }}>
                    <label className="abf-label">Author Name</label>
                    <input className="abf-input" name="authorName" value={form.authorName}
                      onChange={handleInput} placeholder="John Deo" />
                  </div>
                  <div className="form-group" style={{ marginTop: 10 }}>
                    <label className="abf-label">Designation</label>
                    <input className="abf-input" name="authorDesignation" value={form.authorDesignation}
                      onChange={handleInput} placeholder="Content Writer" />
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="abf-tab-content">
                  <div className="form-group">
                    <label className="abf-label">Meta Title</label>
                    <input className="abf-input" name="seoTitle" value={form.seoTitle}
                      onChange={handleInput} placeholder="SEO title (50-60 chars)" />
                    <small style={{ color: form.seoTitle.length > 60 ? '#ef4444' : '#aaa' }}>
                      {form.seoTitle.length}/60
                    </small>
                  </div>
                  <div className="form-group" style={{ marginTop: 10 }}>
                    <label className="abf-label">Meta Description</label>
                    <textarea className="abf-input" name="seoDescription" value={form.seoDescription}
                      onChange={handleInput} rows={3} placeholder="160 chars max" />
                    <small style={{ color: form.seoDescription.length > 160 ? '#ef4444' : '#aaa' }}>
                      {form.seoDescription.length}/160
                    </small>
                  </div>
                  <div className="form-group" style={{ marginTop: 10 }}>
                    <label className="abf-label">Meta Keywords</label>
                    <input className="abf-input" name="seoKeywords" value={form.seoKeywords}
                      onChange={handleInput} placeholder="coconut sugar, natural sweetener" />
                  </div>
                </div>
              )}
            </div>

            {/* Save btn */}
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={saving}>
              {saving
                ? <><i className="fas fa-spinner fa-spin"></i> Saving…</>
                : <><i className="fas fa-save"></i> {isEdit ? 'Update Blog' : 'Create Blog'}</>}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminBlogForm;