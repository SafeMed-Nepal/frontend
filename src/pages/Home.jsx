import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const symptoms = [
  { label: 'Headache', tag: 'headache' },
  { label: 'Cough', tag: 'cough' },
  { label: 'Cold', tag: 'cold' },
  { label: 'Fever', tag: 'fever' },
  { label: 'Acidity', tag: 'acidity' },
  { label: 'Back Pain', tag: 'backPain' },
  { label: 'Sore Throat', tag: 'soreThroat' },
];

export default function Home() {
  const [remedies, setRemedies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRemedies = async (symptom = null) => {
    setLoading(true);
    try {
      const result = await api.getRemedies(symptom);
      setRemedies(result.data || []);
    } catch (err) {
      console.error(err);
      setRemedies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemedies();
  }, []);

  const handleSymptomClick = (tag) => {
    fetchRemedies(tag);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-4xl font-bold text-center text-amber-600 mb-8">SafeMed Nepal</h1>

      <input
        type="text"
        placeholder="Search symptoms or remedies..."
        className="w-full p-4 rounded-xl border border-gray-300 mb-6 text-lg"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="flex flex-wrap gap-2 mb-8">
        {symptoms.map((sym) => (
          <button
            key={sym.tag}
            onClick={() => handleSymptomClick(sym.tag)}
            className="px-5 py-2 bg-white border border-amber-200 hover:bg-amber-100 rounded-full text-sm font-medium"
          >
            {sym.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center">Loading remedies...</p>
      ) : (
        <div className="space-y-4">
          {remedies.map((remedy) => (
            <Link
              key={remedy.id}
              to={`/remedy/${remedy.id}`}
              className="block bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-100"
            >
              <h3 className="text-xl font-semibold mb-2">{remedy.title_en}</h3>
              <p className="text-gray-600 line-clamp-2">{remedy.description_en}</p>
              <div className="mt-3 flex gap-2">
                {remedy.symptom_tags?.slice(0, 2).map((tag, i) => (
                  <span key={i} className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}