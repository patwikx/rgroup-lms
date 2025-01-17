"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function StatusFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState(searchParams.get('status') || '')

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (status) {
      params.set('status', status)
    } else {
      params.delete('status')
    }
    router.push(`?${params.toString()}`)
  }, [status, router, searchParams])

  return (
    <Select value={status} onValueChange={setStatus}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">All Statuses</SelectItem>
        <SelectItem value="APPROVED">Approved</SelectItem>
        <SelectItem value="REJECTED">Rejected</SelectItem>
      </SelectContent>
    </Select>
  )
}
