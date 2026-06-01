import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";

export default function RemedyDetail() {
  const { id } = useParams();
  const [remedy, setRemedy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRemedy = async () => {
      try {
        const result = await api.getRemedyById(id);
        setRemedy(result.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRemedy();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!remedy) return <p className="text-center mt-10">Remedy not found</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Link to="/" className="text-amber-600 mb-6 inline-block">
        &larr; Back to Home
      </Link>

      <h1 className="text-3xl font-bold mb-4">{remedy.title_en}</h1>

      {remedy.warnings_en && (
        <div className="bg-amber-100 border-l-4 border-amber-500 p-4 mb-6">
          <strong>When to see a doctor:</strong>
          <p>{remedy.warnings_en}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl mb-6">
        <h2 className="font-semibold mb-2">Ingredients</h2>
        <p>{remedy.ingredients_en}</p>
      </div>

      <div className="bg-white p-6 rounded-2xl">
        <h2 className="font-semibold mb-3">Steps</h2>
        <div className="whitespace-pre-line text-gray-700 leading-relaxed">
          {remedy.steps_en}
        </div>
      </div>
    </div>
  );
}
