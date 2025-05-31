"use client"

import { useEffect, useState } from "react"
import NetflixHeader from "@/components/netflix-header"
import PurchasesComponent from "@/components/user/purchases"

export default function PurchasesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <NetflixHeader />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col gap-8">
          <h1 className="text-2xl font-bold"></h1>
          <PurchasesComponent />
        </div>
      </main>
    </div>
  )
}