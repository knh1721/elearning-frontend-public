"use client"


import useUserStore from "@/app/auth/userStore"
import {FloatingContactButton} from "@/components/chat/floating-contact-button";


export default function FloatingContactButtonWrapper() {
  const { user } = useUserStore()

  if (!user) return null

  return <FloatingContactButton/>
}