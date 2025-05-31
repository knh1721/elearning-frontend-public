"use client"

import { useParams, useRouter } from "next/navigation"
import NetflixHeader from "@/components/netflix-header"
import PurchaseDetailComponent from "@/components/user/purchase-detail"

export default function PurchasesDetailPage() {
  const params = useParams()
  const router = useRouter()
  const impUid = params?.id as string

  return (
    <div className="min-h-screen bg-black text-white">
      <NetflixHeader />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <PurchaseDetailComponent impUid={impUid} onBack={() => router.back()} />
        </div>
      </main>
    </div>
  )
}
