import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../lib/api";

export default function Admin() {
  const { i18n } = useTranslation();
  const [remedies, setRemedies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedRemedy, setSelectedRemedy] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [newRemedy, setNewRemedy] = useState({
    title_en: "",
    title_ne: "",
    description_en: "",
    description_ne: "",
    ingredients_en: "",
    ingredients_ne: "",
    steps_en: "",
    steps_ne: "",
    precautions_en: "",
    warnings_en: "",
    symptom_tags: "",
  });

  const fetchRemedies = async () => {
    setLoading(true);
    try {
      const result = await api.getRemedies();
      // backend returns { success: true, data: [...] }
      setRemedies(result.data || []);
      if (!result.data) console.warn('No data field in getRemedies response:', result);
    } catch (err) {
      console.error('Admin fetchRemedies error:', err);
      setRemedies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemedies();
  }, []);

  const updateRemedyStatus = async (id, newStatus) => {
    setActionLoading(true);
    try {
      await api.updateRemedyStatus(id, newStatus, "Rishav Admin");
      alert(`✅ Successfully marked as ${newStatus}`);
      setSelectedRemedy(null);
      fetchRemedies();
    } catch (err) {
      alert(`Failed to update: ${err.message || "Unknown error"}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddRemedy = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const tagsArray = newRemedy.symptom_tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await api.createRemedy({
          ...newRemedy,
          symptom_tags: tagsArray,
          status: "draft",
      });

      alert("✅ New remedy added as Draft!");
      setShowAddForm(false);
      setNewRemedy({
        title_en: "",
        title_ne: "",
        description_en: "",
        description_ne: "",
        ingredients_en: "",
        ingredients_ne: "",
        steps_en: "",
        steps_ne: "",
        precautions_en: "",
        warnings_en: "",
        symptom_tags: "",
      });
      fetchRemedies();
    } catch (err) {
      alert(`Failed to add remedy: ${err.message || "Unknown error"}`);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRemedies = remedies.filter(
    (r) => filter === "all" || r.status === filter,
  );

  const getField = (en, ne) => (i18n.language === "ne" && ne ? ne : en);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-amber-700">
          SafeMed Nepal - Reviewer Dashboard
        </h1>
        <div className="flex gap-3">
          <button
            onClick={fetchRemedies}
            className="px-6 py-2 bg-gray-600 text-white rounded-xl"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-2 bg-amber-600 text-white rounded-xl font-semibold"
          >
            + Add New Remedy
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "draft", "needs_revision", "published", "rejected"].map(
          (s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-6 py-2 rounded-full capitalize ${filter === s ? "bg-amber-600 text-white" : "bg-white border"}`}
            >
              {s.replace("_", " ")}
            </button>
          ),
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Remedies List */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl shadow-sm divide-y">
            {loading ? (
              <p className="p-12 text-center">Loading...</p>
            ) : (
              filteredRemedies.map((remedy) => (
                <div
                  key={remedy.id}
                  onClick={() => setSelectedRemedy(remedy)}
                  className="p-6 hover:bg-amber-50 cursor-pointer"
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {getField(remedy.title_en, remedy.title_ne)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {getField(remedy.description_en, remedy.description_ne)}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-1 text-xs rounded-full self-start ${remedy.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      {remedy.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Review Panel */}
        <div className="lg:col-span-5">
          {selectedRemedy ? (
            <div className="bg-white rounded-3xl shadow-sm p-6 sticky top-6 max-h-[85vh] overflow-auto">
              {/* Full remedy content display (same as before) */}
              <h2 className="font-bold text-xl mb-4">Reviewing Remedy</h2>
              <h3 className="text-2xl font-semibold">
                {getField(selectedRemedy.title_en, selectedRemedy.title_ne)}
              </h3>
              <p className="text-gray-600 mt-2">
                {getField(
                  selectedRemedy.description_en,
                  selectedRemedy.description_ne,
                )}
              </p>

              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="font-semibold">Ingredients</h4>
                  <p className="bg-gray-50 p-4 rounded-2xl">
                    {getField(
                      selectedRemedy.ingredients_en,
                      selectedRemedy.ingredients_ne,
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Steps</h4>
                  <div className="bg-gray-50 p-4 rounded-2xl whitespace-pre-line">
                    {getField(selectedRemedy.steps_en, selectedRemedy.steps_ne)}
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  onClick={() =>
                    updateRemedyStatus(selectedRemedy.id, "published")
                  }
                  className="w-full py-4 bg-green-600 text-white rounded-2xl font-semibold"
                >
                  ✅ Approve & Publish
                </button>
                <button
                  onClick={() =>
                    updateRemedyStatus(selectedRemedy.id, "needs_revision")
                  }
                  className="w-full py-4 bg-amber-600 text-white rounded-2xl font-semibold"
                >
                  ✏️ Request Revision
                </button>
                <button
                  onClick={() =>
                    updateRemedyStatus(selectedRemedy.id, "rejected")
                  }
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-semibold"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-500">
              Select a remedy to review
            </div>
          )}
        </div>
      </div>

      {/* Add New Remedy Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-auto p-8">
            <h2 className="text-2xl font-bold mb-6">Add New Remedy</h2>

            <form onSubmit={handleAddRemedy} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Title (English) *"
                  value={newRemedy.title_en}
                  onChange={(e) =>
                    setNewRemedy({ ...newRemedy, title_en: e.target.value })
                  }
                  className="p-4 border rounded-2xl"
                  required
                />
                <input
                  type="text"
                  placeholder="Title (Nepali)"
                  value={newRemedy.title_ne}
                  onChange={(e) =>
                    setNewRemedy({ ...newRemedy, title_ne: e.target.value })
                  }
                  className="p-4 border rounded-2xl"
                />
              </div>

              <textarea
                placeholder="Description (English) *"
                value={newRemedy.description_en}
                onChange={(e) =>
                  setNewRemedy({ ...newRemedy, description_en: e.target.value })
                }
                className="w-full p-4 border rounded-2xl h-24"
                required
              />

              <textarea
                placeholder="Description (Nepali)"
                value={newRemedy.description_ne}
                onChange={(e) =>
                  setNewRemedy({ ...newRemedy, description_ne: e.target.value })
                }
                className="w-full p-4 border rounded-2xl h-24"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea
                  placeholder="Ingredients (English)"
                  value={newRemedy.ingredients_en}
                  onChange={(e) =>
                    setNewRemedy({
                      ...newRemedy,
                      ingredients_en: e.target.value,
                    })
                  }
                  className="p-4 border rounded-2xl h-28"
                />
                <textarea
                  placeholder="Ingredients (Nepali)"
                  value={newRemedy.ingredients_ne}
                  onChange={(e) =>
                    setNewRemedy({
                      ...newRemedy,
                      ingredients_ne: e.target.value,
                    })
                  }
                  className="p-4 border rounded-2xl h-28"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea
                  placeholder="Steps (English)"
                  value={newRemedy.steps_en}
                  onChange={(e) =>
                    setNewRemedy({ ...newRemedy, steps_en: e.target.value })
                  }
                  className="p-4 border rounded-2xl h-32"
                  required
                />
                <textarea
                  placeholder="Steps (Nepali)"
                  value={newRemedy.steps_ne}
                  onChange={(e) =>
                    setNewRemedy({ ...newRemedy, steps_ne: e.target.value })
                  }
                  className="p-4 border rounded-2xl h-32"
                />
              </div>

              <input
                type="text"
                placeholder="Symptom Tags (comma separated) e.g. fever,cough"
                value={newRemedy.symptom_tags}
                onChange={(e) =>
                  setNewRemedy({ ...newRemedy, symptom_tags: e.target.value })
                }
                className="w-full p-4 border rounded-2xl"
              />

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-semibold"
                >
                  {actionLoading ? "Saving..." : "Save as Draft"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 rounded-2xl font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
