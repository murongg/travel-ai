"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import ResultPage from "../page"

export default function ResultByIdPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (mounted && params?.id) {
      // 将id透传为查询参数以复用展示组件
      router.replace(`/result?guideId=${params.id}`)
    }
  }, [mounted, params?.id, router])

  return null
}


