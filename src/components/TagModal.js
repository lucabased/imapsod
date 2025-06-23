'use client';

import { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import Button from './Button';

export default function TagModal({ showTags, setShowTags, tags, fetchTags }) {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#000000');

  if (!showTags) return null;

  const handleAddTag = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTagName, color: newTagColor }),
    });
    if (res.ok) {
      setNewTagName('');
      setNewTagColor('#000000');
      fetchTags();
    }
  };

  const handleDeleteTag = async (tagId) => {
    const res = await fetch(`/api/tags/${tagId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      fetchTags();
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">Manage Tags</h2>
        <div className="flex flex-wrap gap-2 my-2">
          {tags.map(tag => (
            <span
              key={tag._id}
              className="px-2 py-1 rounded-full text-sm cursor-pointer flex items-center"
              style={{ backgroundColor: tag.color, color: 'white' }}
            >
              <span>{tag.name}</span>
              <button onClick={() => handleDeleteTag(tag._id)} className="ml-2 text-xs text-white hover:text-red-500"><FaTrash /></button>
            </span>
          ))}
        </div>
        <form onSubmit={handleAddTag} className="flex gap-2 mt-4">
          <input
            type="text"
            placeholder="New tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="p-1 border rounded"
          />
          <input
            type="color"
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
            className="p-1 border rounded"
          />
          <Button type="submit" className="p-1 bg-blue-600 text-white rounded">Add Tag</Button>
        </form>
        <div className="flex justify-end mt-4">
          <Button type="button" onClick={() => setShowTags(false)} className="bg-gray-200 text-black">Close</Button>
        </div>
      </div>
    </div>
  );
}
