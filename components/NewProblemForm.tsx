"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, AlertCircle } from "lucide-react"
import { createProblem } from "@/app/actions/problems"

interface ProblemType {
  id: string
  name: string
  description: string | null
}

interface Equipment {
  id: string
  equipmentMake: string
  equipmentModel: string
  serialNumber: string
  assetTag: string | null
}

interface NewProblemFormProps {
  problemTypes: ProblemType[]
  equipment: Equipment[]
  userId: string
}

const appleGlass = "bg-white/10 backdrop-blur-[40px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)]"

export function NewProblemForm({ problemTypes, equipment, userId }: NewProblemFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createProblem(formData)

      if (result.success && result.problemId) {
        router.push(`/dashboard/problems/${result.problemId}`)
      } else {
        setError(result.error || "Failed to create problem")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="reporterId" value={userId} />

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} className="text-red-400" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-black text-white/40 uppercase tracking-wider mb-2">
          Problem Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          placeholder="Brief description of the issue"
          className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:bg-white/10 focus:border-white/30 focus:outline-none transition-all"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-black text-white/40 uppercase tracking-wider mb-2">
          Detailed Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          placeholder="Provide as much detail as possible about the problem..."
          className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:bg-white/10 focus:border-white/30 focus:outline-none transition-all resize-none"
        />
      </div>

      {/* Priority & Problem Type Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-black text-white/40 uppercase tracking-wider mb-2">
            Priority *
          </label>
          <select
            id="priority"
            name="priority"
            required
            defaultValue="medium"
            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:bg-white/10 focus:border-white/30 focus:outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="low" className="bg-slate-900">Low</option>
            <option value="medium" className="bg-slate-900">Medium</option>
            <option value="high" className="bg-slate-900">High</option>
            <option value="critical" className="bg-slate-900">Critical</option>
          </select>
        </div>

        {/* Problem Type */}
        <div>
          <label htmlFor="problemTypeId" className="block text-sm font-black text-white/40 uppercase tracking-wider mb-2">
            Problem Type *
          </label>
          <select
            id="problemTypeId"
            name="problemTypeId"
            required
            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:bg-white/10 focus:border-white/30 focus:outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="" className="bg-slate-900">Select a type...</option>
            {problemTypes.map((type) => (
              <option key={type.id} value={type.id} className="bg-slate-900">
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Equipment (Optional) */}
      <div>
        <label htmlFor="equipmentId" className="block text-sm font-black text-white/40 uppercase tracking-wider mb-2">
          Related Equipment
          <span className="text-white/20 text-xs ml-2 normal-case font-normal">(Optional)</span>
        </label>
        <select
          id="equipmentId"
          name="equipmentId"
          className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:bg-white/10 focus:border-white/30 focus:outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="" className="bg-slate-900">None / Not applicable</option>
          {equipment.map((item) => (
            <option key={item.id} value={item.id} className="bg-slate-900">
              {item.equipmentMake} {item.equipmentModel} ({item.serialNumber})
            </option>
          ))}
        </select>
      </div>

      {/* File Upload Section */}
      <div>
        <label className="block text-sm font-black text-white/40 uppercase tracking-wider mb-2">
          Attachments
          <span className="text-white/20 text-xs ml-2 normal-case font-normal">(Optional)</span>
        </label>
        <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-white/20 transition-all">
          <Upload size={32} className="mx-auto mb-3 text-white/20" />
          <p className="text-sm text-white/40 mb-2">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-xs text-white/20">
            Screenshots, photos, or documents (Max 10MB per file)
          </p>
          <input
            type="file"
            name="attachments"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="mt-4 inline-block px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            Choose Files
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-4 bg-blue-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Problem"}
        </button>
      </div>
    </form>
  )
}
